# Production Deployment Checklist

Complete checklist for deploying the Payment Gateway integration to production.

## Pre-Deployment Checklist

### Security Review
- [ ] All API keys rotated from development
- [ ] Database credentials updated for production
- [ ] SSL/TLS certificates valid and configured
- [ ] CORS properly configured for production domains
- [ ] Rate limiting configured
- [ ] Input validation implemented
- [ ] Error messages don't expose internals
- [ ] Sensitive data not logged
- [ ] Idempotency keys implemented

### Testing
- [ ] All unit tests pass
- [ ] Integration tests pass
- [ ] End-to-end payment flow tested
- [ ] Webhook delivery tested
- [ ] Error scenarios tested
- [ ] Rate limiting tested
- [ ] Database queries optimized
- [ ] Performance benchmarks acceptable

### Operations
- [ ] Monitoring and alerting configured
- [ ] Error tracking (Sentry, DataDog, etc.) set up
- [ ] Logging centralized (ELK, Splunk, etc.)
- [ ] Database backups automated
- [ ] Disaster recovery plan documented
- [ ] Rollback procedure documented
- [ ] On-call support team identified

## Infrastructure Setup

### Environment Variables

```bash
# Production environment
NODE_ENV=production
API_URL=https://api.payment-gateway.com
API_KEY=sk_live_... (from secrets manager)
DATABASE_URL=postgresql://...
STRIPE_SECRET_KEY=... (from secrets manager)
PAYPAL_CLIENT_SECRET=... (from secrets manager)
MPESA_CONSUMER_SECRET=... (from secrets manager)
ENCRYPTION_KEY=... (from secrets manager)
LOG_LEVEL=info
```

### Database Preparation

```sql
-- Verify production database
SELECT version();

-- Run migrations
npm run migrate

-- Verify tables
\dt

-- Check indexes
SELECT * FROM pg_indexes WHERE schemaname = 'public';

-- Enable connection pooling
SET max_connections = 200;
SET shared_buffers = '256MB';
```

### SSL/TLS Certificate

```bash
# Use Let's Encrypt or AWS Certificate Manager
# Verify certificate
openssl s_client -connect api.payment-gateway.com:443

# Certificate should be:
# - Valid for production domain
# - Not self-signed
# - Auto-renewed before expiration
```

## Deployment Steps

### 1. Pre-Deployment

```bash
# Tag release
git tag -a v1.0.0 -m "Production release"
git push origin v1.0.0

# Create backup
pg_dump production_db > backup_$(date +%Y%m%d).sql

# Verify backup
ls -lh backup_*.sql
```

### 2. Deployment

```bash
# Stop current service (zero-downtime if possible)
systemctl stop payment-gateway || pm2 stop payment-gateway

# Deploy new code
git pull origin main
git checkout v1.0.0
npm install --production
npm run build

# Run database migrations
npm run migrate

# Start service
systemctl start payment-gateway || pm2 start payment-gateway

# Verify service started
curl https://api.payment-gateway.com/health
```

### 3. Post-Deployment

```bash
# Monitor logs for errors
tail -f /var/log/payment-gateway/application.log

# Run smoke tests
npm run smoke-tests

# Verify transactions are processing
# Check /api/transactions/all for recent successful payments

# Monitor metrics
# Check response times, error rates, database performance
```

## Configuration

### Production Environment Example

```javascript
const config = {
  production: {
    port: process.env.PORT || 3000,
    https: {
      key: fs.readFileSync('/etc/ssl/private/key.pem'),
      cert: fs.readFileSync('/etc/ssl/certs/cert.pem')
    },
    database: {
      url: process.env.DATABASE_URL,
      pool: {
        min: 5,
        max: 20
      }
    },
    api: {
      url: process.env.API_URL,
      key: process.env.API_KEY,
      timeout: 30000
    },
    payment: {
      stripe: {
        secretKey: process.env.STRIPE_SECRET_KEY
      },
      paypal: {
        clientSecret: process.env.PAYPAL_CLIENT_SECRET
      },
      mpesa: {
        consumerSecret: process.env.MPESA_CONSUMER_SECRET
      }
    },
    logging: {
      level: 'info',
      format: 'json',
      transport: 'syslog'
    },
    monitoring: {
      enabled: true,
      datadog: {
        apiKey: process.env.DATADOG_API_KEY
      }
    }
  }
};
```

## Monitoring & Alerting

### Key Metrics to Monitor

```javascript
// Payment success rate
SELECT 
  status,
  COUNT(*) as count,
  ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER(), 2) as percentage
FROM transactions
WHERE created_at > NOW() - INTERVAL '1 hour'
GROUP BY status;

// Response time
SELECT 
  PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY response_time) as p95,
  PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY response_time) as p99
FROM api_logs
WHERE created_at > NOW() - INTERVAL '1 hour';

// Database connection pool
SHOW max_connections;
SELECT count(*) as active_connections FROM pg_stat_activity;
```

### Alert Rules

```yaml
# Datadog example
rules:
  - metric: payment.success_rate
    threshold: 95
    alert: "Payment success rate below 95%"
  
  - metric: api.response_time.p99
    threshold: 5000ms
    alert: "API response time exceeds 5s"
  
  - metric: payment.webhook_failures
    threshold: 10
    alert: "Webhook failures detected"
  
  - metric: database.connections.active
    threshold: 180
    alert: "Database connections near limit"
```

## Health Checks

### API Health Endpoint

```javascript
app.get('/health', async (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    checks: {}
  };

  // Database check
  try {
    await database.query('SELECT 1');
    health.checks.database = { status: 'ok' };
  } catch (error) {
    health.status = 'degraded';
    health.checks.database = { status: 'error', error: error.message };
  }

  // Stripe API check
  try {
    await stripe.paymentIntents.list({ limit: 1 });
    health.checks.stripe = { status: 'ok' };
  } catch (error) {
    health.status = 'degraded';
    health.checks.stripe = { status: 'error' };
  }

  // PayPal API check
  try {
    await paypal.getAccessToken();
    health.checks.paypal = { status: 'ok' };
  } catch (error) {
    health.status = 'degraded';
    health.checks.paypal = { status: 'error' };
  }

  const statusCode = health.status === 'ok' ? 200 : 503;
  res.status(statusCode).json(health);
});
```

## Rollback Procedure

### If Issues Occur

```bash
# 1. Stop current deployment
systemctl stop payment-gateway

# 2. Restore database from backup
psql production_db < backup_YYYYMMDD.sql

# 3. Switch back to previous version
git checkout previous-tag
npm install --production
npm run build

# 4. Start service
systemctl start payment-gateway

# 5. Notify stakeholders
# Email: Rolled back to previous version
```

### Zero-Downtime Rollback

```bash
# Using blue-green deployment
# Start new container with previous code
docker run --name payment-gateway-blue -p 3001:3000 payment-gateway:old

# Verify new container works
curl http://localhost:3001/health

# Switch load balancer
# Update upstream to point to port 3001

# Stop old container
docker stop payment-gateway-green

# Rename containers
docker rename payment-gateway-blue payment-gateway-green
```

## Performance Optimization

### Database Optimization

```sql
-- Create indexes for common queries
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);
CREATE INDEX idx_transactions_gateway ON transactions(gateway);

-- Enable query statistics
CREATE EXTENSION pg_stat_statements;

-- Find slow queries
SELECT query, calls, mean_time, max_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

### Application Optimization

```javascript
// Connection pooling
const pool = new Pool({
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000
});

// Caching
const cache = new NodeCache({ stdTTL: 600 });

// Request queuing
const queue = new Bull('payments', {
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000
    }
  }
});
```

## Disaster Recovery

### Backup Strategy

```bash
# Daily full backup
0 2 * * * pg_dump -h prod-db -U postgres production_db | gzip > /backups/daily/backup_$(date +\%Y\%m\%d).sql.gz

# Hourly incremental (optional)
0 * * * * pg_basebackup -h prod-db -U postgres -D /backups/hourly/base_$(date +\%Y\%m\%d_%H)

# Test restore
pg_restore -h test-db -U postgres /backups/daily/backup_YYYYMMDD.sql.gz
```

### Disaster Recovery Plan

- **RTO** (Recovery Time Objective): < 1 hour
- **RPO** (Recovery Point Objective): < 1 hour
- Backup location: Different region/AZ
- Test recovery monthly

## Launch

### Go-Live Steps

1. [ ] All pre-deployment checklist items completed
2. [ ] Backups verified
3. [ ] Monitoring and alerts active
4. [ ] Support team on-call
5. [ ] Customer communication prepared
6. [ ] Gradual traffic migration (if possible)
7. [ ] Continuous monitoring first 24 hours
8. [ ] Success! Document lessons learned

### Post-Launch

- [ ] Monitor 24/7 for first week
- [ ] Review metrics and logs daily
- [ ] Address any issues immediately
- [ ] Gather feedback
- [ ] Plan improvements

---

**Last Updated**: 2026-05-09
