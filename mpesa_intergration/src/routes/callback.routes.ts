import { Env } from '../index';

export async function handleCallbackRoutes(request: Request, env: Env, path: string): Promise<Response> {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({
      error: 'Method not allowed',
      message: `Method ${request.method} not allowed for callbacks`
    }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  try {
    const body = await request.json();
    
    console.log(`M-Pesa callback received for ${path}:`, JSON.stringify(body, null, 2));

    // Handle different callback types based on path
    if (path.includes('/stk/')) {
      // STK Push callback
      return new Response(JSON.stringify({
        success: true,
        message: 'STK callback processed successfully',
        callbackType: 'STK',
        data: body
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (path.includes('/c2b/')) {
      // C2B callback
      return new Response(JSON.stringify({
        success: true,
        message: 'C2B callback processed successfully',
        callbackType: 'C2B',
        data: body
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (path.includes('/b2c/')) {
      // B2C callback
      return new Response(JSON.stringify({
        success: true,
        message: 'B2C callback processed successfully',
        callbackType: 'B2C',
        data: body
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Generic callback response
    return new Response(JSON.stringify({
      success: true,
      message: 'Callback processed successfully',
      path,
      data: body
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Callback processing error:', error);

    return new Response(JSON.stringify({
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Failed to process callback'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}
