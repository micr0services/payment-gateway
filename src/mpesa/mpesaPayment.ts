import retry from 'async-retry';

export interface MpesaSTKRequest {
  mobileNumber: string;
  amount: number;
  accountReference: string;
  transactionDesc?: string;
  callbackUrl?: string;
  cancelUrl?: string;
}

export interface MpesaSTKStatusRequest {
  checkoutRequestId: string;
}

function formatPhoneNumber(phoneNumber: string): string {
  if (phoneNumber.startsWith('0')) {
    return `254${phoneNumber.slice(1)}`;
  }
  if (phoneNumber.startsWith('+')) {
    return phoneNumber.replace(/^\+/, '');
  }
  return phoneNumber;
}

function getMpesaBaseUrl(environment: string): string {
  return environment === 'production'
    ? 'https://api.safaricom.co.ke'
    : 'https://sandbox.safaricom.co.ke';
}

function getMpesaPassword(shortcode: string, passkey: string, timestamp: string): string {
  return btoa(`${shortcode}${passkey}${timestamp}`);
}

async function getResponseBody(response: any): Promise<string> {
  try {
    return await response.text();
  } catch {
    try {
      return JSON.stringify(await response.json());
    } catch {
      return '';
    }
  }
}

async function getMpesaAccessToken(env: any): Promise<string> {
  const auth = btoa(`${env.MPESA_CONSUMER_KEY}:${env.MPESA_CONSUMER_SECRET}`);
  const response = await fetch(`${getMpesaBaseUrl(env.MPESA_ENVIRONMENT)}/oauth/v1/generate?grant_type=client_credentials`, {
    method: 'GET',
    headers: {
      Authorization: `Basic ${auth}`,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    const body = await getResponseBody(response);
    throw new Error(`M-Pesa token request failed: ${response.status} ${response.statusText} ${body}`);
  }

  const data = await response.json();
  if (!data.access_token) {
    throw new Error(`M-Pesa authentication response invalid: ${JSON.stringify(data)}`);
  }

  return data.access_token;
}

async function mpesaApiRequest(env: any, endpoint: string, payload: any): Promise<any> {
  const token = await getMpesaAccessToken(env);
  const baseUrl = getMpesaBaseUrl(env.MPESA_ENVIRONMENT);
  const endpointMap: Record<string, string> = {
    stk_push: '/mpesa/stkpush/v1/processrequest',
    stk_query: '/mpesa/stkpushquery/v1/query',
  };
  const apiEndpoint = endpointMap[endpoint];

  if (!apiEndpoint) {
    throw new Error(`Unsupported M-Pesa endpoint: ${endpoint}`);
  }

  const response = await fetch(`${baseUrl}${apiEndpoint}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) {
    const body = await getResponseBody(response).catch(() => JSON.stringify(data));
    throw new Error(`M-Pesa ${endpoint} request failed: ${response.status} ${response.statusText} ${body}`);
  }

  return data;
}

export async function initiateMpesaSTKPush(env: any, request: MpesaSTKRequest): Promise<any> {
  if (!request.mobileNumber || !request.amount || !request.accountReference) {
    throw new Error('mobileNumber, amount, and accountReference are required');
  }

  const formattedNumber = formatPhoneNumber(request.mobileNumber);
  const timestamp = new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 14);
  const password = getMpesaPassword(env.MPESA_SHORTCODE, env.MPESA_PASSKEY, timestamp);

  const payload = {
    BusinessShortCode: env.MPESA_SHORTCODE,
    Password: password,
    Timestamp: timestamp,
    TransactionType: 'CustomerPayBillOnline',
    Amount: Math.floor(request.amount),
    PartyA: formattedNumber,
    PartyB: env.MPESA_SHORTCODE,
    PhoneNumber: formattedNumber,
    CallBackURL: env.MPESA_STK_CALLBACK_URL,
    AccountReference: request.accountReference,
    TransactionDesc: request.transactionDesc || 'Payment',
  };

  const response = await retry(async () => {
    try {
      const result = await mpesaApiRequest(env, 'stk_push', payload);
      if (!result || result.ResponseCode !== '0') {
        throw new Error(`M-Pesa STK push failed: ${JSON.stringify(result)}`);
      }
      return result;
    } catch (error: any) {
      const message = error?.message?.startsWith('M-Pesa stk_push request failed')
        ? error.message
        : `M-Pesa stk_push request failed: ${error?.message ?? 'Unknown error'}`;
      throw new Error(message);
    }
  }, {
    retries: 3,
    factor: 1.5,
    minTimeout: 500,
    onRetry: (error, attempt) => {
      console.warn(`Retrying M-Pesa STK push attempt ${attempt}:`, (error as Error).message);
    },
  });

  return {
    merchantRequestId: response.MerchantRequestID,
    checkoutRequestId: response.CheckoutRequestID,
    responseCode: response.ResponseCode,
    responseDescription: response.ResponseDescription,
    customerMessage: response.CustomerMessage,
  };
}

export async function queryMpesaSTKStatus(env: any, checkoutRequestId: string): Promise<any> {
  if (!checkoutRequestId) {
    throw new Error('checkoutRequestId is required');
  }

  const timestamp = new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 14);
  const password = getMpesaPassword(env.MPESA_SHORTCODE, env.MPESA_PASSKEY, timestamp);

  const payload = {
    BusinessShortCode: env.MPESA_SHORTCODE,
    Password: password,
    Timestamp: timestamp,
    CheckoutRequestID: checkoutRequestId,
  };

  const response = await retry(async () => {
    const result = await mpesaApiRequest(env, 'stk_query', payload);
    if (!result) {
      throw new Error('Empty M-Pesa STK query response');
    }
    return result;
  }, {
    retries: 2,
    factor: 1.5,
    minTimeout: 300,
  });

  return {
    merchantRequestId: response.MerchantRequestID,
    checkoutRequestId: response.CheckoutRequestID,
    responseCode: response.ResponseCode,
    responseDescription: response.ResponseDescription,
    resultCode: response.ResultCode,
    resultDesc: response.ResultDesc,
  };
}
