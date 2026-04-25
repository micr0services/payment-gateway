# M-Pesa Integration - Environment Configuration Guide

This guide explains how to configure the M-Pesa integration with your Safaricom credentials.

## Getting Safaricom M-Pesa Credentials

### Step 1: Register for M-Pesa Developer Account

1. Go to [Safaricom Developer Portal](https://developer.safaricom.co.ke/)
2. Create an account if you don't have one
3. Complete your profile and business verification

### Step 2: Create an Application

1. Log in to the portal
2. Go to "My Apps" → "Create New Application"
3. Fill in application details:
   - Application Name: "M-Pesa Integration"
   - Application Description: "Business transaction processing"
4. Click "Create"

### Step 3: Get Your Credentials

After creating the app, you'll receive:
- **Consumer Key** - Used for authentication
- **Consumer Secret** - Used for authentication
- **Business Shortcode** - Your business identifier (usually a 6-digit number)

## Environment Variables Setup

### Create .env File

```bash
cp .env.example .env
```

### Configure Each Variable

#### Database Configuration

```env
DATABASE_URL="postgresql://mpesa_user:mpesa_secure_password_123@localhost:5432/mpesa_integration"
```

- **Format**: `postgresql://[user]:[password]@[host]:[port]/[database]`
- **For Local Setup**: Use the Docker credentials provided below
- **For Remote Database**: Use your hosting provider's connection string

**Docker Credentials (if using docker-compose.yml):**
```
User: mpesa_user
Password: mpesa_secure_password_123
Database: mpesa_integration
Port: 5432
```

#### Server Configuration

```env
PORT=3000
```

- Default: `3000`
- Change if port 3000 is already in use
- For production: Use port `80` or `443` with reverse proxy

#### Environment Mode

```env
NODE_ENV=development
```

- **development** - For local testing with hot reload
- **production** - For production deployment

#### M-Pesa Consumer Credentials

```env
MPESA_CONSUMER_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxx
MPESA_CONSUMER_SECRET=yyyyyyyyyyyyyyyyyyyyyyyyyyyy
```

- Get from Safaricom Developer Portal
- Keep these secure - don't commit to version control
- Use different credentials for sandbox vs production

#### M-Pesa Business Details

```env
MPESA_SHORTCODE=174379
```

- Your business shortcode from Safaricom
- Usually a 6-digit number
- Find in your Safaricom business portal

#### M-Pesa Passkey

```env
MPESA_PASSKEY=bfb279f9aa9bdbcf158e97dd1a503b6fd78cff096f948b23cdb75f38e0de8521
```

- Also called "Lipa Na M-Pesa Online Passkey"
- Get from Safaricom Developer Portal
- Different from Consumer Secret
- Used for STK Push encryption

#### M-Pesa Initiator Credentials

```env
MPESA_INITIATOR_NAME=testuser
MPESA_INITIATOR_PASSWORD=your_very_secure_password_here
```

- **Initiator Name**: Username for API initiator (usually your agent code)
- **Initiator Password**: Password for API initiator
- Used for B2C and B2B transactions
- Keep secure!

#### Environment Selection

```env
MPESA_ENVIRONMENT=sandbox
```

- **sandbox** - For testing (recommended during development)
  - Uses test/mock data
  - Doesn't charge real money
  - Credentials are provided by Safaricom in the portal
  
- **production** - For live transactions
  - Real money transactions
  - Use production credentials
  - Requires agreements with Safaricom

#### Callback URLs

These URLs are where M-Pesa will send webhook callbacks. C2B now uses two separate endpoints:
- **Validation**: invoked first to confirm whether the payment should proceed
- **Confirmation**: called once the payment has completed successfully

```env
# C2B callback endpoints (validation & confirmation)
MPESA_C2B_VALIDATE_URL=http://localhost:3000/callbacks/c2b/validate
MPESA_C2B_CONFIRM_URL=http://localhost:3000/callbacks/c2b/confirm

# Other callbacks
MPESA_B2C_CALLBACK_URL=http://localhost:3000/callbacks/b2c
MPESA_STK_CALLBACK_URL=http://localhost:3000/callbacks/stk
MPESA_ACCOUNT_BALANCE_CALLBACK_URL=http://localhost:3000/callbacks/account-balance
MPESA_TRANSACTION_STATUS_CALLBACK_URL=http://localhost:3000/callbacks/transaction-status
```

**Local Development:**
- Use `http://localhost:3000` (only works if M-Pesa can reach your machine)
- Better: Use **ngrok** to expose localhost to the internet

**Production:**
- Use your domain: `https://yourdomain.com/callbacks/c2b`
- Must be HTTPS
- Must be publicly accessible
- Must not require authentication (M-Pesa can't authenticate)

### Setting Up Callback URLs with ngrok

For local testing of webhooks:

```bash
# Install ngrok
brew install ngrok  # macOS
# or download from https://ngrok.com

# Start ngrok tunnel to localhost:3000
ngrok http 3000

# You'll get a URL like: https://xxxx-xx-xxx-xxx-xx.ngrok.io

# Update your .env:
MPESA_C2B_VALIDATE_URL=https://xxxx-xx-xxx-xxx-xx.ngrok.io/callbacks/c2b/validate
MPESA_C2B_CONFIRM_URL=https://xxxx-xx-xxx-xxx-xx.ngrok.io/callbacks/c2b/confirm
MPESA_B2C_CALLBACK_URL=https://xxxx-xx-xxx-xxx-xx.ngrok.io/callbacks/b2c
MPESA_STK_CALLBACK_URL=https://xxxx-xx-xxx-xxx-xx.ngrok.io/callbacks/stk
```

## Complete .env Example

```env
# Database
DATABASE_URL="postgresql://mpesa_user:mpesa_secure_password_123@localhost:5432/mpesa_integration"

# Server
PORT=3000
NODE_ENV=development

# M-Pesa Configuration
MPESA_CONSUMER_KEY=your_consumer_key_from_safaricom
MPESA_CONSUMER_SECRET=your_consumer_secret_from_safaricom
MPESA_SHORTCODE=174379
MPESA_PASSKEY=bfb279f9aa9bdbcf158e97dd1a503b6fd78cff096f948b23cdb75f38e0de8521
MPESA_INITIATOR_NAME=testuser
MPESA_INITIATOR_PASSWORD=your_secure_initiator_password
MPESA_ENVIRONMENT=sandbox

# Callback URLs
MPESA_C2B_VALIDATE_URL=http://localhost:3000/callbacks/c2b/validate
MPESA_C2B_CONFIRM_URL=http://localhost:3000/callbacks/c2b/confirm
MPESA_B2C_CALLBACK_URL=http://localhost:3000/callbacks/b2c
MPESA_STK_CALLBACK_URL=http://localhost:3000/callbacks/stk
MPESA_ACCOUNT_BALANCE_CALLBACK_URL=http://localhost:3000/callbacks/account-balance
MPESA_TRANSACTION_STATUS_CALLBACK_URL=http://localhost:3000/callbacks/transaction-status
```

## Step-by-Step Configuration

### 1. Register for Developer Account

```bash
# Visit and follow Safaricom's signup process
https://developer.safaricom.co.ke/
```

### 2. Create Application

- Go to "Create New Application"
- Fill in details
- Accept terms and create

### 3. Copy Credentials

From the application dashboard:
```
Copy Consumer Key
Copy Consumer Secret
Copy Business Shortcode
Copy Passkey
```

### 4. Create .env File

```bash
cp .env.example .env
nano .env  # or use your preferred editor
```

### 5. Paste Credentials

```env
MPESA_CONSUMER_KEY=<paste-your-consumer-key>
MPESA_CONSUMER_SECRET=<paste-your-consumer-secret>
MPESA_SHORTCODE=<paste-your-shortcode>
MPESA_PASSKEY=<paste-your-passkey>
MPESA_INITIATOR_NAME=<your-username>
MPESA_INITIATOR_PASSWORD=<your-password>
MPESA_ENVIRONMENT=sandbox
```

### 6. Setup Callbacks in Safaricom Portal

1. Log in to Safaricom Developer Portal
2. Go to your application
3. Settings → Callback URLs
4. Enter callback URLs:
   - C2B: `https://yourdomain.com/callbacks/c2b`
   - B2C: `https://yourdomain.com/callbacks/b2c`
   - STK: `https://yourdomain.com/callbacks/stk`
5. Save

### 7. Test Connection

```bash
npm run dev
# Visit http://localhost:3000/health
```

## Security Best Practices

### ✓ Do's

- Store `.env` in `.gitignore` (never commit to git)
- Use different credentials for sandbox and production
- Keep passwords secure - rotate them periodically
- Use HTTPS in production
- Enable firewall rules
- Monitor transaction logs
- Use environment variables for sensitive data

### ✗ Don'ts

- Don't hardcode credentials in code
- Don't share .env file or credentials
- Don't use same credentials for multiple environments
- Don't expose Consumer Secret in frontend
- Don't log sensitive data
- Don't push .env to version control

## Troubleshooting Configuration

### Issue: "Invalid credentials" error

**Solution:**
- Verify Consumer Key and Consumer Secret are correct
- Check if copying special characters correctly
- Ensure no extra spaces in .env
- Verify credentials are for the same environment (sandbox/production)

### Issue: "Invalid shortcode" error

**Solution:**
- Shortcode must be numeric (6 digits usually)
- Verify from Safaricom portal - copy exact value
- Check it matches your business profile

### Issue: "Callback URL not recognized"

**Solution:**
- Register callback URLs in Safaricom portal
- Ensure URLs match exactly in both places
- For local testing, use ngrok
- Test with curl:
  ```bash
  curl -X POST http://localhost:3000/callbacks/c2b
  ```

### Issue: SSL/Certificate errors

**Solution:**
- Production URLs must use HTTPS
- Ensure SSL certificate is valid
- Check firewall allows HTTPS traffic

## Environment Variables Reference Table

| Variable | Required | Example | Notes |
|----------|----------|---------|-------|
| `DATABASE_URL` | Yes | `postgresql://...` | PostgreSQL connection string |
| `PORT` | No | `3000` | HTTP port |
| `NODE_ENV` | No | `development` | development or production |
| `MPESA_CONSUMER_KEY` | Yes | `xxxx...` | From Safaricom portal |
| `MPESA_CONSUMER_SECRET` | Yes | `yyyy...` | From Safaricom portal |
| `MPESA_SHORTCODE` | Yes | `174379` | Your business shortcode |
| `MPESA_PASSKEY` | Yes | `bfb2...` | For STK Push encryption |
| `MPESA_INITIATOR_NAME` | Yes | `testuser` | API initiator username |
| `MPESA_INITIATOR_PASSWORD` | Yes | `pass...` | API initiator password |
| `MPESA_ENVIRONMENT` | Yes | `sandbox` | sandbox or production |
| `MPESA_C2B_VALIDATE_URL` | Yes | `https://...` | C2B validation webhook URL |
| `MPESA_C2B_CONFIRM_URL` | Yes | `https://...` | C2B confirmation webhook URL |
| `MPESA_B2C_CALLBACK_URL` | Yes | `https://...` | B2C webhook URL |
| `MPESA_STK_CALLBACK_URL` | Yes | `https://...` | STK webhook URL |

## Sandbox vs Production

### Sandbox Credentials
```
Used for: Testing and development
Purpose: Safe testing without real transactions
Costs: Free
Default: Pre-configured test credentials
```

### Production Credentials
```
Used for: Live transactions
Purpose: Real money transactions
Costs: M-Pesa transaction fees apply
Requirements: 
  - Business agreement with Safaricom
  - Proper business verification
  - SSL certificate (HTTPS required)
```

## Next Steps

1. **Complete .env setup** ✓
2. **Start the database**: `docker-compose up -d`
3. **Run migrations**: `npm run prisma-migrate`
4. **Test the API**: `npm run dev` then visit `/api-docs`
5. **Register callbacks** in Safaricom portal
6. **Test endpoints** with sample data

## Getting Help

- [Safaricom M-Pesa API Docs](https://developer.safaricom.co.ke/docs)
- [Check QUICKSTART.md](./QUICKSTART.md) for setup issues
- Verify credentials in Safaricom portal
- Check application logs for detailed errors

---

Once you've configured .env, you're ready to start the service!

```bash
npm run dev
```

Visit `http://localhost:3000/api-docs` to test the API.
