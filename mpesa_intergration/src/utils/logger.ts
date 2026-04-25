/**
 * Logging utility for M-Pesa Integration API
 * Logs all requests, responses, and errors in development mode
 */

export interface LogContext {
  timestamp: string;
  method: string;
  path: string;
  statusCode?: number;
  responseTime?: number;
  requestBody?: any;
  responseBody?: any;
  error?: string;
  headers?: Record<string, string>;
  queryParams?: Record<string, string>;
}

/**
 * Color codes for console output
 */
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
};

/**
 * Check if running in development mode
 */
export function isDevMode(): boolean {
  // Cloudflare Workers: Always return true to enable logging
  // In production, you can modify this to check environment variables
  return true;
}

/**
 * Get HTTP method color
 */
function getMethodColor(method: string): string {
  switch (method) {
    case 'GET':
      return colors.cyan;
    case 'POST':
      return colors.green;
    case 'PUT':
      return colors.yellow;
    case 'DELETE':
      return colors.red;
    case 'PATCH':
      return colors.magenta;
    default:
      return colors.blue;
  }
}

/**
 * Get status code color
 */
function getStatusColor(statusCode?: number): string {
  if (!statusCode) return colors.dim;
  if (statusCode >= 200 && statusCode < 300) return colors.green;
  if (statusCode >= 300 && statusCode < 400) return colors.cyan;
  if (statusCode >= 400 && statusCode < 500) return colors.yellow;
  return colors.red;
}

/**
 * Format headers for logging
 */
function formatHeaders(headers: any): Record<string, string> {
  const formatted: Record<string, string> = {};
  if (headers instanceof Headers) {
    headers.forEach((value, key) => {
      // Skip sensitive headers
      if (!key.toLowerCase().includes('authorization') && 
          !key.toLowerCase().includes('cookie') &&
          !key.toLowerCase().includes('secret')) {
        formatted[key] = value;
      }
    });
  }
  return formatted;
}

/**
 * Format body for logging (safe JSON parsing)
 */
async function formatBody(body: any): Promise<any> {
  if (!body) return null;
  
  try {
    if (typeof body === 'string') {
      return JSON.parse(body);
    }
    if (body instanceof ReadableStream) {
      const reader = body.getReader();
      const chunks: Uint8Array[] = [];
      let result = await reader.read();
      while (!result.done) {
        chunks.push(result.value);
        result = await reader.read();
      }
      // Combine chunks and decode
      const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
      const combined = new Uint8Array(totalLength);
      let offset = 0;
      for (const chunk of chunks) {
        combined.set(chunk, offset);
        offset += chunk.length;
      }
      const text = new TextDecoder().decode(combined);
      return JSON.parse(text);
    }
    return body;
  } catch (e) {
    return `[Binary or non-JSON data]`;
  }
}

/**
 * Log incoming request
 */
export function logRequest(context: LogContext, isDev: boolean = isDevMode()): void {
  if (!isDev) return;

  const timestamp = new Date(context.timestamp).toLocaleString();
  const methodColor = getMethodColor(context.method);
  const methodStr = `${methodColor}${context.method}${colors.reset}`;
  
  console.log(
    `\n${colors.bright}${colors.blue}═══════════════════════════════════════${colors.reset}`
  );
  console.log(
    `${colors.bright}📥 REQUEST${colors.reset} [${timestamp}]`
  );
  console.log(
    `${colors.bright}═══════════════════════════════════════${colors.reset}`
  );
  console.log(`${methodStr} ${colors.bright}${context.path}${colors.reset}`);
  
  if (context.headers && Object.keys(context.headers).length > 0) {
    console.log(`\n${colors.bright}Headers:${colors.reset}`);
    console.log(JSON.stringify(context.headers, null, 2));
  }
  
  if (context.queryParams && Object.keys(context.queryParams).length > 0) {
    console.log(`\n${colors.bright}Query Params:${colors.reset}`);
    console.log(JSON.stringify(context.queryParams, null, 2));
  }
  
  if (context.requestBody) {
    console.log(`\n${colors.bright}Body:${colors.reset}`);
    console.log(JSON.stringify(context.requestBody, null, 2));
  }
}

/**
 * Log outgoing response
 */
export function logResponse(context: LogContext, isDev: boolean = isDevMode()): void {
  if (!isDev) return;

  const timestamp = new Date(context.timestamp).toLocaleString();
  const statusColor = getStatusColor(context.statusCode);
  const statusStr = `${statusColor}${context.statusCode || 'N/A'}${colors.reset}`;
  const timeStr = context.responseTime ? `${colors.bright}${context.responseTime}ms${colors.reset}` : 'N/A';
  
  console.log(
    `\n${colors.bright}${colors.green}═══════════════════════════════════════${colors.reset}`
  );
  console.log(
    `${colors.bright}📤 RESPONSE${colors.reset} [${timestamp}]`
  );
  console.log(
    `${colors.bright}═══════════════════════════════════════${colors.reset}`
  );
  console.log(
    `Status: ${statusStr} | Response Time: ${timeStr}`
  );
  
  if (context.responseBody) {
    console.log(`\n${colors.bright}Body:${colors.reset}`);
    console.log(JSON.stringify(context.responseBody, null, 2));
  }
  
  console.log(
    `\n${colors.bright}${colors.green}═══════════════════════════════════════${colors.reset}\n`
  );
}

/**
 * Log error
 */
export function logError(context: LogContext, isDev: boolean = isDevMode()): void {
  if (!isDev) return;

  const timestamp = new Date(context.timestamp).toLocaleString();
  const statusColor = getStatusColor(context.statusCode);
  const statusStr = `${statusColor}${context.statusCode || 500}${colors.reset}`;
  
  console.error(
    `\n${colors.bright}${colors.red}═══════════════════════════════════════${colors.reset}`
  );
  console.error(
    `${colors.bright}❌ ERROR${colors.reset} [${timestamp}]`
  );
  console.error(
    `${colors.bright}═══════════════════════════════════════${colors.reset}`
  );
  console.error(
    `${context.method} ${context.path} - Status: ${statusStr}`
  );
  
  if (context.error) {
    console.error(`\n${colors.bright}Error Message:${colors.reset}`);
    console.error(`${colors.red}${context.error}${colors.reset}`);
  }
  
  if (context.responseBody) {
    console.error(`\n${colors.bright}Error Details:${colors.reset}`);
    console.error(JSON.stringify(context.responseBody, null, 2));
  }
  
  console.error(
    `${colors.bright}${colors.red}═══════════════════════════════════════${colors.reset}\n`
  );
}

/**
 * Log request summary
 */
export function logRequestSummary(
  method: string,
  path: string,
  statusCode: number,
  responseTime: number,
  isDev: boolean = isDevMode()
): void {
  if (!isDev) return;

  const methodColor = getMethodColor(method);
  const statusColor = getStatusColor(statusCode);
  
  const summary = `${methodColor}${method}${colors.reset} ${colors.bright}${path}${colors.reset} → ${statusColor}${statusCode}${colors.reset} (${colors.bright}${responseTime}ms${colors.reset})`;
  
  console.log(summary);
}

/**
 * Create a logger context from a Request
 */
export async function createRequestContext(request: Request): Promise<LogContext> {
  const url = new URL(request.url);
  const headers = formatHeaders(request.headers);
  const queryParams: Record<string, string> = {};
  
  url.searchParams.forEach((value, key) => {
    queryParams[key] = value;
  });

  // Don't read the body here to avoid consuming the stream.
  // The body will be logged by the route handlers after they process it.
  const requestBody = null;

  return {
    timestamp: new Date().toISOString(),
    method: request.method,
    path: url.pathname + url.search,
    headers,
    queryParams: Object.keys(queryParams).length > 0 ? queryParams : undefined,
    requestBody,
  };
}

/**
 * Create a logger context for response
 */
export async function createResponseContext(
  response: Response,
  requestContext: LogContext
): Promise<LogContext> {
  let responseBody = null;
  
  try {
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      const text = await response.clone().text();
      if (text) {
        responseBody = JSON.parse(text);
      }
    }
  } catch (e) {
    // Could not parse response body
  }

  return {
    ...requestContext,
    statusCode: response.status,
    responseBody,
  };
}
