import { Env } from '../index';
import { b2bService } from '../mpesa/b2b/b2b.service';

export async function handleB2BRoutes(request: Request, env: Env, path: string): Promise<Response> {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Handle B2B send endpoint
  if (request.method === 'POST' && path === '/api/b2b/send') {
    try {
      const body = await request.json();
      const { receiverPartyPublicID, amount, description, accountReference } = body;

      if (!receiverPartyPublicID || !amount) {
        return new Response(JSON.stringify({
          error: 'Validation Error',
          message: 'Receiver party ID and amount are required',
          required: ['receiverPartyPublicID', 'amount']
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      if (typeof amount !== 'number' || amount <= 0 || amount > 150000) {
        return new Response(JSON.stringify({
          error: 'Validation Error',
          message: 'Amount must be between 1 and 150,000 KES',
          min: 1,
          max: 150000
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const result = await b2bService.initiateB2B(env, {
        receiverPartyPublicID,
        amount,
        description,
        accountReference
      });

      return new Response(JSON.stringify({
        success: true,
        message: 'B2B transaction initiated successfully',
        data: result,
        timestamp: new Date().toISOString()
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } catch (error) {
      console.error('B2B route error:', error);

      return new Response(JSON.stringify({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Failed to process B2B transaction',
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
    message: `Method ${request.method} not allowed for ${path}. Supported: POST /api/b2b/send`,
    availableEndpoints: [
      'POST /api/b2b/send - Initiate B2B transaction'
    ]
  }), {
    status: 405,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}
