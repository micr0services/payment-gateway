# Troubleshooting Guide

Solutions to common problems and issues.

## Payment Processing Issues

### Issue: Payment succeeds but webhook doesn't arrive

**Symptoms**: 
- Payment shows as completed in dashboard
- No webhook callback received
- Customer sees confirmation but internal system doesn't update

**Solutions**:
1. Check callback URL is publicly accessible
   ```bash
   curl -v https://your-app.com/webhooks/payment
   ```

2. Verify webhook handler responds with 2xx
   ```javascript
   app.post('/webhooks/payment', (req, res) => {
     // Must respond with 2xx immediately
     res.status(200).json({ success: true });
   });
   ```

3. Check webhook logs in payment provider dashboard

4. Manually verify payment status:
   ```bash
   GET /api/payments/stripe/{paymentIntentId}
   ```

5. Implement webhook retry logic on your end

### Issue: "Card declined" error

**Symptoms**:
- Payment fails with card_declined
- Customers report card works elsewhere
- Some cards succeed, others fail

**Solutions**:
1. Check if test card in production (or vice versa)
2. Verify card is not expired
3. Try different card to confirm issue
4. Check daily/transaction limits
5. Verify billing address matches card records
6. Check for fraud flags in payment provider

### Issue: Duplicate charges happening

**Symptoms**:
- Customer charged multiple times
- Multiple transactions in database
- Customer complains of duplicate charges

**Solutions**:
1. Verify idempotency keys are being sent
   ```bash
   -H "Idempotency-Key: unique-key-12345"
   ```

2. Check keys are actually unique (not same key reused)
   ```javascript
   // ❌ Bad - same key reused
   const key = 'static-key';
   
   // ✅ Good - unique per transaction
   const key = `${orderId}-${Date.now()}-${Math.random()}`;
   ```

3. Verify database constraint exists:
   ```sql
   SELECT constraint_name 
   FROM information_schema.table_constraints 
   WHERE table_name = 'payment_transactions'
   AND constraint_type = 'UNIQUE';
   ```

4. Check retry logic isn't triggering multiple retries

### Issue: "Insufficient funds" (M-Pesa)

**Symptoms**:
- M-Pesa payment fails with result code 26
- User can't complete payment
- Error: "User does not have enough balance"

**Solutions**:
1. Confirm user has M-Pesa account
2. Check account has sufficient balance
3. Verify minimum amount is met (usually KES 1)
4. Try with lower amount first
5. Try different time (may be temporary issue)
6. Check if account is blocked/suspended

### Issue: "User cancelled" (M-Pesa)

**Symptoms**:
- Payment shows as failed with result code 1011
- User rejected STK prompt
- No payment taken from account

**Solutions**:
1. This is expected behavior - user chose not to pay
2. Allow user to retry payment
3. Show helpful message: "Payment cancelled. Click to try again"
4. Track cancellation rate to identify issues

## Webhook Issues

### Issue: Webhook not received after payment

**Symptoms**:
- Payment succeeded
- Webhook handler never called
- No logs of webhook attempt

**Root Causes & Solutions**:

1. **Callback URL not accessible**
   ```bash
   # Test from production server
   curl -X POST https://your-app.com/webhooks/payment \
     -H "Content-Type: application/json" \
     -d '{"test": true}'
   ```

2. **Firewall blocking incoming requests**
   - Check security groups / firewall rules
   - Ensure ports 80/443 open
   - Verify IP whitelist if configured

3. **Server not running/crashed**
   - Check application logs
   - Restart service
   - Verify uptime monitoring

4. **Webhook handler returning non-2xx status**
   ```javascript
   // ❌ Bad - returns 500
   app.post('/webhooks/payment', (req, res) => {
     throw new Error('Oops!'); // Returns 500
   });

   // ✅ Good - always returns 200
   app.post('/webhooks/payment', (req, res) => {
     try {
       // Process
     } catch (error) {
       console.error(error);
     }
     res.status(200).json({ success: true });
   });
   ```

5. **Webhook handler times out**
   - Process asynchronously
   - Don't do heavy work in webhook handler
   - Use job queue for background tasks

6. **Network/Connectivity issues**
   - Check DNS resolution: `nslookup your-app.com`
   - Check SSL certificate: `openssl s_client -connect your-app.com:443`
   - Check firewall NAT rules

### Issue: Webhook delivered multiple times

**Symptoms**:
- Same payment processed multiple times
- Duplicate database records
- Webhook called repeatedly

**Solutions**:
1. Implement idempotent webhook handlers
   ```javascript
   app.post('/webhooks/payment', async (req, res) => {
     // Check if already processed
     const existing = await Transaction.find(req.body.transactionId);
     if (existing) {
       // Already processed, return success
       return res.status(200).json({ success: true });
     }
     
     // Process for first time
     await Transaction.create(req.body);
     res.status(200).json({ success: true });
   });
   ```

2. Use transaction IDs to detect duplicates

3. Track processed webhooks:
   ```javascript
   const processedWebhooks = new Set();
   
   app.post('/webhooks/payment', (req, res) => {
     if (processedWebhooks.has(req.body.id)) {
       return res.json({ success: true }); // Already handled
     }
     
     // Process
     processedWebhooks.add(req.body.id);
   });
   ```

## Authentication Issues

### Issue: "Unauthorized" error on all requests

**Symptoms**:
- All API calls return 401
- Error: "Authentication required"
- Previously working requests now failing

**Solutions**:
1. Verify API key is in request header
   ```bash
   curl -H "Authorization: Bearer sk_live_..." https://api...
   ```

2. Check API key hasn't expired
   - Generate new key in dashboard
   - Replace in environment variables
   - Restart application

3. Verify environment has API key configured
   ```bash
   echo $PAYMENT_GATEWAY_API_KEY
   ```

4. Check for typos in Authorization header
   ```bash
   # ✅ Correct
   Authorization: Bearer sk_live_abc...

   # ❌ Wrong - missing "Bearer"
   Authorization: sk_live_abc...

   # ❌ Wrong - uses X-API-Key
   X-API-Key: sk_live_abc...
   ```

5. Verify using correct environment (test vs live)

### Issue: "Forbidden" - insufficient permissions

**Symptoms**:
- Error: "API key doesn't have permission"
- Code: FORBIDDEN
- HTTP 403

**Solutions**:
1. Verify API key has required scopes
   - Check dashboard for key permissions
   - Create new key with all permissions if needed

2. Verify using correct API key for environment

3. Check if key is restricted to certain operations
   - Some keys may be read-only
   - Some may have transaction limits

## Rate Limiting Issues

### Issue: "Too many requests" errors

**Symptoms**:
- Error code: RATE_LIMITED
- HTTP 429
- Requests fail intermittently

**Solutions**:
1. Check rate limit headers
   ```bash
   X-RateLimit-Limit: 1000
   X-RateLimit-Remaining: 5
   X-RateLimit-Reset: 1620086400
   ```

2. Implement exponential backoff
   ```javascript
   async function requestWithRetry(url, maxRetries = 3) {
     for (let i = 0; i < maxRetries; i++) {
       try {
         const response = await fetch(url);
         if (response.status === 429) {
           const delay = Math.pow(2, i) * 1000;
           await new Promise(resolve => setTimeout(resolve, delay));
           continue;
         }
         return response;
       } catch (error) {
         if (i === maxRetries - 1) throw error;
       }
     }
   }
   ```

3. Reduce request volume
   - Batch requests where possible
   - Cache responses
   - Use pagination efficiently

4. Contact support if persistent
   - May be able to increase limits
   - Check for abnormal usage patterns

## Database Issues

### Issue: Database connection errors

**Symptoms**:
- Error: "ECONNREFUSED"
- Payments fail with database error
- Transactions can't be saved

**Solutions**:
1. Verify database is running
   ```bash
   psql -h localhost -U postgres -d payment_gateway
   ```

2. Check connection string
   ```bash
   echo $DATABASE_URL
   # Should be: postgresql://user:pass@host:port/dbname
   ```

3. Verify credentials are correct
   - Username
   - Password
   - Database name
   - Host/port

4. Check firewall allows connections
   ```bash
   telnet db-host 5432
   ```

5. Check connection pool settings
   ```javascript
   const pool = new Pool({
     max: 20, // May be too high
     idleTimeoutMillis: 30000
   });
   ```

6. Review database logs
   ```bash
   tail -f /var/log/postgresql/postgresql.log
   ```

## Provider-Specific Issues

### Stripe Issues

**Issue: "Could not determine which credentials to use"**
- Solution: Verify STRIPE_SECRET_KEY is set

**Issue: "Your card has insufficient funds"**
- Solution: Use test card 4242 4242 4242 4242

**Issue: "API key must be provided"**
- Solution: Check STRIPE_SECRET_KEY environment variable

### PayPal Issues

**Issue: "Invalid request - see details"**
- Solution: Review error details for specific fields

**Issue: "Cannot refresh token"**
- Solution: Verify PAYPAL_CLIENT_SECRET is correct

**Issue: "Order not found"**
- Solution: Verify order ID is correct, may have expired

### M-Pesa Issues

**Issue: "MALFORMED_REQUEST"**
- Solution: Check request format matches M-Pesa spec

**Issue: "INVALID_SHORTCODE"**
- Solution: Verify business short code is correct

**Issue: "TIMEOUT"**
- Solution: Network issue, user took too long, or M-Pesa API slow

## Performance Issues

### Issue: Slow response times

**Symptoms**:
- API responses take > 5 seconds
- Timeouts occurring
- Users report slow payment process

**Solutions**:
1. Check database query performance
   ```sql
   EXPLAIN ANALYZE SELECT * FROM transactions WHERE id = '...';
   ```

2. Verify indexes exist
   ```sql
   SELECT * FROM pg_indexes WHERE tablename = 'transactions';
   ```

3. Check database connection pool
   ```javascript
   console.log(pool.totalCount, pool.idleCount, pool.waitingCount);
   ```

4. Monitor payment provider API latency
   - Check provider status page
   - May have increased latency

5. Check application logs for errors
   - Long-running queries
   - Database locks
   - Memory issues

### Issue: High error rate

**Symptoms**:
- 10%+ of payments failing
- Error codes vary
- Patterns in failures

**Solutions**:
1. Check error logs for common patterns
   ```bash
   tail -n 1000 app.log | grep ERROR | cut -d' ' -f2 | sort | uniq -c | sort -rn
   ```

2. Check payment provider status
   - Stripe status page
   - PayPal status page
   - M-Pesa status

3. Review recent changes
   - Code deployments
   - Configuration changes
   - Infrastructure changes

4. Check system resources
   - CPU usage
   - Memory usage
   - Disk space

## Getting Help

### Debug Information to Collect

When reporting issues, gather:
- Error message and code
- HTTP status code
- Request/response bodies (sanitized)
- Timestamps
- User account ID
- Transaction ID
- API key ID (last 4 digits only)
- Application logs (last 100 lines)

### Support Channels

- [Documentation](../INDEX.md)
- [API Reference](../INDEX.md)
- Email: support@payment-gateway.com
- Status Page: https://status.payment-gateway.com

---

**Last Updated**: 2026-05-09
