# M-Pesa Integration - Quick Start Guide

This guide will help you get the M-Pesa integration service up and running quickly.

## Prerequisites

- Node.js (v16 or higher)
- Docker and Docker Compose (for PostgreSQL)
- M-Pesa credentials from Safaricom

## Step 1: Setup Database

### Option A: Using Docker (Recommended)

```bash
docker-compose up -d
```

This will start a PostgreSQL container with the following credentials:
- User: `mpesa_user`
- Password: `mpesa_secure_password_123`
- Port: `5432`

### Option B: Using Local PostgreSQL

Create a database:
```bash
createdb mpesa_integration
```

## Step 2: Configure Environment Variables

Copy the example environment file:
```bash
cp .env.example .env
```

Edit `.env` and add your M-Pesa credentials:

```env
# Database - if using Docker
DATABASE_URL="postgresql://mpesa_user:mpesa_secure_password_123@localhost:5432/mpesa_integration"

# Server
PORT=3000
NODE_ENV=development

# M-Pesa Configuration (Get these from Safaricom)
MPESA_CONSUMER_KEY=your_consumer_key_here
MPESA_CONSUMER_SECRET=your_consumer_secret_here
MPESA_SHORTCODE=174379  # Your business shortcode
MPESA_PASSKEY=bfb279f9aa9bdbcf158e97dd1a503b6fd78cff096f948b23cdb75f38e0de8521  # Your passkey
MPESA_INITIATOR_NAME=testuser  # Your initiator name
MPESA_INITIATOR_PASSWORD=your_initiator_password_here
MPESA_ENVIRONMENT=sandbox  # Use 'sandbox' for testing, 'production' for live

# Callback URLs - Change to your domain in production
# C2B uses two separate endpoints for validation and confirmation
MPESA_C2B_VALIDATE_URL=http://your-domain.com/callbacks/c2b/validate
MPESA_C2B_CONFIRM_URL=http://your-domain.com/callbacks/c2b/confirm
MPESA_B2C_CALLBACK_URL=http://your-domain.com/callbacks/c2b
MPESA_STK_CALLBACK_URL=http://your-domain.com/callbacks/stk
MPESA_ACCOUNT_BALANCE_CALLBACK_URL=http://your-domain.com/callbacks/account-balance
MPESA_TRANSACTION_STATUS_CALLBACK_URL=http://your-domain.com/callbacks/transaction-status
```

## Step 3: Install Dependencies

```bash
npm install
```

## Step 4: Setup Database Schema

Push the Prisma schema to your database:

```bash
npm run prisma-migrate
```

This will create all required tables:
- `Transaction` - Stores all M-Pesa transactions
- `WebhookLog` - Logs all incoming callbacks
- `ApiLog` - Logs all API requests

## Step 5: Start the Server

### Development Mode (with hot reload):
```bash
npm run dev
```

### Production Mode:
```bash
npm run build
npm run start
```

The server will start at `http://localhost:3000`

## Step 6: Access API Documentation

Open your browser and navigate to:
```
http://localhost:3000/api-docs
```

You'll see the interactive Swagger documentation with all available endpoints.

## Testing the Integration

### 1. Test the Health Endpoint

```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "OK",
  "message": "M-Pesa Integration Service is running"
}
```

### 2. Register C2B Callback URLs

```bash
curl -X POST http://localhost:3000/api/c2b/register
```

### 3. Test STK Push

```bash
curl -X POST http://localhost:3000/api/stk/push \
  -H "Content-Type: application/json" \
  -d '{
    "mobileNumber": "0712345678",
    "amount": 100,
    "accountReference": "TEST-001",
    "transactionDescription": "Test Payment"
  }'
```

### 4. Query Transactions

```bash
# Get all transactions
curl http://localhost:3000/api/transactions/all

# Get analytics summary
curl http://localhost:3000/api/transactions/analytics/summary

# Get B2C transactions
curl http://localhost:3000/api/transactions/type/B2C

# Get successful transactions
curl http://localhost:3000/api/transactions/status/SUCCESS
```

## Available Endpoints

### B2C (Business to Consumer)
- `POST /api/b2c/send` - Send money to customer
- `GET /api/b2c/status/{conversationId}` - Check transaction status

### C2B (Consumer to Business)
- `POST /api/c2b/register` - Register callback URLs
- `POST /api/c2b/simulate` - Simulate customer payment
- `GET /api/c2b/status/{conversationId}` - Check transaction status

### B2B (Business to Business)
- `POST /api/b2b/send` - Send money to another business
- `GET /api/b2b/status/{conversationId}` - Check transaction status (you can use the ID returned by M-Pesa if preferred)

### STK (SIM Toolkit)
- `POST /api/stk/push` - Initiate STK Push
- `POST /api/stk/query` - Query STK status
- `GET /api/stk/status/{conversationId}` - Check transaction status

### Transactions
- `GET /api/transactions/all` - Get all transactions
- `GET /api/transactions/{id}` - Get transaction details
- `GET /api/transactions/type/{type}` - Get transactions by type
- `GET /api/transactions/status/{status}` - Get transactions by status
- `GET /api/transactions/analytics/summary` - Get analytics summary

### Webhooks
- `POST /callbacks/c2b` - C2B webhook callback
- `POST /callbacks/b2c` - B2C webhook callback
- `POST /callbacks/stk` - STK webhook callback
- `GET /callbacks/logs` - View webhook logs

## Database Management

### View Data with Prisma Studio

```bash
npm run prisma-studio
```

This opens a GUI where you can:
- View all transactions
- Browse webhook logs
- Check API logs
- Create/update records

### Run Database Migrations

If you modify `prisma/schema.prisma`:

```bash
npm run prisma-migrate
```

## Development Tips

### 1. Use Postman
- Import the endpoints from Swagger `/api-docs`
- Test all endpoints easily
- Save request collections for future use

### 2. Monitor Logs
- Check console output for request logs
- View webhook logs at `GET /callbacks/logs`
- Browse transaction logs in Prisma Studio

### 3. Enable Debug Mode
Add to your `.env`:
```env
DEBUG=mpesa:*
```

## Common Issues

### Issue: Database Connection Failed
**Solution:**
```bash
# Check if PostgreSQL is running
docker-compose ps

# If not running, start it
docker-compose up -d

# Verify connection
npm run prisma-migrate
```

### Issue: "Cannot find module" errors
**Solution:**
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Issue: Port 3000 already in use
**Solution:**
```bash
# Change port in .env
PORT=3001

# Or kill the process using port 3000
lsof -i :3000
kill -9 <PID>
```

### Issue: M-Pesa Authentication Fails
**Solution:**
- Verify credentials in `.env` are correct
- Check if using sandbox or production correctly
- Ensure credentials haven't expired
- Contact Safaricom M-Pesa support

## Deploying to Production

### 1. Prepare Environment
```bash
NODE_ENV=production
MPESA_ENVIRONMENT=production
```

### 2. Use production database credentials

### 3. Update callback URLs to your production domain

### 4. Build the project
```bash
npm run build
```

### 5. Start with process manager (PM2)
```bash
npm install -g pm2
pm2 start dist/index.js --name "mpesa-api"
pm2 save
pm2 startup
```

### 6. Setup SSL/HTTPS
- Use Nginx or Apache as reverse proxy
- Use Let's Encrypt for SSL certificates

## Next Steps

1. **Understand the Architecture** - Read [README.md](./README.md)
2. **Explore API Docs** - Visit `/api-docs` 
3. **Test Endpoints** - Use Postman or cURL
4. **Configure Callbacks** - Setup ngrok for local testing
5. **Go Live** - Deploy to production with real credentials

## Getting Help

1. Check the [README.md](./README.md) for detailed documentation
2. Review API documentation at `/api-docs`
3. Check transaction logs in Prisma Studio
4. Check webhook logs at `/callbacks/logs`
5. Contact Safaricom M-Pesa support for API issues

## Resources

- [M-Pesa API Docs](https://developer.safaricom.co.ke/)
- [Prisma Docs](https://www.prisma.io/docs/)
- [Express.js Guide](https://expressjs.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

Happy integrating! 🚀
