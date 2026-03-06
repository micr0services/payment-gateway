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

function getPaypalBaseUrl(environment: string): string {
  return environment === 'live'
    ? 'https://api.paypal.com'
    : 'https://api.sandbox.paypal.com';
}

async function getPaypalToken(paypalBase: string, clientId: string, clientSecret: string): Promise<string> {
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
  return data.access_token;
}

/**
 * Processes a payment using PayPal by creating an order.
 * @param paypalEnvironment - The PayPal environment ('live' or 'sandbox')
 * @param paypalClientId - The PayPal client ID
 * @param paypalClientSecret - The PayPal client secret
 * @param amount - The amount in cents (converted to dollars for PayPal)
 * @param currency - The currency code
 */
async function processPaypalPayment(paypalEnvironment: string, paypalClientId: string, paypalClientSecret: string, amount: number, currency: string): Promise<PaypalResult> {
  const paypalBase = getPaypalBaseUrl(paypalEnvironment);
  try {
    const token = await getPaypalToken(paypalBase, paypalClientId, paypalClientSecret);
    const resp = await fetch(`${paypalBase}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [{
          amount: {
            currency_code: currency,
            value: (amount / 100).toFixed(2)
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
    const token = await getPaypalToken(paypalBase, paypalClientId, paypalClientSecret);
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