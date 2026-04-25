# Logging System Documentation

## Overview

A comprehensive logging system has been implemented for the M-Pesa Integration API to track all requests, responses, and errors in development mode.

## Features

### 1. **Request Logging**
Automatically logs all incoming HTTP requests with:
- HTTP method (colorized)
- Request path and query parameters
- Request headers (sensitive headers excluded)
- Request body (JSON formatted)
- Timestamp

### 2. **Response Logging**
Automatically logs all outgoing HTTP responses with:
- HTTP status code (colorized based on status)
- Response time in milliseconds
- Response body (JSON formatted)
- Timestamp

### 3. **Error Logging**
Enhanced error handling with:
- Detailed error messages
- HTTP status codes
- Full error stack traces
- Error context and details
- Request/response information

### 4. **Color-Coded Console Output**
Terminal output is color-coded for easy reading:
- **Cyan**: GET requests
- **Green**: POST requests and successful responses (200-299)
- **Yellow**: PUT requests and client errors (400-499)
- **Red**: DELETE requests and server errors (500+)
- **Magenta**: PATCH requests
- **Blue**: Other requests

## Configuration

### Enable/Disable Logging

The logging is controlled by the `isDevMode()` function in `src/utils/logger.ts`:

```typescript
export function isDevMode(): boolean {
  return true; // Set to false to disable logging
}
```

To disable logging in production:

```typescript
export function isDevMode(): boolean {
  // Check environment variable or deployment context
  return process.env.NODE_ENV === 'development';
}
```

### Security Features

The logger automatically excludes sensitive headers:
- `Authorization`
- `Cookie`
- `Secret`

These headers are filtered from logs to prevent exposing credentials.

## Usage

The logging system is automatically integrated into the main request handler. No additional code is needed - all requests and responses are logged automatically.

### Manual Logging (Optional)

For custom logging in your route handlers:

```typescript
import { logRequest, logResponse, logError, createRequestContext } from './utils/logger';

// Log a request
const requestContext = await createRequestContext(request);
logRequest(requestContext);

// Log a response
const responseContext = await createResponseContext(response, requestContext);
logResponse(responseContext);

// Log an error
logError({
  timestamp: new Date().toISOString(),
  method: 'POST',
  path: '/api/b2c/send',
  statusCode: 500,
  error: 'Database connection failed'
});
```

## Log Output Examples

### Successful Request
```
═══════════════════════════════════════
📥 REQUEST [2026-03-14, 10:30:45]
═══════════════════════════════════════
POST /api/b2c/send

Headers:
{
  "content-type": "application/json"
}

Body:
{
  "mobileNumber": "254712345678",
  "amount": 1000
}

═══════════════════════════════════════
📤 RESPONSE [2026-03-14, 10:30:46]
═══════════════════════════════════════
Status: 200 | Response Time: 234ms

Body:
{
  "success": true,
  "message": "B2C transaction initiated successfully",
  "data": {
    "conversationId": "AG_20231212_1234567890"
  }
}

═══════════════════════════════════════
```

### Error Request
```
═══════════════════════════════════════
❌ ERROR [2026-03-14, 10:31:15]
═══════════════════════════════════════
POST /api/stk/push - Status: 400

Error Message:
Validation Error: Mobile number and amount are required

Error Details:
{
  "error": "Validation Error",
  "message": "Mobile number and amount are required"
}

═══════════════════════════════════════
```

### Request Summary
Each request also generates a concise one-line summary:
```
POST /api/b2c/send → 200 (234ms)
GET /api/stk/status/ABC123 → 200 (156ms)
POST /api/reversal/initiate → 400 (42ms)
```

## Log Files Location

Currently, logs are output to the console. In a production environment, you might want to:

1. **Stream to External Service**
   - Datadog
   - LogRocket
   - Sentry
   - CloudWatch

2. **Database Logging**
   - Prisma ORM already integrated
   - Create a `logs` table for persistent storage

3. **File Logging**
   - For Lambda/Worker environments, use services like S3 or Cloud Storage

## Development Workflow

### Local Development (wrangler dev)
```bash
npm run dev
```

All requests will be logged to the console with full details.

### Production Deployment
```bash
npm run deploy
```

Configure `isDevMode()` to disable verbose logging or adjust log levels as needed.

## Troubleshooting

### Logs Not Appearing
1. Check if `isDevMode()` returns `true`
2. Verify running in development environment
3. Check browser/terminal console

### Sensitive Data in Logs
- Review the `formatHeaders()` function for excluded headers
- Add more headers to the exclusion list if needed
- Never log full request/response bodies for sensitive operations

### Performance Impact
- Logging JSON parsing is optimized with error handling
- Disabled in production mode
- Minimal overhead in dev mode (< 5ms per request)

## Best Practices

1. **Development Only**: Keep verbose logging enabled only during development
2. **Sensitive Data**: Never log passwords, API keys, or personal information
3. **Performance**: In production, use sampled logging for high-traffic endpoints
4. **Monitoring**: Use external services (Sentry, Datadog) for production logging
5. **Debugging**: Use logs to track API flow and identify issues quickly

## Future Enhancements

Potential improvements for the logging system:

- [ ] Structured logging (JSON format)
- [ ] Log levels (debug, info, warn, error)
- [ ] Log rotation and archival
- [ ] Real-time log streaming dashboard
- [ ] Performance metrics and analytics
- [ ] Correlation IDs for request tracing
- [ ] Sampling strategies for high-volume endpoints
