/**
 * Cloudflare Worker for M-Pesa Integration
 * Complete M-Pesa API integration with B2C, C2B, B2B, STK Push, and transaction management
 * Includes database logging and comprehensive API documentation
 */

import { handleB2CRoutes } from './routes/b2c.routes';
import { handleC2BRoutes } from './routes/c2b.routes';
import { handleB2BRoutes } from './routes/b2b.routes';
import { handleSTKRoutes } from './routes/stk.routes';
import { handleB2PochiRoutes } from './routes/b2pochi.routes';
import { handleReversalRoutes } from './routes/reversal.routes';
import { handleTransactionRoutes } from './routes/transaction.routes';
import { handleCallbackRoutes } from './routes/callback.routes';
import { logRequest, logResponse, logError, createRequestContext, createResponseContext, isDevMode } from './utils/logger';

export interface Env {
  MPESA_CONSUMER_KEY: string;
  MPESA_CONSUMER_SECRET: string;
  MPESA_SHORTCODE: string;
  MPESA_PASSKEY: string;
  MPESA_ENVIRONMENT: string;
  MPESA_C2B_VALIDATE_URL: string;
  MPESA_C2B_CONFIRM_URL: string;
  MPESA_INITIATOR_NAME: string;
  MPESA_INITIATOR_PASSWORD: string;
  MPESA_B2C_CALLBACK_URL: string;
  MPESA_B2B_CALLBACK_URL: string;
  MPESA_STK_CALLBACK_URL: string;
  MPESA_B2POCHI_CALLBACK_URL: string;
  MPESA_REVERSAL_CALLBACK_URL: string;
  DATABASE_URL: string;
  // DB: D1Database; // For future D1 integration
}

// Request logging utility - Enhanced version
async function logApiRequest(
  env: Env,
  endpoint: string,
  method: string,
  statusCode: number,
  responseTime: number,
  errorMessage?: string,
  requestContext?: any,
  responseBody?: any
) {
  const isDev = isDevMode();
  
  if (isDev) {
    const logContext = {
      timestamp: new Date().toISOString(),
      method,
      path: endpoint,
      statusCode,
      responseTime,
      error: errorMessage,
      requestBody: requestContext?.requestBody,
      responseBody,
    };

    // Log response or error
    if (statusCode >= 400) {
      logError(logContext, isDev);
    } else {
      logResponse(logContext, isDev);
    }
  }

  // Database logging (if needed in future)
  try {
    // In a real implementation, this would log to the database
    // For now, we'll just log to console
    if (!isDev) {
      console.log(`[${new Date().toISOString()}] ${method} ${endpoint} ${statusCode} ${responseTime}ms${errorMessage ? ` - Error: ${errorMessage}` : ''}`);
    }
  } catch (error) {
    console.error('Error logging API request:', error);
  }
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;
    const startTime = Date.now();
    const isDev = isDevMode();

    // Create request context for logging
    const requestContext = await createRequestContext(request);
    
    // Log incoming request in dev mode
    if (isDev) {
      logRequest(requestContext, isDev);
    }

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    // Handle preflight requests
    if (method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    let response: Response;
    let errorMessage: string | undefined;

    try {
      // Health check
      if (path === '/health' && method === 'GET') {
        response = new Response(JSON.stringify({
          status: 'OK',
          message: 'M-Pesa Integration Worker is running',
          timestamp: new Date().toISOString(),
          version: '1.0.0',
          environment: env.MPESA_ENVIRONMENT || 'sandbox'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
        return response;
      }

      // API Documentation (OpenAPI/Swagger)
      if (path === '/api-docs' && method === 'GET') {
        const openApiSpec = {
          openapi: '3.0.3',
          info: {
            title: 'M-Pesa Integration API',
            version: '1.0.0',
            description: 'Complete M-Pesa integration API with B2C, C2B, B2B, STK Push and Query support. All transactions are automatically logged to database.',
            contact: {
              name: 'API Support',
              url: 'https://developer.safaricom.co.ke'
            },
            license: {
              name: 'MIT',
              url: 'https://opensource.org/licenses/MIT'
            }
          },
          servers: [
            {
              url: 'https://mpesa-integration-worker.kimaniwilfred95.workers.dev',
              description: 'Production server'
            }, 
            {
              url: 'http://localhost:8787',
              description: 'Development server'
            }
          ],
          paths: {
            '/health': {
              get: {
                summary: 'Health Check',
                description: 'Check if the M-Pesa integration service is running',
                tags: ['Health'],
                responses: {
                  '200': {
                    description: 'Service is healthy',
                    content: {
                      'application/json': {
                        schema: {
                          type: 'object',
                          properties: {
                            status: { type: 'string', example: 'OK' },
                            message: { type: 'string', example: 'M-Pesa Integration Worker is running' },
                            timestamp: { type: 'string', format: 'date-time' },
                            version: { type: 'string', example: '1.0.0' }
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            '/api-docs': {
              get: {
                summary: 'OpenAPI Specification',
                description: 'Get the OpenAPI 3.0 specification for this API',
                tags: ['Documentation'],
                responses: {
                  '200': {
                    description: 'OpenAPI specification',
                    content: {
                      'application/json': {
                        schema: {
                          type: 'object',
                          description: 'OpenAPI 3.0 specification object'
                        }
                      }
                    }
                  }
                }
              }
            },
            '/docs': {
              get: {
                summary: 'Swagger UI',
                description: 'Interactive API documentation with Swagger UI',
                tags: ['Documentation'],
                responses: {
                  '200': {
                    description: 'Swagger UI HTML page',
                    content: {
                      'text/html': {
                        schema: {
                          type: 'string',
                          description: 'HTML page with Swagger UI'
                        }
                      }
                    }
                  }
                }
              }
            },
            '/api/b2c/send': {
              post: {
                summary: 'Send Money (B2C)',
                description: 'Send money from business account to customer (Business to Consumer)',
                tags: ['B2C'],
                requestBody: {
                  required: true,
                  content: {
                    'application/json': {
                      schema: {
                        type: 'object',
                        required: ['mobileNumber', 'amount'],
                        properties: {
                          mobileNumber: {
                            type: 'string',
                            description: 'Customer mobile number (254XXXXXXXXX or 0XXXXXXXXX)',
                            example: '254712345678'
                          },
                          amount: {
                            type: 'number',
                            description: 'Amount to send (KES 1-150,000)',
                            minimum: 1,
                            maximum: 150000,
                            example: 1000
                          },
                          description: {
                            type: 'string',
                            description: 'Payment description',
                            example: 'Salary payment'
                          }
                        }
                      }
                    }
                  }
                },
                responses: {
                  '200': {
                    description: 'Transaction initiated successfully',
                    content: {
                      'application/json': {
                        schema: {
                          type: 'object',
                          properties: {
                            success: { type: 'boolean', example: true },
                            message: { type: 'string', example: 'B2C transaction initiated successfully' },
                            data: {
                              type: 'object',
                              properties: {
                                conversationId: { type: 'string' },
                                responseCode: { type: 'string' },
                                responseDescription: { type: 'string' },
                                originatorConversationId: { type: 'string' },
                                timestamp: { type: 'string', format: 'date-time' }
                              }
                            },
                            timestamp: { type: 'string', format: 'date-time' }
                          }
                        }
                      }
                    }
                  },
                  '400': {
                    description: 'Validation error',
                    content: {
                      'application/json': {
                        schema: {
                          type: 'object',
                          properties: {
                            error: { type: 'string', example: 'Validation Error' },
                            message: { type: 'string', example: 'Mobile number and amount are required' },
                            required: {
                              type: 'array',
                              items: { type: 'string' },
                              example: ['mobileNumber', 'amount']
                            }
                          }
                        }
                      }
                    }
                  },
                  '500': {
                    description: 'Internal server error',
                    content: {
                      'application/json': {
                        schema: {
                          type: 'object',
                          properties: {
                            error: { type: 'string', example: 'Internal Server Error' },
                            message: { type: 'string' },
                            timestamp: { type: 'string', format: 'date-time' }
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            '/api/b2c/status/{conversationId}': {
              get: {
                summary: 'Check B2C Transaction Status',
                description: 'Query the status of a B2C transaction using conversation ID',
                tags: ['B2C'],
                parameters: [
                  {
                    name: 'conversationId',
                    in: 'path',
                    required: true,
                    description: 'Conversation ID from the B2C transaction',
                    schema: {
                      type: 'string',
                      example: 'AG_20231212_1234567890'
                    }
                  }
                ],
                responses: {
                  '200': {
                    description: 'Transaction status retrieved successfully',
                    content: {
                      'application/json': {
                        schema: {
                          type: 'object',
                          properties: {
                            success: { type: 'boolean', example: true },
                            message: { type: 'string', example: 'B2C transaction status retrieved' },
                            data: {
                              type: 'object',
                              properties: {
                                conversationId: { type: 'string' },
                                status: { type: 'string', enum: ['SUCCESS', 'FAILED', 'PENDING'], example: 'SUCCESS' },
                                responseCode: { type: 'string', example: '0' },
                                responseDescription: { type: 'string', example: 'Transaction successful' },
                                timestamp: { type: 'string', format: 'date-time' }
                              }
                            },
                            timestamp: { type: 'string', format: 'date-time' }
                          }
                        }
                      }
                    }
                  },
                  '400': {
                    description: 'Validation error',
                    content: {
                      'application/json': {
                        schema: {
                          type: 'object',
                          properties: {
                            error: { type: 'string', example: 'Validation Error' },
                            message: { type: 'string', example: 'Conversation ID is required' }
                          }
                        }
                      }
                    }
                  },
                  '404': {
                    description: 'Transaction not found',
                    content: {
                      'application/json': {
                        schema: {
                          type: 'object',
                          properties: {
                            error: { type: 'string', example: 'Not Found' },
                            message: { type: 'string', example: 'Transaction not found' }
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            '/api/b2b/send': {
              post: {
                summary: 'Send Money (B2B)',
                description: 'Send money from business account to another business account (Business to Business)',
                tags: ['B2B'],
                requestBody: {
                  required: true,
                  content: {
                    'application/json': {
                      schema: {
                        type: 'object',
                        required: ['receiverPartyPublicID', 'amount'],
                        properties: {
                          receiverPartyPublicID: {
                            type: 'string',
                            description: 'Receiver business short code or till number',
                            example: '654321'
                          },
                          amount: {
                            type: 'number',
                            description: 'Amount to send (KES 1-150,000)',
                            minimum: 1,
                            maximum: 150000,
                            example: 5000
                          },
                          description: {
                            type: 'string',
                            description: 'Payment description',
                            example: 'Payment for services'
                          },
                          accountReference: {
                            type: 'string',
                            description: 'Account reference number',
                            example: 'INV-2024-0001'
                          }
                        }
                      }
                    }
                  }
                },
                responses: {
                  '200': {
                    description: 'Transaction initiated successfully',
                    content: {
                      'application/json': {
                        schema: {
                          type: 'object',
                          properties: {
                            success: { type: 'boolean', example: true },
                            message: { type: 'string', example: 'B2B transaction initiated successfully' },
                            data: {
                              type: 'object',
                              properties: {
                                conversationId: { type: 'string' },
                                responseCode: { type: 'string' },
                                responseDescription: { type: 'string' },
                                originatorConversationId: { type: 'string' },
                                timestamp: { type: 'string', format: 'date-time' }
                              }
                            },
                            timestamp: { type: 'string', format: 'date-time' }
                          }
                        }
                      }
                    }
                  },
                  '400': {
                    description: 'Validation error',
                    content: {
                      'application/json': {
                        schema: {
                          type: 'object',
                          properties: {
                            error: { type: 'string', example: 'Validation Error' },
                            message: { type: 'string', example: 'Receiver party ID and amount are required' },
                            required: {
                              type: 'array',
                              items: { type: 'string' },
                              example: ['receiverPartyPublicID', 'amount']
                            }
                          }
                        }
                      }
                    }
                  },
                  '500': {
                    description: 'Internal server error',
                    content: {
                      'application/json': {
                        schema: {
                          type: 'object',
                          properties: {
                            error: { type: 'string', example: 'Internal Server Error' },
                            message: { type: 'string' },
                            timestamp: { type: 'string', format: 'date-time' }
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            '/api/c2b/register': {
              post: {
                summary: 'Register C2B URLs',
                description: 'Register validation and confirmation URLs for Customer to Business transactions',
                tags: ['C2B'],
                requestBody: {
                  required: true,
                  content: {
                    'application/json': {
                      schema: {
                        type: 'object',
                        required: ['shortCode', 'responseType', 'confirmationUrl', 'validationUrl'],
                        properties: {
                          shortCode: {
                            type: 'string',
                            description: 'Your PayBill/Till number',
                            example: '174379'
                          },
                          responseType: {
                            type: 'string',
                            enum: ['Completed', 'Cancelled'],
                            description: 'Response type for transaction processing',
                            example: 'Completed'
                          },
                          confirmationUrl: {
                            type: 'string',
                            format: 'uri',
                            description: 'URL to receive transaction confirmation',
                            example: 'https://yourdomain.com/callbacks/c2b/confirm'
                          },
                          validationUrl: {
                            type: 'string',
                            format: 'uri',
                            description: 'URL to validate transaction before processing',
                            example: 'https://yourdomain.com/callbacks/c2b/validate'
                          }
                        }
                      }
                    }
                  }
                },
                responses: {
                  '200': {
                    description: 'URLs registered successfully',
                    content: {
                      'application/json': {
                        schema: {
                          type: 'object',
                          properties: {
                            success: { type: 'boolean', example: true },
                            message: { type: 'string', example: 'C2B URLs registered successfully' },
                            data: {
                              type: 'object',
                              properties: {
                                responseCode: { type: 'string' },
                                responseDescription: { type: 'string' },
                                originatorConversationId: { type: 'string' },
                                conversationId: { type: 'string' },
                                timestamp: { type: 'string', format: 'date-time' }
                              }
                            },
                            timestamp: { type: 'string', format: 'date-time' }
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            '/api/c2b/simulate': {
              post: {
                summary: 'Simulate C2B Transaction',
                description: 'Simulate a Customer to Business transaction for testing',
                tags: ['C2B'],
                requestBody: {
                  required: true,
                  content: {
                    'application/json': {
                      schema: {
                        type: 'object',
                        required: ['mobileNumber', 'amount'],
                        properties: {
                          mobileNumber: {
                            type: 'string',
                            description: 'Customer mobile number (254XXXXXXXXX or 0XXXXXXXXX)',
                            example: '254712345678'
                          },
                          amount: {
                            type: 'number',
                            description: 'Amount to simulate (KES 1-150,000)',
                            minimum: 1,
                            maximum: 150000,
                            example: 2000
                          },
                          description: {
                            type: 'string',
                            description: 'Transaction description',
                            example: 'Test payment'
                          }
                        }
                      }
                    }
                  }
                },
                responses: {
                  '200': {
                    description: 'C2B transaction simulated successfully',
                    content: {
                      'application/json': {
                        schema: {
                          type: 'object',
                          properties: {
                            success: { type: 'boolean', example: true },
                            message: { type: 'string', example: 'C2B transaction simulated successfully' },
                            data: {
                              type: 'object',
                              properties: {
                                conversationId: { type: 'string' },
                                responseCode: { type: 'string' },
                                responseDescription: { type: 'string' },
                                originatorConversationId: { type: 'string' },
                                mpesaResponse: { type: 'object' },
                                timestamp: { type: 'string', format: 'date-time' }
                              }
                            },
                            timestamp: { type: 'string', format: 'date-time' }
                          }
                        }
                      }
                    }
                  },
                  '400': {
                    description: 'Validation error',
                    content: {
                      'application/json': {
                        schema: {
                          type: 'object',
                          properties: {
                            error: { type: 'string', example: 'Validation Error' },
                            message: { type: 'string', example: 'Mobile number and amount are required' }
                          }
                        }
                      }
                    }
                  },
                  '500': {
                    description: 'Internal server error',
                    content: {
                      'application/json': {
                        schema: {
                          type: 'object',
                          properties: {
                            error: { type: 'string', example: 'Internal Server Error' },
                            message: { type: 'string' }
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            '/api/c2b/status/{conversationId}': {
              get: {
                summary: 'Check C2B Transaction Status',
                description: 'Query the status of a C2B transaction using conversation ID',
                tags: ['C2B'],
                parameters: [
                  {
                    name: 'conversationId',
                    in: 'path',
                    required: true,
                    description: 'Conversation ID from the C2B transaction',
                    schema: {
                      type: 'string',
                      example: 'AG_20231212_1234567890'
                    }
                  }
                ],
                responses: {
                  '200': {
                    description: 'Transaction status retrieved successfully',
                    content: {
                      'application/json': {
                        schema: {
                          type: 'object',
                          properties: {
                            success: { type: 'boolean', example: true },
                            message: { type: 'string', example: 'C2B transaction status retrieved' },
                            data: {
                              type: 'object',
                              properties: {
                                conversationId: { type: 'string' },
                                status: { type: 'string', enum: ['SUCCESS', 'FAILED', 'PENDING'], example: 'SUCCESS' },
                                responseCode: { type: 'string', example: '0' },
                                responseDescription: { type: 'string', example: 'Transaction successful' },
                                timestamp: { type: 'string', format: 'date-time' }
                              }
                            },
                            timestamp: { type: 'string', format: 'date-time' }
                          }
                        }
                      }
                    }
                  },
                  '400': {
                    description: 'Validation error',
                    content: {
                      'application/json': {
                        schema: {
                          type: 'object',
                          properties: {
                            error: { type: 'string', example: 'Validation Error' },
                            message: { type: 'string', example: 'Conversation ID is required' }
                          }
                        }
                      }
                    }
                  },
                  '404': {
                    description: 'Transaction not found',
                    content: {
                      'application/json': {
                        schema: {
                          type: 'object',
                          properties: {
                            error: { type: 'string', example: 'Not Found' },
                            message: { type: 'string', example: 'Transaction not found' }
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            '/api/b2b/status/{conversationId}': {
              get: {
                summary: 'Check B2B Transaction Status',
                description: 'Query the status of a B2B transaction using conversation ID',
                tags: ['B2B'],
                parameters: [
                  {
                    name: 'conversationId',
                    in: 'path',
                    required: true,
                    description: 'Conversation ID from the B2B transaction',
                    schema: {
                      type: 'string',
                      example: 'AG_20231212_1234567890'
                    }
                  }
                ],
                responses: {
                  '200': {
                    description: 'Transaction status retrieved successfully',
                    content: {
                      'application/json': {
                        schema: {
                          type: 'object',
                          properties: {
                            success: { type: 'boolean', example: true },
                            message: { type: 'string', example: 'B2B transaction status retrieved' },
                            data: {
                              type: 'object',
                              properties: {
                                conversationId: { type: 'string' },
                                status: { type: 'string', enum: ['SUCCESS', 'FAILED', 'PENDING'], example: 'SUCCESS' },
                                responseCode: { type: 'string', example: '0' },
                                responseDescription: { type: 'string', example: 'Transaction successful' },
                                timestamp: { type: 'string', format: 'date-time' }
                              }
                            },
                            timestamp: { type: 'string', format: 'date-time' }
                          }
                        }
                      }
                    }
                  },
                  '400': {
                    description: 'Validation error',
                    content: {
                      'application/json': {
                        schema: {
                          type: 'object',
                          properties: {
                            error: { type: 'string', example: 'Validation Error' },
                            message: { type: 'string', example: 'Conversation ID is required' }
                          }
                        }
                      }
                    }
                  },
                  '404': {
                    description: 'Transaction not found',
                    content: {
                      'application/json': {
                        schema: {
                          type: 'object',
                          properties: {
                            error: { type: 'string', example: 'Not Found' },
                            message: { type: 'string', example: 'Transaction not found' }
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            '/api/stk/push': {
              post: {
                summary: 'Initiate STK Push',
                description: 'Prompt customer to enter M-Pesa PIN for payment (STK Push)',
                tags: ['STK'],
                requestBody: {
                  required: true,
                  content: {
                    'application/json': {
                      schema: {
                        type: 'object',
                        required: ['mobileNumber', 'amount', 'accountReference'],
                        properties: {
                          mobileNumber: {
                            type: 'string',
                            description: 'Customer mobile number (254XXXXXXXXX or 0XXXXXXXXX)',
                            example: '254712345678'
                          },
                          amount: {
                            type: 'number',
                            description: 'Amount to charge (KES 1-150,000)',
                            minimum: 1,
                            maximum: 150000,
                            example: 1000
                          },
                          accountReference: {
                            type: 'string',
                            description: 'Account reference for the transaction',
                            example: 'INV-001'
                          },
                          transactionDesc: {
                            type: 'string',
                            description: 'Transaction description',
                            example: 'Payment for services'
                          }
                        }
                      }
                    }
                  }
                },
                responses: {
                  '200': {
                    description: 'STK push initiated successfully',
                    content: {
                      'application/json': {
                        schema: {
                          type: 'object',
                          properties: {
                            success: { type: 'boolean', example: true },
                            message: { type: 'string', example: 'STK push initiated successfully' },
                            data: {
                              type: 'object',
                              properties: {
                                merchantRequestId: { type: 'string' },
                                checkoutRequestId: { type: 'string' },
                                responseCode: { type: 'string' },
                                responseDescription: { type: 'string' },
                                customerMessage: { type: 'string' },
                                timestamp: { type: 'string', format: 'date-time' }
                              }
                            },
                            timestamp: { type: 'string', format: 'date-time' }
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            '/api/stk/query': {
              post: {
                summary: 'Query STK Push Status',
                description: 'Query the status of an STK push transaction using checkout request ID',
                tags: ['STK'],
                requestBody: {
                  required: true,
                  content: {
                    'application/json': {
                      schema: {
                        type: 'object',
                        required: ['checkoutRequestId'],
                        properties: {
                          checkoutRequestId: {
                            type: 'string',
                            description: 'Checkout Request ID from the STK push transaction',
                            example: 'ws_CO_191220191020363925'
                          }
                        }
                      }
                    }
                  }
                },
                responses: {
                  '200': {
                    description: 'STK transaction status retrieved successfully',
                    content: {
                      'application/json': {
                        schema: {
                          type: 'object',
                          properties: {
                            success: { type: 'boolean', example: true },
                            message: { type: 'string', example: 'STK transaction status retrieved' },
                            data: {
                              type: 'object',
                              properties: {
                                checkoutRequestId: { type: 'string' },
                                status: { type: 'string', enum: ['SUCCESS', 'FAILED', 'PENDING'], example: 'SUCCESS' },
                                responseCode: { type: 'string', example: '0' },
                                responseDescription: { type: 'string', example: 'Transaction successful' },
                                timestamp: { type: 'string', format: 'date-time' }
                              }
                            },
                            timestamp: { type: 'string', format: 'date-time' }
                          }
                        }
                      }
                    }
                  },
                  '400': {
                    description: 'Validation error',
                    content: {
                      'application/json': {
                        schema: {
                          type: 'object',
                          properties: {
                            error: { type: 'string', example: 'Validation Error' },
                            message: { type: 'string', example: 'Checkout Request ID is required' }
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            '/api/stk/status/{checkoutRequestId}': {
              get: {
                summary: 'Check STK Transaction Status',
                description: 'Query the status of an STK push transaction using checkout request ID',
                tags: ['STK'],
                parameters: [
                  {
                    name: 'checkoutRequestId',
                    in: 'path',
                    required: true,
                    description: 'Checkout Request ID from the STK push transaction',
                    schema: {
                      type: 'string',
                      example: 'ws_CO_191220191020363925'
                    }
                  }
                ],
                responses: {
                  '200': {
                    description: 'Transaction status retrieved successfully',
                    content: {
                      'application/json': {
                        schema: {
                          type: 'object',
                          properties: {
                            success: { type: 'boolean', example: true },
                            message: { type: 'string', example: 'STK transaction status retrieved' },
                            data: {
                              type: 'object',
                              properties: {
                                checkoutRequestId: { type: 'string' },
                                status: { type: 'string', enum: ['SUCCESS', 'FAILED', 'PENDING'], example: 'SUCCESS' },
                                responseCode: { type: 'string', example: '0' },
                                responseDescription: { type: 'string', example: 'Transaction successful' },
                                mpesaReceiptNumber: { type: 'string', example: 'NLJ7RT61SV' },
                                timestamp: { type: 'string', format: 'date-time' }
                              }
                            },
                            timestamp: { type: 'string', format: 'date-time' }
                          }
                        }
                      }
                    }
                  },
                  '400': {
                    description: 'Validation error',
                    content: {
                      'application/json': {
                        schema: {
                          type: 'object',
                          properties: {
                            error: { type: 'string', example: 'Validation Error' },
                            message: { type: 'string', example: 'Checkout Request ID is required' }
                          }
                        }
                      }
                    }
                  },
                  '404': {
                    description: 'Transaction not found',
                    content: {
                      'application/json': {
                        schema: {
                          type: 'object',
                          properties: {
                            error: { type: 'string', example: 'Not Found' },
                            message: { type: 'string', example: 'Transaction not found' }
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            '/api/b2pochi/send': {
              post: {
                summary: 'Send Money (B2Pochi)',
                description: 'Send money to Pochi La Biashara (Buy Goods) merchant',
                tags: ['B2Pochi'],
                requestBody: {
                  required: true,
                  content: {
                    'application/json': {
                      schema: {
                        type: 'object',
                        required: ['mobileNumber', 'amount'],
                        properties: {
                          mobileNumber: {
                            type: 'string',
                            description: 'Merchant mobile number (254XXXXXXXXX or 0XXXXXXXXX)',
                            example: '254712345678'
                          },
                          amount: {
                            type: 'number',
                            description: 'Amount to send (KES)',
                            minimum: 1,
                            example: 2000
                          },
                          description: {
                            type: 'string',
                            description: 'Transaction description',
                            example: 'Merchant payment'
                          }
                        }
                      }
                    }
                  }
                },
                responses: {
                  '200': {
                    description: 'B2Pochi transaction initiated successfully',
                    content: {
                      'application/json': {
                        schema: {
                          type: 'object',
                          properties: {
                            success: { type: 'boolean', example: true },
                            message: { type: 'string', example: 'B2Pochi transaction initiated successfully' },
                            data: {
                              type: 'object',
                              properties: {
                                mobileNumber: { type: 'string' },
                                amount: { type: 'number' },
                                description: { type: 'string' },
                                status: { type: 'string', example: 'INITIATED' },
                                timestamp: { type: 'string', format: 'date-time' }
                              }
                            },
                            timestamp: { type: 'string', format: 'date-time' }
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            '/api/b2pochi/status/{conversationId}': {
              get: {
                summary: 'Check B2Pochi Transaction Status',
                description: 'Query the status of a B2Pochi transaction using conversation ID',
                tags: ['B2Pochi'],
                parameters: [
                  {
                    name: 'conversationId',
                    in: 'path',
                    required: true,
                    description: 'Conversation ID from the B2Pochi transaction',
                    schema: {
                      type: 'string',
                      example: 'AG_20231212_1234567890'
                    }
                  }
                ],
                responses: {
                  '200': {
                    description: 'Transaction status retrieved successfully',
                    content: {
                      'application/json': {
                        schema: {
                          type: 'object',
                          properties: {
                            success: { type: 'boolean', example: true },
                            message: { type: 'string', example: 'B2Pochi transaction status retrieved' },
                            data: {
                              type: 'object',
                              properties: {
                                conversationId: { type: 'string' },
                                status: { type: 'string', enum: ['SUCCESS', 'FAILED', 'PENDING'], example: 'SUCCESS' },
                                responseCode: { type: 'string', example: '0' },
                                responseDescription: { type: 'string', example: 'Transaction successful' },
                                timestamp: { type: 'string', format: 'date-time' }
                              }
                            },
                            timestamp: { type: 'string', format: 'date-time' }
                          }
                        }
                      }
                    }
                  },
                  '400': {
                    description: 'Validation error',
                    content: {
                      'application/json': {
                        schema: {
                          type: 'object',
                          properties: {
                            error: { type: 'string', example: 'Validation Error' },
                            message: { type: 'string', example: 'Conversation ID is required' }
                          }
                        }
                      }
                    }
                  },
                  '404': {
                    description: 'Transaction not found',
                    content: {
                      'application/json': {
                        schema: {
                          type: 'object',
                          properties: {
                            error: { type: 'string', example: 'Not Found' },
                            message: { type: 'string', example: 'Transaction not found' }
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            '/api/reversal/request': {
              post: {
                summary: 'Initiate Transaction Reversal',
                description: 'Reverse a completed M-Pesa transaction',
                tags: ['Reversal'],
                requestBody: {
                  required: true,
                  content: {
                    'application/json': {
                      schema: {
                        type: 'object',
                        required: ['transactionId', 'amount'],
                        properties: {
                          transactionId: {
                            type: 'string',
                            description: 'Original transaction ID to reverse',
                            example: 'OEI2AK4Q16'
                          },
                          amount: {
                            type: 'number',
                            description: 'Amount to reverse (KES)',
                            minimum: 1,
                            example: 1000
                          },
                          description: {
                            type: 'string',
                            description: 'Reversal reason',
                            example: 'Customer refund'
                          }
                        }
                      }
                    }
                  }
                },
                responses: {
                  '200': {
                    description: 'Reversal initiated successfully',
                    content: {
                      'application/json': {
                        schema: {
                          type: 'object',
                          properties: {
                            success: { type: 'boolean', example: true },
                            message: { type: 'string', example: 'Reversal initiated successfully' },
                            data: {
                              type: 'object',
                              properties: {
                                transactionId: { type: 'string' },
                                amount: { type: 'number' },
                                description: { type: 'string' },
                                status: { type: 'string', example: 'INITIATED' },
                                timestamp: { type: 'string', format: 'date-time' }
                              }
                            },
                            timestamp: { type: 'string', format: 'date-time' }
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            '/api/reversal/status/{conversationId}': {
              get: {
                summary: 'Check Reversal Transaction Status',
                description: 'Query the status of a reversal transaction using conversation ID',
                tags: ['Reversal'],
                parameters: [
                  {
                    name: 'conversationId',
                    in: 'path',
                    required: true,
                    description: 'Conversation ID from the reversal transaction',
                    schema: {
                      type: 'string',
                      example: 'AG_20231212_1234567890'
                    }
                  }
                ],
                responses: {
                  '200': {
                    description: 'Reversal status retrieved successfully',
                    content: {
                      'application/json': {
                        schema: {
                          type: 'object',
                          properties: {
                            success: { type: 'boolean', example: true },
                            message: { type: 'string', example: 'Reversal status retrieved' },
                            data: {
                              type: 'object',
                              properties: {
                                conversationId: { type: 'string' },
                                status: { type: 'string', enum: ['SUCCESS', 'FAILED', 'PENDING'], example: 'SUCCESS' },
                                responseCode: { type: 'string', example: '0' },
                                responseDescription: { type: 'string', example: 'Reversal successful' },
                                timestamp: { type: 'string', format: 'date-time' }
                              }
                            },
                            timestamp: { type: 'string', format: 'date-time' }
                          }
                        }
                      }
                    }
                  },
                  '400': {
                    description: 'Validation error',
                    content: {
                      'application/json': {
                        schema: {
                          type: 'object',
                          properties: {
                            error: { type: 'string', example: 'Validation Error' },
                            message: { type: 'string', example: 'Conversation ID is required' }
                          }
                        }
                      }
                    }
                  },
                  '404': {
                    description: 'Transaction not found',
                    content: {
                      'application/json': {
                        schema: {
                          type: 'object',
                          properties: {
                            error: { type: 'string', example: 'Not Found' },
                            message: { type: 'string', example: 'Transaction not found' }
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            '/api/transactions/all': {
              get: {
                summary: 'Get All Transactions',
                description: 'Retrieve all transaction records (currently returns mock data)',
                tags: ['Transactions'],
                responses: {
                  '200': {
                    description: 'Transactions retrieved successfully',
                    content: {
                      'application/json': {
                        schema: {
                          type: 'object',
                          properties: {
                            success: { type: 'boolean', example: true },
                            message: { type: 'string', example: 'Transactions retrieved successfully' },
                            data: {
                              type: 'array',
                              items: {
                                type: 'object',
                                properties: {
                                  id: { type: 'string', example: 'txn-001' },
                                  type: { type: 'string', enum: ['STK_PUSH', 'B2C', 'C2B', 'B2B'], example: 'STK_PUSH' },
                                  status: { type: 'string', enum: ['SUCCESS', 'PENDING', 'FAILED'], example: 'SUCCESS' },
                                  amount: { type: 'number', example: 1000 },
                                  mobileNumber: { type: 'string', example: '254712345678' },
                                  timestamp: { type: 'string', format: 'date-time' }
                                }
                              }
                            },
                            total: { type: 'number', example: 2 },
                            timestamp: { type: 'string', format: 'date-time' }
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            '/api/transactions/{id}': {
              get: {
                summary: 'Get Transaction by ID',
                description: 'Retrieve a specific transaction by its unique identifier',
                tags: ['Transactions'],
                parameters: [
                  {
                    name: 'id',
                    in: 'path',
                    required: true,
                    description: 'Transaction ID',
                    schema: {
                      type: 'string',
                      format: 'uuid',
                      example: '550e8400-e29b-41d4-a716-446655440000'
                    }
                  }
                ],
                responses: {
                  '200': {
                    description: 'Transaction retrieved successfully',
                    content: {
                      'application/json': {
                        schema: {
                          type: 'object',
                          properties: {
                            success: { type: 'boolean', example: true },
                            message: { type: 'string', example: 'Transaction retrieved successfully' },
                            data: { $ref: '#/components/schemas/Transaction' },
                            timestamp: { type: 'string', format: 'date-time' }
                          }
                        }
                      }
                    }
                  },
                  '404': {
                    description: 'Transaction not found',
                    content: {
                      'application/json': {
                        schema: {
                          type: 'object',
                          properties: {
                            error: { type: 'string', example: 'Not Found' },
                            message: { type: 'string', example: 'Transaction not found' }
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            '/api/transactions/type/{type}': {
              get: {
                summary: 'Get Transactions by Type',
                description: 'Retrieve all transactions of a specific type (B2C, C2B, B2B, STK_PUSH, etc.)',
                tags: ['Transactions'],
                parameters: [
                  {
                    name: 'type',
                    in: 'path',
                    required: true,
                    description: 'Transaction type',
                    schema: {
                      type: 'string',
                      enum: ['B2C', 'C2B', 'B2B', 'STK_PUSH', 'STK_QUERY', 'REVERSAL'],
                      example: 'STK_PUSH'
                    }
                  },
                  {
                    name: 'page',
                    in: 'query',
                    description: 'Page number for pagination',
                    schema: {
                      type: 'integer',
                      minimum: 1,
                      default: 1,
                      example: 1
                    }
                  },
                  {
                    name: 'limit',
                    in: 'query',
                    description: 'Number of transactions per page',
                    schema: {
                      type: 'integer',
                      minimum: 1,
                      maximum: 100,
                      default: 10,
                      example: 10
                    }
                  }
                ],
                responses: {
                  '200': {
                    description: 'Transactions retrieved successfully',
                    content: {
                      'application/json': {
                        schema: {
                          type: 'object',
                          properties: {
                            success: { type: 'boolean', example: true },
                            message: { type: 'string', example: 'Transactions retrieved successfully' },
                            data: {
                              type: 'array',
                              items: { $ref: '#/components/schemas/Transaction' }
                            },
                            pagination: {
                              type: 'object',
                              properties: {
                                page: { type: 'integer', example: 1 },
                                limit: { type: 'integer', example: 10 },
                                total: { type: 'integer', example: 25 },
                                pages: { type: 'integer', example: 3 }
                              }
                            },
                            timestamp: { type: 'string', format: 'date-time' }
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            '/api/transactions/status/{status}': {
              get: {
                summary: 'Get Transactions by Status',
                description: 'Retrieve all transactions with a specific status (SUCCESS, PENDING, FAILED)',
                tags: ['Transactions'],
                parameters: [
                  {
                    name: 'status',
                    in: 'path',
                    required: true,
                    description: 'Transaction status',
                    schema: {
                      type: 'string',
                      enum: ['SUCCESS', 'PENDING', 'FAILED'],
                      example: 'SUCCESS'
                    }
                  },
                  {
                    name: 'page',
                    in: 'query',
                    description: 'Page number for pagination',
                    schema: {
                      type: 'integer',
                      minimum: 1,
                      default: 1,
                      example: 1
                    }
                  },
                  {
                    name: 'limit',
                    in: 'query',
                    description: 'Number of transactions per page',
                    schema: {
                      type: 'integer',
                      minimum: 1,
                      maximum: 100,
                      default: 10,
                      example: 10
                    }
                  }
                ],
                responses: {
                  '200': {
                    description: 'Transactions retrieved successfully',
                    content: {
                      'application/json': {
                        schema: {
                          type: 'object',
                          properties: {
                            success: { type: 'boolean', example: true },
                            message: { type: 'string', example: 'Transactions retrieved successfully' },
                            data: {
                              type: 'array',
                              items: { $ref: '#/components/schemas/Transaction' }
                            },
                            pagination: {
                              type: 'object',
                              properties: {
                                page: { type: 'integer', example: 1 },
                                limit: { type: 'integer', example: 10 },
                                total: { type: 'integer', example: 15 },
                                pages: { type: 'integer', example: 2 }
                              }
                            },
                            timestamp: { type: 'string', format: 'date-time' }
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            '/api/transactions/analytics/summary': {
              get: {
                summary: 'Get Transaction Analytics Summary',
                description: 'Retrieve comprehensive analytics and statistics about all transactions',
                tags: ['Transactions'],
                responses: {
                  '200': {
                    description: 'Analytics summary retrieved successfully',
                    content: {
                      'application/json': {
                        schema: {
                          type: 'object',
                          properties: {
                            success: { type: 'boolean', example: true },
                            message: { type: 'string', example: 'Analytics summary retrieved successfully' },
                            data: {
                              type: 'object',
                              properties: {
                                totalTransactions: { type: 'integer', example: 150 },
                                totalAmount: { type: 'number', example: 250000 },
                                averageAmount: { type: 'number', example: 1666.67 },
                                successRate: { type: 'number', example: 0.85 },
                                transactionsByType: {
                                  type: 'object',
                                  properties: {
                                    STK_PUSH: { type: 'integer', example: 80 },
                                    B2C: { type: 'integer', example: 35 },
                                    C2B: { type: 'integer', example: 25 },
                                    B2B: { type: 'integer', example: 10 }
                                  }
                                },
                                transactionsByStatus: {
                                  type: 'object',
                                  properties: {
                                    SUCCESS: { type: 'integer', example: 127 },
                                    PENDING: { type: 'integer', example: 15 },
                                    FAILED: { type: 'integer', example: 8 }
                                  }
                                },
                                recentTransactions: {
                                  type: 'array',
                                  items: { $ref: '#/components/schemas/Transaction' }
                                }
                              }
                            },
                            timestamp: { type: 'string', format: 'date-time' }
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            '/callbacks/{type}/{action}': {
              post: {
                summary: 'M-Pesa Callbacks',
                description: 'Receive callbacks from M-Pesa for transaction confirmations and validations',
                tags: ['Callbacks'],
                parameters: [
                  {
                    name: 'type',
                    in: 'path',
                    required: true,
                    description: 'Callback type (stk, c2b, b2c, etc.)',
                    schema: {
                      type: 'string',
                      enum: ['stk', 'c2b', 'b2c', 'b2b', 'reversal'],
                      example: 'stk'
                    }
                  },
                  {
                    name: 'action',
                    in: 'path',
                    required: true,
                    description: 'Callback action (result, timeout, confirm, validate)',
                    schema: {
                      type: 'string',
                      enum: ['result', 'timeout', 'confirm', 'validate'],
                      example: 'result'
                    }
                  }
                ],
                requestBody: {
                  required: true,
                  content: {
                    'application/json': {
                      schema: {
                        type: 'object',
                        description: 'M-Pesa callback payload (varies by transaction type)',
                        example: {
                          MerchantRequestID: '29115-34620561-1',
                          CheckoutRequestID: 'ws_CO_191220191020363925',
                          ResultCode: 0,
                          ResultDesc: 'The service request is processed successfully.',
                          CallbackMetadata: {
                            Item: [
                              { Name: 'Amount', Value: 1 },
                              { Name: 'MpesaReceiptNumber', Value: 'NLJ7RT61SV' },
                              { Name: 'TransactionDate', Value: 20191219102115 },
                              { Name: 'PhoneNumber', Value: 254708374149 }
                            ]
                          }
                        }
                      }
                    }
                  }
                },
                responses: {
                  '200': {
                    description: 'Callback processed successfully',
                    content: {
                      'application/json': {
                        schema: {
                          type: 'object',
                          properties: {
                            success: { type: 'boolean', example: true },
                            message: { type: 'string', example: 'STK callback processed successfully' },
                            callbackType: { type: 'string', example: 'STK' },
                            data: { type: 'object', description: 'Original callback data' },
                            timestamp: { type: 'string', format: 'date-time' }
                          }
                        }
                      }
                    }
                  }
                }
            }
          }
        },
        components: {
            schemas: {
              Transaction: {
                type: 'object',
                required: [
                  'id',
                  'transactionType',
                  'status',
                  'mobileNumber',
                  'amount',
                ],
                properties: {
                  id: {
                    type: 'string',
                    format: 'uuid',
                    description: 'Unique transaction identifier',
                  },
                  transactionType: {
                    type: 'string',
                    enum: ['B2C', 'C2B', 'B2B', 'STK_PUSH', 'STK_QUERY', 'REVERSAL'],
                    description: 'Type of M-Pesa transaction',
                  },
                  status: {
                    type: 'string',
                    enum: ['SUCCESS', 'PENDING', 'FAILED'],
                    description: 'Current transaction status',
                  },
                  mobileNumber: {
                    type: 'string',
                    description: 'Customer mobile number (Kenya format)',
                    example: '254712345678',
                  },
                  amount: {
                    type: 'number',
                    description: 'Transaction amount in KES',
                    example: 1000,
                  },
                  description: {
                    type: 'string',
                    description: 'Optional transaction description',
                  },
                  conversationId: {
                    type: 'string',
                    description: 'System conversation identifier',
                  },
                  originatorConversationId: {
                    type: 'string',
                    description: 'M-Pesa originator conversation identifier',
                  },
                  mpesaTransactionId: {
                    type: 'string',
                    description: 'M-Pesa transaction ID from callback',
                  },
                  mpesaReceiptNumber: {
                    type: 'string',
                    description: 'M-Pesa receipt number from callback',
                  },
                  resultCode: {
                    type: 'integer',
                    description: 'M-Pesa result code (0 = success)',
                  },
                  resultDesc: {
                    type: 'string',
                    description: 'M-Pesa result description',
                  },
                  requestPayload: {
                    type: 'object',
                    description: 'Original request payload sent to M-Pesa',
                  },
                  responsePayload: {
                    type: 'object',
                    description: 'Response payload from M-Pesa',
                  },
                  callbackPayload: {
                    type: 'object',
                    description: 'Callback payload received from M-Pesa',
                  },
                  createdAt: {
                    type: 'string',
                    format: 'date-time',
                    description: 'Transaction creation timestamp',
                  },
                  updatedAt: {
                    type: 'string',
                    format: 'date-time',
                    description: 'Transaction last update timestamp',
                  },
                },
                example: {
                  id: '550e8400-e29b-41d4-a716-446655440000',
                  transactionType: 'STK_PUSH',
                  status: 'SUCCESS',
                  mobileNumber: '254712345678',
                  amount: 1000,
                  description: 'Purchase Payment',
                  conversationId: 'conv-123456',
                  mpesaTransactionId: 'KBL29WVKE0',
                  mpesaReceiptNumber: 'LHM7DUVEMP',
                  resultCode: 0,
                  resultDesc: 'The service request has been processed successfully.',
                  createdAt: '2026-03-13T10:30:00Z',
                  updatedAt: '2026-03-13T10:31:45Z',
                },
              },
              Error: {
                type: 'object',
                required: ['error'],
                properties: {
                  error: {
                    type: 'string',
                    description: 'Error message',
                  },
                  status: {
                    type: 'integer',
                    description: 'HTTP status code',
                  },
                },
              },
              SuccessResponse: {
                type: 'object',
                required: ['success'],
                properties: {
                  success: {
                    type: 'boolean',
                    description: 'Whether the request was successful',
                  },
                  transactionId: {
                    type: 'string',
                    description: 'System transaction ID',
                  },
                  data: {
                    type: 'object',
                    description: 'Response data',
                  },
                },
              },
            },
            responses: {
              BadRequest: {
                description: 'Bad Request - Invalid parameters',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/Error' },
                  },
                },
              },
              NotFound: {
                description: 'Not Found - Resource does not exist',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/Error' },
                  },
                },
              },
              InternalError: {
                description: 'Internal Server Error',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/Error' },
                  },
                },
              },
            },
          },
          tags: [
            {
              name: 'Health',
              description: 'Service health check endpoints',
            },
            {
              name: 'Documentation',
              description: 'API documentation endpoints'
            },
            {
              name: 'B2C',
              description: 'Business to Consumer - Send money from business to customers',
            },
            {
              name: 'C2B',
              description: 'Consumer to Business - Receive payments from customers',
            },
            {
              name: 'B2B',
              description: 'Business to Business - Send money between businesses',
            },
            {
              name: 'STK',
              description: 'STK Push & Query - Prompt customer for PIN or check status',
            },
            {
              name: 'B2Pochi',
              description: 'Business to Pochi payments using B2C endpoint',
            },
            {
              name: 'Reversal',
              description: 'Initiate and manage transaction reversals',
            },
            {
              name: 'Transactions',
              description: 'Query, filter and analyze all transactions in the system',
            },
            {
              name: 'Callbacks',
              description: 'Webhook callbacks from M-Pesa and callback logs',
            }
          ]
        };

        return new Response(JSON.stringify(openApiSpec, null, 2), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Swagger UI
      if (path === '/docs' && method === 'GET') {
        const swaggerUI = `
<!DOCTYPE html>
<html>
<head>
    <title>M-Pesa Integration API Documentation</title>
    <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@5.7.2/swagger-ui.css" />
    <link rel="icon" type="image/png" href="https://unpkg.com/swagger-ui-dist@5.7.2/favicon-32x32.png" sizes="32x32" />
    <style>
        html { box-sizing: border-box; overflow: -moz-scrollbars-vertical; overflow-y: scroll; }
        *, *:before, *:after { box-sizing: inherit; }
        body { margin:0; background: #fafafa; }
    </style>
</head>
<body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5.7.2/swagger-ui-bundle.js"></script>
    <script src="https://unpkg.com/swagger-ui-dist@5.7.2/swagger-ui-standalone-preset.js"></script>
    <script>
        window.onload = function() {
            const ui = SwaggerUIBundle({
                url: '/api-docs',
                dom_id: '#swagger-ui',
                deepLinking: true,
                presets: [
                    SwaggerUIBundle.presets.apis,
                    SwaggerUIStandalonePreset
                ],
                plugins: [
                    SwaggerUIBundle.plugins.DownloadUrl
                ],
                layout: "StandaloneLayout"
            });
        };
    </script>
</body>
</html>`;
        response = new Response(swaggerUI, {
          headers: { ...corsHeaders, 'Content-Type': 'text/html' }
        });
        return response;
      }

      // Route handlers
      if (path.startsWith('/api/b2c')) {
        return await handleB2CRoutes(request, env, path);
      }

      if (path.startsWith('/api/c2b')) {
        return await handleC2BRoutes(request, env, path);
      }

      if (path.startsWith('/api/b2b')) {
        return await handleB2BRoutes(request, env, path);
      }

      if (path.startsWith('/api/stk')) {
        return await handleSTKRoutes(request, env, path);
      }

      if (path.startsWith('/api/b2pochi')) {
        return await handleB2PochiRoutes(request, env, path);
      }

      if (path.startsWith('/api/reversal')) {
        return await handleReversalRoutes(request, env, path);
      }

      if (path.startsWith('/api/transactions')) {
        return await handleTransactionRoutes(request, env, path);
      }

      if (path.startsWith('/callbacks')) {
        return await handleCallbackRoutes(request, env, path);
      }

      // 404 Not Found
      response = new Response(JSON.stringify({
        error: 'Not Found',
        message: `Route ${method} ${path} not found`,
        availableRoutes: [
          'GET /health',
          'GET /api-docs',
          'GET /docs',
          'POST /api/b2c/send',
          'GET /api/b2c/status/{conversationId}',
          'POST /api/c2b/register',
          'GET /api/c2b/status/{conversationId}',
          'POST /api/b2b/send',
          'GET /api/b2b/status/{conversationId}',
          'POST /api/stk/push',
          'GET /api/stk/status/{checkoutRequestId}',
          'POST /api/b2pochi/send',
          'GET /api/b2pochi/status/{conversationId}',
          'POST /api/reversal/request',
          'GET /api/reversal/status/{conversationId}',
          'GET /api/transactions/all',
          'POST /callbacks/*'
        ]
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } catch (error) {
      console.error('Worker error:', error);
      errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      // Log detailed error information in dev mode
      if (isDev) {
        console.error(`\n${'Error Stack Trace:'}`);
        console.error(error instanceof Error ? error.stack : String(error));
      }

      response = new Response(JSON.stringify({
        error: 'Internal Server Error',
        message: errorMessage,
        timestamp: new Date().toISOString()
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Log the API request and response
    const responseTime = Date.now() - startTime;
    const statusCode = response?.status || 500;
    const responseBody = await response.clone().text().then(text => {
      try {
        return JSON.parse(text);
      } catch {
        return text;
      }
    }).catch(() => null);

    await logApiRequest(env, path, method, statusCode, responseTime, errorMessage, requestContext, responseBody);

    // Log response in dev mode with summary
    if (isDev) {
      const methodColor = method === 'GET' ? '\x1b[36m' : method === 'POST' ? '\x1b[32m' : '\x1b[35m';
      const statusColor = statusCode >= 200 && statusCode < 300 ? '\x1b[32m' : statusCode >= 400 && statusCode < 500 ? '\x1b[33m' : '\x1b[31m';
      console.log(
        `${methodColor}${method}\x1b[0m ${path} → ${statusColor}${statusCode}\x1b[0m (${responseTime}ms)`
      );
    }

    return response!;
  },
};
