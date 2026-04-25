import { stkService } from '../mpesa/stk/stk.service';
import { Env } from '../index';

export async function handleSTKRoutes(request: Request, env: Env, path: string): Promise<Response> {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Handle STK push endpoint
  if (request.method === 'POST' && path === '/api/stk/push') {
    try {
      const body = await request.json();
      const { mobileNumber, amount, accountReference, transactionDescription, callbackUrl, cancelUrl } = body;

      if (!mobileNumber || !amount || !accountReference) {
        return new Response(JSON.stringify({
          error: 'Validation Error',
          message: 'Mobile number, amount, and account reference are required',
          required: ['mobileNumber', 'amount', 'accountReference']
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Validate mobile number format
      const formattedNumber = mobileNumber.startsWith('254') 
        ? mobileNumber 
        : mobileNumber.replace(/^0/, '254');

      if (!/^254\d{9}$/.test(formattedNumber)) {
        return new Response(JSON.stringify({
          error: 'Validation Error',
          message: 'Invalid mobile number format. Use 254XXXXXXXXX or 0XXXXXXXXX',
          example: '254712345678'
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Validate amount
      if (typeof amount !== 'number' || amount <= 0 || amount > 150000) {
        return new Response(JSON.stringify({
          error: 'Validation Error',
          message: 'Amount must be a number between 1 and 150,000 KES',
          min: 1,
          max: 150000
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Validate callback URL if provided
      if (callbackUrl) {
        try {
          new URL(callbackUrl);
        } catch (e) {
          return new Response(JSON.stringify({
            error: 'Validation Error',
            message: 'Invalid callback URL format',
            example: 'https://your-app.com/webhooks/mpesa'
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
      }

      // Validate cancel URL if provided
      if (cancelUrl) {
        try {
          new URL(cancelUrl);
        } catch (e) {
          return new Response(JSON.stringify({
            error: 'Validation Error',
            message: 'Invalid cancel URL format',
            example: 'https://your-app.com/webhooks/mpesa/cancel'
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
      }

      const result = await stkService.initiateSTKPush(env, {
        mobileNumber: formattedNumber,
        amount,
        accountReference,
        transactionDesc: transactionDescription || 'Payment',
        callbackUrl,
        cancelUrl
      }, request);

      return new Response(JSON.stringify({
        success: true,
        message: 'STK push initiated successfully',
        data: result,
        callbackUrlRegistered: !!callbackUrl,
        cancelUrlRegistered: !!cancelUrl,
        timestamp: new Date().toISOString()
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } catch (error) {
      console.error('STK route error:', error);

      return new Response(JSON.stringify({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Failed to initiate STK push',
        timestamp: new Date().toISOString()
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }

  // Handle STK query endpoint (POST with checkoutRequestId in body)
  if (request.method === 'POST' && path === '/api/stk/query') {
    try {
      const body = await request.json();
      const { checkoutRequestId } = body;

      if (!checkoutRequestId) {
        return new Response(JSON.stringify({
          error: 'Validation Error',
          message: 'Checkout Request ID is required',
          required: ['checkoutRequestId'],
          example: { checkoutRequestId: 'ws_CO_123456789' }
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const result = await stkService.querySTKPush(env, {
        checkoutRequestId
      });

      return new Response(JSON.stringify({
        success: true,
        message: 'STK transaction status retrieved',
        data: result,
        timestamp: new Date().toISOString()
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } catch (error) {
      console.error('STK query error:', error);

      return new Response(JSON.stringify({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Failed to query STK status',
        timestamp: new Date().toISOString()
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }

  // Handle STK status query endpoint (GET with conversationId in path)
  if (request.method === 'GET' && path.startsWith('/api/stk/status/')) {
    try {
      const conversationId = path.split('/api/stk/status/')[1];

      if (!conversationId) {
        return new Response(JSON.stringify({
          error: 'Validation Error',
          message: 'Conversation ID is required',
          example: '/api/stk/status/AG_20231212_1234567890'
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const result = await stkService.queryStatus(env, conversationId);

      if (!result.success) {
        return new Response(JSON.stringify(result), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      return new Response(JSON.stringify({
        success: true,
        message: 'STK transaction status retrieved',
        data: result,
        timestamp: new Date().toISOString()
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } catch (error) {
      console.error('STK status error:', error);

      return new Response(JSON.stringify({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Failed to query STK status',
        timestamp: new Date().toISOString()
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }

  // Method not allowed for this path
  return new Response(JSON.stringify({
    error: 'Method not allowed',
    message: `Method ${request.method} not allowed for ${path}. Supported methods: POST /api/stk/push, POST /api/stk/query, GET /api/stk/status/:conversationId`,
    availableEndpoints: [
      'POST /api/stk/push',
      'POST /api/stk/query',
      'GET /api/stk/status/{conversationId}'
    ]
  }), {
    status: 405,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}
