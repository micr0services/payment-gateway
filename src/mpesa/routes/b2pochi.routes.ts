import { b2pochiService } from '../b2pochi/b2pochi.service';
import { Env } from '../../index';

export async function handleB2PochiRoutes(request: Request, env: Env, path: string): Promise<Response> {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Handle B2Pochi send endpoint
  if (request.method === 'POST' && path === '/api/b2pochi/send') {
    try {
      const body = await request.json();
      const { mobileNumber, amount, description } = body;

      if (!mobileNumber || !amount) {
        return new Response(JSON.stringify({
          error: 'Validation Error',
          message: 'Mobile number and amount are required',
          required: ['mobileNumber', 'amount']
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

      const result = await b2pochiService.sendToPochi(env, {
        mobileNumber: formattedNumber,
        amount,
        description: description || 'B2Pochi Payment'
      });

      return new Response(JSON.stringify({
        success: true,
        message: 'B2Pochi transaction initiated successfully',
        data: result,
        timestamp: new Date().toISOString()
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } catch (error) {
      console.error('B2Pochi route error:', error);

      return new Response(JSON.stringify({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Failed to process B2Pochi transaction',
        timestamp: new Date().toISOString()
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }

  // Handle B2Pochi status query endpoint
  if (request.method === 'GET' && path.startsWith('/api/b2pochi/status/')) {
    try {
      const conversationId = path.split('/api/b2pochi/status/')[1];

      if (!conversationId) {
        return new Response(JSON.stringify({
          error: 'Validation Error',
          message: 'Conversation ID is required',
          example: '/api/b2pochi/status/ABC123'
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
        responseDescription: 'Transaction initiated successfully',
        timestamp: new Date().toISOString(),
        note: 'Database integration required for real status queries'
      };

      return new Response(JSON.stringify({
        success: true,
        message: 'B2Pochi transaction status retrieved',
        data: mockStatus,
        timestamp: new Date().toISOString()
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } catch (error) {
      console.error('B2Pochi status error:', error);

      return new Response(JSON.stringify({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Failed to query B2Pochi status',
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
    message: `Method ${request.method} not allowed for ${path}. Supported: POST /api/b2pochi/send, GET /api/b2pochi/status/:conversationId`
  }), {
    status: 405,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}
