import { reversalService } from '../reversal/reversal.service';
import { Env } from '../../index';

export async function handleReversalRoutes(request: Request, env: Env, path: string): Promise<Response> {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Handle reversal request endpoint
  if (request.method === 'POST' && path === '/api/reversal/request') {
    try {
      const body = await request.json();
      const { transactionId, amount, receiverParty, remarks, occasion } = body;

      if (!transactionId || !amount || !receiverParty) {
        return new Response(JSON.stringify({
          error: 'Validation Error',
          message: 'Transaction ID, amount, and receiver party are required',
          required: ['transactionId', 'amount', 'receiverParty']
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

      const result = await reversalService.initiateReversal(env, {
        transactionId,
        amount,
        receiverParty,
        remarks,
        occasion
      });

      return new Response(JSON.stringify({
        success: true,
        message: 'Reversal request initiated successfully',
        data: result,
        timestamp: new Date().toISOString()
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } catch (error) {
      console.error('Reversal route error:', error);

      return new Response(JSON.stringify({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Failed to process reversal request',
        timestamp: new Date().toISOString()
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }

  // Handle reversal status query endpoint
  if (request.method === 'GET' && path.startsWith('/api/reversal/status/')) {
    try {
      const conversationId = path.split('/api/reversal/status/')[1];

      if (!conversationId) {
        return new Response(JSON.stringify({
          error: 'Validation Error',
          message: 'Conversation ID is required',
          example: '/api/reversal/status/ABC123'
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // For now, return mock status since we don't have database integration
      // In production, this would query the database for transaction status
      const mockStatus = {
        conversationId,
        status: 'PENDING', // SUCCESS, FAILED, PENDING
        responseCode: '0',
        responseDescription: 'Reversal initiated successfully',
        timestamp: new Date().toISOString(),
        note: 'Database integration required for real status queries'
      };

      return new Response(JSON.stringify({
        success: true,
        message: 'Reversal status retrieved',
        data: mockStatus,
        timestamp: new Date().toISOString()
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } catch (error) {
      console.error('Reversal status error:', error);

      return new Response(JSON.stringify({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Failed to query reversal status',
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
    message: `Method ${request.method} not allowed for ${path}. Supported methods: POST /api/reversal/request, GET /api/reversal/status/:conversationId`,
    availableEndpoints: [
      'POST /api/reversal/request',
      'GET /api/reversal/status/{conversationId}'
    ]
  }), {
    status: 405,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}
