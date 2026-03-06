import fetch from 'node-fetch';

const PAYPAL_BASE = process.env.PAYPAL_ENVIRONMENT === 'live'
  ? 'https://api.paypal.com'
  : 'https://api.sandbox.paypal.com';

interface PaypalResult {
  success: boolean;
  orderId?: string;
  links?: any[];
  status?: string;
  id?: string;
  error?: string;
  approvalUrl?: string;
}

async function getPaypalToken(): Promise<string> {
  const credentials = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID!}:${process.env.PAYPAL_CLIENT_SECRET!}`
  ).toString('base64');

  const resp = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
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
 * @param amount - The amount in cents (converted to dollars for PayPal)
 * @param currency - The currency code
 */
async function processPaypalPayment(amount: number, currency: string): Promise<PaypalResult> {
  try {
    const token = await getPaypalToken();
    const resp = await fetch(`${PAYPAL_BASE}/v2/checkout/orders`, {
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

async function capturePaypalPayment(orderId: string): Promise<PaypalResult> {
  try {
    const token = await getPaypalToken();
    const resp = await fetch(`${PAYPAL_BASE}/v2/checkout/orders/${orderId}/capture`, {
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