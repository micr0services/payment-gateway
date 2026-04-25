# M-Pesa Integration API

A comprehensive Cloudflare Worker service that integrates with Safaricom M-Pesa API. This service supports all major M-Pesa transaction types: B2C (Business to Consumer), C2B (Consumer to Business), B2B (Business to Business), STK Push, and STK Query.

## Features

✅ **B2C Transactions** - Send money from business to customer accounts  
✅ **C2B Transactions** - Receive payments from customers  
✅ **B2B Transactions** - Send money between business accounts  
✅ **STK Push** - Prompt customers to enter M-Pesa PIN on their phones  
✅ **STK Query** - Check STK Push transaction status  
✅ **Transaction Reversal** - Reverse completed transactions  
✅ **Transaction Status Queries** - Check status of all transaction types  
✅ **Webhook Callbacks** - Handle real-time updates from M-Pesa  
✅ **API Logging** - Track all API requests and responses  
✅ **Swagger Documentation** - Interactive API documentation  
✅ **Cloudflare Workers** - Serverless edge deployment  
✅ **Database Integration** - PostgreSQL with Prisma ORM  

## Supported M-Pesa Products

- **Lipa Na M-Pesa** – STK Push transactions
- **M-Pesa API** – B2B, B2C and C2B APIs
- **B2Pochi** – Business-to-Pochi mobile money API
- **Transaction Reversal** – Reverse completed transactions


## Project Structure

```
src/
├── index.ts                          # Main Cloudflare Worker entry point
├── routes/
│   ├── b2c.routes.ts                # B2C endpoints with status queries
│   ├── c2b.routes.ts                # C2B endpoints with status queries
│   ├── b2b.routes.ts                # B2B endpoints with status queries
│   ├── stk.routes.ts                # STK endpoints with status queries
│   ├── b2pochi.routes.ts            # B2Pochi endpoints with status queries
│   ├── reversal.routes.ts           # Reversal endpoints with status queries
│   ├── transaction.routes.ts         # Transaction query endpoints
│   └── callback.routes.ts            # Webhook callback endpoints
├── types/
│   └── mpesa.types.ts               # TypeScript types and interfaces
└── utils/
    └── phone.utils.ts               # Phone number formatting utilities

prisma/
├── schema.prisma                     # Database schema
└── migrations/                       # Database migrations

netlify.toml                          # Netlify deployment configuration
wrangler.toml                         # Cloudflare Workers configuration
```

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- PostgreSQL database (for production data persistence)
- M-Pesa sandbox/production credentials from Safaricom
- Cloudflare account (for Workers deployment) or Netlify account (for Functions deployment)

## Installation

1. **Clone the repository:**
```bash
git clone <repository-url>
cd mpesa-integration
```

2. **Install dependencies:**
```bash
npm install
```

3. **Setup environment variables:**

For Cloudflare Workers:
```bash
# Copy and edit wrangler.toml with your environment variables
# The following variables need to be set:
MPESA_CONSUMER_KEY=your_consumer_key
MPESA_CONSUMER_SECRET=your_consumer_secret
MPESA_SHORTCODE=your_shortcode
MPESA_PASSKEY=your_passkey
MPESA_ENVIRONMENT=sandbox
MPESA_C2B_VALIDATE_URL=https://your-worker-url/callbacks/c2b/validate
MPESA_C2B_CONFIRM_URL=https://your-worker-url/callbacks/c2b/confirm
DATABASE_URL=your_postgresql_connection_string
```

For Netlify Functions:
```bash
# Create .env file for local development
cp .env.example .env
```

Edit `.env` with your configuration:
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/mpesa_integration"

# M-Pesa Configuration
MPESA_CONSUMER_KEY=your_consumer_key
MPESA_CONSUMER_SECRET=your_consumer_secret
MPESA_SHORTCODE=your_shortcode
MPESA_PASSKEY=your_passkey
MPESA_INITIATOR_NAME=your_initiator_name
MPESA_INITIATOR_PASSWORD=your_initiator_password
MPESA_ENVIRONMENT=sandbox

# Callback URLs (update with your Netlify site URL)
MPESA_C2B_VALIDATE_URL=https://your-netlify-site.netlify.app/callbacks/c2b/validate
MPESA_C2B_CONFIRM_URL=https://your-netlify-site.netlify.app/callbacks/c2b/confirm
```

4. **Setup database:**
```bash
# Generate Prisma client
npm run prisma-generate

# Run migrations
npm run prisma-migrate
```

5. **Development:**
```bash
# For Cloudflare Workers
npm run dev

# For Netlify Functions (requires Netlify CLI)
netlify dev
```

6. **Build and Deploy:**

**Cloudflare Workers:**
```bash
npm run build    # Dry run build
npm run deploy   # Deploy to Cloudflare
```

**Netlify:**
```bash
netlify deploy --prod
```

## API Endpoints

The API provides the following endpoints:

### Core Transaction Endpoints
- `POST /api/b2c/send` - Send money to customer
- `POST /api/c2b/register` - Register C2B URLs
- `POST /api/b2b/send` - Send money to business
- `POST /api/stk/push` - Initiate STK Push
- `POST /api/b2pochi/send` - Send money via B2Pochi
- `POST /api/reversal/initiate` - Initiate transaction reversal

### Status Query Endpoints
- `GET /api/b2c/status/{conversationId}` - Check B2C transaction status
- `GET /api/c2b/status/{conversationId}` - Check C2B transaction status
- `GET /api/b2b/status/{conversationId}` - Check B2B transaction status
- `GET /api/stk/status/{checkoutRequestId}` - Check STK transaction status
- `GET /api/b2pochi/status/{conversationId}` - Check B2Pochi transaction status
- `GET /api/reversal/status/{conversationId}` - Check reversal status

### Other Endpoints
- `GET /api/transactions/all` - Get all transactions
- `POST /callbacks/*` - M-Pesa webhook callbacks
- `GET /health` - Health check
- `GET /api-docs` - OpenAPI specification
- `GET /docs` - Swagger UI documentation

## API Documentation

Interactive Swagger documentation is available at:
```
https://your-worker-url/docs
```

OpenAPI specification JSON:
```
https://your-worker-url/api-docs
```

## Database Schema

The application uses PostgreSQL with Prisma ORM and includes the following tables:

- **Transaction** - All M-Pesa transactions
- **WebhookLog** - M-Pesa callback logs
- **ApiLog** - API request/response logs

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `MPESA_CONSUMER_KEY` | M-Pesa API consumer key | Yes |
| `MPESA_CONSUMER_SECRET` | M-Pesa API consumer secret | Yes |
| `MPESA_SHORTCODE` | Your M-Pesa shortcode | Yes |
| `MPESA_PASSKEY` | M-Pesa passkey for STK | Yes |
| `MPESA_ENVIRONMENT` | `sandbox` or `production` | Yes |
| `MPESA_C2B_VALIDATE_URL` | C2B validation callback URL | Yes |
| `MPESA_C2B_CONFIRM_URL` | C2B confirmation callback URL | Yes |
| `DATABASE_URL` | PostgreSQL connection string | Yes |

## Development

```bash
# Install dependencies
npm install

# Generate Prisma client
npm run prisma-generate

# Run database migrations
npm run prisma-migrate

# Start development server (Cloudflare)
npm run dev

# View database
npm run prisma-studio
```

## Deployment

### Cloudflare Workers
```bash
# Deploy to Cloudflare
npm run deploy
```

### Netlify Functions
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy
netlify deploy --prod
```

## License

MIT

## API Endpoints

### B2C (Business to Consumer)

**Send Money:**
```http
POST /api/b2c/send
Content-Type: application/json

{
  "mobileNumber": "0712345678",
  "amount": 100,
  "description": "Salary Payment"
}
```

> ⚠️ Internally this performs a POST to `/mpesa/b2c/v1/paymentrequest`.
> The sandbox endpoint `/mpesa/b2c/v1/payroll` is deprecated and returns 404.

**Check Status:**
```http
GET /api/b2c/status/{conversationId}
```

### C2B (Consumer to Business)

**Register Callback URLs:**
```http
POST /api/c2b/register
```

**Simulate Payment:**
```http
POST /api/c2b/simulate
Content-Type: application/json

{
  "mobileNumber": "0712345678",
  "amount": 100,
  "description": "Payment Reference"
}
```
Response includes both the internal `conversationId` (for status queries) and the M-Pesa response fields:

```json
{
  "success": true,
  "transactionId": "...",
  "conversationId": "your-generated-uuid",
  "mpesaResponse": { ... }
}
```

**Check Status:**
```http
GET /api/c2b/status/{conversationId}
```
You may supply either the `conversationId` returned by the simulate call or the
`OriginatorConversationID` field from the M-Pesa response. The lookup will
search all known identifiers.

### B2B (Business to Business)

**Send Money:**
```http
POST /api/b2b/send
Content-Type: application/json

{
  "receiverPartyPublicID": "123456",
  "amount": 1000,
  "description": "Invoice Payment",
  "accountReference": "INV-001"
}
```

**Check Status:**
```http
GET /api/b2b/status/{conversationId}
You may supply either the internal `conversationId` returned by the initiate call or the
`ConversationID`/originator ID provided by M-Pesa; the service will search all stored identifiers.
```

### B2Pochi (Business to Pochi)

**Send Money:**
```http
POST /api/b2pochi/send
Content-Type: application/json

{
  "mobileNumber": "0712345678",
  "amount": 100,
  "description": "Optional note"
}
```

The endpoint uses the same underlying M-Pesa B2C call but is labelled as the
B2Pochi product; responses include `mpesaResponse` with the usual
`OriginatorConversationID`.

### STK Push & Query

**Initiate STK Push:**
```http
POST /api/stk/push
Content-Type: application/json

{
  "mobileNumber": "0712345678",
  "amount": 500,
  "accountReference": "ORDER-001",
  "transactionDescription": "Purchase Payment"
}
```

**Query STK Push Status:**
```http
POST /api/stk/query
Content-Type: application/json

{
  "checkoutRequestId": "ws_CO_123456789"
}
```
> _Tip:_ the `checkoutRequestId` is returned when you initiate the push. After the push API
> accepts your request it may take a few seconds for the transaction to become queryable, so
> a query issued immediately can still return a 404. IDs also expire quickly in the sandbox –
> using an old or invalid ID will return a 404 error. The service checks for a matching local
> transaction first and will return a descriptive message if none exists.

### Transactions

**Get All Transactions:**
```http
GET /api/transactions/all?skip=0&take=10&type=B2C&status=SUCCESS
```

**Get Transaction by ID:**
```http
GET /api/transactions/{id}
```

**Get Transactions by Type:**
```http
GET /api/transactions/type/B2C?skip=0&take=10
```

**Get Transactions by Status:**
```http
GET /api/transactions/status/SUCCESS?skip=0&take=10
```

**Get Analytics Summary:**
```http
GET /api/transactions/analytics/summary
```

Response:
```json
{
  "total": 150,
  "byStatus": {
    "successful": 120,
    "pending": 20,
    "failed": 10
  },
  "byType": {
    "b2c": 40,
    "c2b": 50,
    "b2b": 30,
    "stk": 30
  }
}
```

## Database Schema

### Transaction Table
Stores all M-Pesa transactions with:
- Transaction type (B2C, C2B, B2B, STK_PUSH, STK_QUERY, REVERSAL)
- Status (SUCCESS, PENDING, FAILED)
- Mobile number
- Amount
- Request and response payloads
- Callback data
- M-Pesa transaction IDs
- Timestamps

### WebhookLog Table
Logs all incoming M-Pesa callbacks with:
- Event type
- Processing status
- Payload
- Error messages
- Timestamp

### ApiLog Table
Tracks all API requests with:
- Endpoint
- HTTP method
- Status code
- Response time
- Timestamp

## Prisma Commands

```bash
# Generate Prisma Client
npm run prisma-generate

# Create or apply migrations
npm run prisma-migrate

# Open Prisma Studio (GUI for database)
npm run prisma-studio
```

## Development

### File Structure Best Practices

- Each M-Pesa integration type has its own service file
- Routes are separated by transaction type
- All types are defined in `types/mpesa.types.ts`
- Common M-Pesa operations are in `services/mpesa.service.ts`

### Adding New Endpoints

1. Create the service method in the appropriate service file
2. Create/update the route file
3. Add Swagger documentation comments
4. Update the TransactionType in the Prisma schema if needed
5. Test the endpoint

### Error Handling

All endpoints return consistent error responses:
```json
{
  "error": "Error message",
  "status": 400
}
```

## Testing

### Using cURL

```bash
# Test B2C endpoint
curl -X POST http://localhost:3000/api/b2c/send \
  -H "Content-Type: application/json" \
  -d '{
    "mobileNumber": "0712345678",
    "amount": 100,
    "description": "Test Payment"
  }'

# Get transactions
curl http://localhost:3000/api/transactions/all

# Get analytics
curl http://localhost:3000/api/transactions/analytics/summary
```

### Using Postman

Import the API endpoints and test with the Swagger documentation at `/api-docs`

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:password@localhost:5432/mpesa` |
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment | `development` or `production` |
| `MPESA_CONSUMER_KEY` | M-Pesa Consumer Key | Your key from Safaricom |
| `MPESA_CONSUMER_SECRET` | M-Pesa Consumer Secret | Your secret from Safaricom |
| `MPESA_SHORTCODE` | Business shortcode | `123456` |
| `MPESA_PASSKEY` | M-Pesa passkey | Your passkey |
| `MPESA_INITIATOR_NAME` | Initiator name | `testuser` |
| `MPESA_INITIATOR_PASSWORD` | Initiator password | Your password |
| `MPESA_ENVIRONMENT` | sandbox or production | `sandbox` |
| `MPESA_*_CALLBACK_URL` | Callback URLs for each transaction type | URLs for your server |

## Production Deployment

1. Use PostgreSQL in production (not SQLite)
2. Set `NODE_ENV=production`
3. Use real M-Pesa credentials
4. Configure proper callback URLs (public domain)
5. Enable HTTPS for all endpoints
6. Set strong database passwords
7. Use environment variable management for secrets
8. Enable CORS if needed
9. Add rate limiting
10. Monitor logs and errors

## Troubleshooting

### Database Connection Issues
```bash
# Check if PostgreSQL is running
psql -U user -d mpesa_integration -c "SELECT 1"

# Re-sync database schema
npm run prisma-migrate
```

### M-Pesa Authentication Failures
- Verify consumer key and secret are correct
- Check if using sandbox vs production correctly
- Ensure initiator name and password are set correctly

### Callback Issues
- Verify callback URLs in environment variables
- Ensure server is accessible from the internet
- Check firewall and network settings
- Monitor webhook logs at `/callbacks/logs`

## Contributing

1. Create a feature branch
2. Make your changes
3. Add/update tests
4. Submit a pull request

## License

MIT License

## Support

For issues or questions:
1. Check the Swagger documentation at `/api-docs`
2. Review the transaction logs
3. Check webhook logs at `/callbacks/logs`
4. Contact Safaricom M-Pesa support for API-related issues

## References

- [Safaricom M-Pesa API Documentation](https://developer.safaricom.co.ke/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Express.js Documentation](https://expressjs.com/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
# mpesa_intergration
