// import fetch from 'node-fetch';

interface PaypalResult {
  success: boolean;
  orderId?: string;
  links?: any[];
  status?: string;
  id?: string;
  error?: string;
  approvalUrl?: string;
}

// Singleton PayPal token cache
const paypalTokenCache = new Map<string, { token: string; expires: number }>();

function getPaypalBaseUrl(environment: string): string {
  return environment === 'live'
    ? 'https://api.paypal.com'
    : 'https://api.sandbox.paypal.com';
}

function getCacheKey(clientId: string, environment: string): string {
  return `${clientId}-${environment}`;
}

async function getPaypalToken(paypalBase: string, clientId: string, clientSecret: string, environment: string): Promise<string> {
  const cacheKey = getCacheKey(clientId, environment);
  const cached = paypalTokenCache.get(cacheKey);

  // Return cached token if still valid (with 5 minute buffer)
  if (cached && cached.expires > Date.now() + 300000) {
    return cached.token;
  }

  const credentials = Buffer.from(
    `${clientId}:${clientSecret}`
  ).toString('base64');

  const resp = await fetch(`${paypalBase}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: 'grant_type=client_credentials'
  });
  const data: any = await resp.json();

  if (!resp.ok) {
    throw new Error(`PayPal token error: ${data.error_description || data.error}`);
  }

  // Cache token (expires in 9 hours according to PayPal, but we use 8 hours for safety)
  paypalTokenCache.set(cacheKey, {
    token: data.access_token,
    expires: Date.now() + (8 * 60 * 60 * 1000)
  });

  return data.access_token;
}

/**
 * Validates payment amount and currency for PayPal
 */
function validatePaypalPaymentParams(amount: number, currency: string): void {
  if (amount <= 0) {
    throw new Error('Amount must be greater than 0');
  }

  // PayPal expects amounts in dollars (not cents like Stripe)
  if (amount < 0.01) {
    throw new Error('Amount must be at least 0.01');
  }

  const supportedCurrencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD'];
  if (!supportedCurrencies.includes(currency.toUpperCase())) {
    throw new Error(`Unsupported currency: ${currency}`);
  }
}

/**
 * Processes a payment using PayPal by creating an order.
 * @param paypalEnvironment - The PayPal environment ('live' or 'sandbox')
 * @param paypalClientId - The PayPal client ID
 * @param paypalClientSecret - The PayPal client secret
 * @param amount - The amount in dollars (not cents)
 * @param currency - The currency code
 * @param frontendBaseUrl - The base URL for frontend success/cancel pages
 */
async function processPaypalPayment(paypalEnvironment: string, paypalClientId: string, paypalClientSecret: string, amount: number, currency: string, frontendBaseUrl: string): Promise<PaypalResult> {
  try {
    validatePaypalPaymentParams(amount, currency);

    const paypalBase = getPaypalBaseUrl(paypalEnvironment);
    const token = await getPaypalToken(paypalBase, paypalClientId, paypalClientSecret, paypalEnvironment);

    const resp = await fetch(`${paypalBase}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        application_context: {
          return_url: `${frontendBaseUrl}/paypal/success`,
          cancel_url: `${frontendBaseUrl}/paypal/cancel`
        },
        purchase_units: [{
          amount: {
            currency_code: currency.toUpperCase(),
            value: amount.toFixed(2)
          }
        }]
      })
    });
    const order: any = await resp.json();

    if (resp.ok) {
      // look for approval link in the HATEOAS links array so callers can
      // redirect the user immediately
      const approveLink = (order.links || []).find((l: any) => l.rel === 'approve');
      return {
        success: true,
        orderId: order.id,
        links: order.links,
        approvalUrl: approveLink ? approveLink.href : undefined,
        status: order.status
      };
    } else {
      return { success: false, error: JSON.stringify(order) };
    }
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

async function capturePaypalPayment(paypalEnvironment: string, paypalClientId: string, paypalClientSecret: string, orderId: string): Promise<PaypalResult> {
  const paypalBase = getPaypalBaseUrl(paypalEnvironment);
  try {
    const token = await getPaypalToken(paypalBase, paypalClientId, paypalClientSecret, paypalEnvironment);
    const resp = await fetch(`${paypalBase}/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    const result: any = await resp.json();
    if (resp.ok) {
      return { success: true, status: result.status, id: result.id };
    } else {
      return { success: false, error: JSON.stringify(result) };
    }
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export { processPaypalPayment, capturePaypalPayment };