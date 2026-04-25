import { c2bService } from '../mpesa/c2b/c2b.service';
import { Env } from '../index';

export async function handleC2BRoutes(request: Request, env: Env, path: string): Promise<Response> {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Handle C2B register endpoint
  if (request.method === 'POST' && path === '/api/c2b/register') {
    try {
      const body = await request.json();
      const { shortCode, responseType, confirmationUrl, validationUrl } = body;

      if (!shortCode || !responseType || !confirmationUrl || !validationUrl) {
        return new Response(JSON.stringify({
          error: 'Validation Error',
          message: 'All fields are required',
          required: ['shortCode', 'responseType', 'confirmationUrl', 'validationUrl']
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Validate response type
      if (!['Completed', 'Cancelled'].includes(responseType)) {
        return new Response(JSON.stringify({
          error: 'Validation Error',
          message: 'Response type must be either "Completed" or "Cancelled"',
          allowed: ['Completed', 'Cancelled']
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const result = await c2bService.registerUrls(env, {
        shortCode,
        responseType,
        confirmationUrl,
        validationUrl
      });

      return new Response(JSON.stringify({
        success: true,
        message: 'C2B URLs registered successfully',
        data: result,
        timestamp: new Date().toISOString()
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } catch (error) {
      console.error('C2B route error:', error);

      return new Response(JSON.stringify({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Failed to register C2B URLs',
        timestamp: new Date().toISOString()
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }

  // Handle C2B simulate endpoint
  if (request.method === 'POST' && path === '/api/c2b/simulate') {
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

      if (typeof amount !== 'number' || amount <= 0) {
        return new Response(JSON.stringify({
          error: 'Validation Error',
          message: 'Amount must be a number greater than 0',
          example: { amount: 100 }
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
          message: 'Invalid mobile number format. Use format: 254712345678 or 0712345678',
          example: '254712345678'
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const result = await c2bService.simulateC2B(env, {
        mobileNumber: formattedNumber,
        amount,
        description: description || 'C2B Simulation'
      });

      return new Response(JSON.stringify({
        success: true,
        message: 'C2B transaction simulated successfully',
        data: result,
        timestamp: new Date().toISOString()
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } catch (error) {
      console.error('C2B simulation error:', error);

      return new Response(JSON.stringify({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Failed to simulate C2B transaction',
        timestamp: new Date().toISOString()
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }

  // Handle C2B status query endpoint
  if (request.method === 'GET' && path.startsWith('/api/c2b/status/')) {
    try {
      const conversationId = path.split('/api/c2b/status/')[1];

      if (!conversationId) {
        return new Response(JSON.stringify({
          error: 'Validation Error',
          message: 'Conversation ID is required',
          example: '/api/c2b/status/ABC123'
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
        message: 'C2B transaction status retrieved',
        data: mockStatus,
        timestamp: new Date().toISOString()
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } catch (error) {
      console.error('C2B status error:', error);

      return new Response(JSON.stringify({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Failed to query C2B status',
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
    message: `Method ${request.method} not allowed for ${path}. Supported methods: POST /api/c2b/register, POST /api/c2b/simulate, GET /api/c2b/status/:conversationId`,
    availableEndpoints: [
      'POST /api/c2b/register',
      'POST /api/c2b/simulate',
      'GET /api/c2b/status/{conversationId}'
    ]
  }), {
    status: 405,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}
