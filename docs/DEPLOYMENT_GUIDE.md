# Rebloom Production Deployment Guide

This guide covers the complete production deployment process for the Rebloom mental health AI companion app, including infrastructure setup, security configuration, and monitoring.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Infrastructure Setup](#infrastructure-setup)
3. [Environment Configuration](#environment-configuration)
4. [Database Setup](#database-setup)
5. [Container Deployment](#container-deployment)
6. [Load Balancer & SSL](#load-balancer--ssl)
7. [Monitoring & Logging](#monitoring--logging)
8. [Security Hardening](#security-hardening)
9. [CI/CD Pipeline](#cicd-pipeline)
10. [Backup & Recovery](#backup--recovery)
11. [Scaling & Performance](#scaling--performance)
12. [Troubleshooting](#troubleshooting)
13. [Maintenance](#maintenance)

---

## Prerequisites

### Required Tools

Install the following tools on your deployment machine:

```bash
# Docker and Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Node.js (for local development)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Essential utilities
sudo apt-get update
sudo apt-get install -y curl wget git jq unzip

# AWS CLI (if using AWS)
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
```

### System Requirements

**Minimum Production Environment:**
- **CPU**: 4 cores
- **RAM**: 8GB
- **Storage**: 100GB SSD
- **Network**: 1Gbps connection
- **OS**: Ubuntu 20.04 LTS or newer

**Recommended Production Environment:**
- **CPU**: 8+ cores
- **RAM**: 16GB+
- **Storage**: 500GB+ NVMe SSD
- **Network**: 10Gbps connection
- **Load Balancer**: Nginx or cloud load balancer
- **CDN**: CloudFlare or AWS CloudFront

### Account Requirements

**Required Service Accounts:**
- **Supabase**: Database and authentication
- **OpenAI**: AI conversation API
- **Sentry**: Error tracking and monitoring
- **GitHub**: Code repository and CI/CD
- **Domain registrar**: SSL certificates
- **Cloud provider**: AWS/GCP/Azure (optional)
- **Email service**: SendGrid, Mailgun, or SES

---

## Infrastructure Setup

### Cloud Infrastructure (AWS Example)

#### 1. VPC and Networking

```bash
# Create VPC
aws ec2 create-vpc --cidr-block 10.0.0.0/16 --tag-specifications 'ResourceType=vpc,Tags=[{Key=Name,Value=rebloom-vpc}]'

# Create subnets
aws ec2 create-subnet --vpc-id vpc-xxx --cidr-block 10.0.1.0/24 --availability-zone us-east-1a --tag-specifications 'ResourceType=subnet,Tags=[{Key=Name,Value=rebloom-public-1a}]'
aws ec2 create-subnet --vpc-id vpc-xxx --cidr-block 10.0.2.0/24 --availability-zone us-east-1b --tag-specifications 'ResourceType=subnet,Tags=[{Key=Name,Value=rebloom-public-1b}]'
aws ec2 create-subnet --vpc-id vpc-xxx --cidr-block 10.0.11.0/24 --availability-zone us-east-1a --tag-specifications 'ResourceType=subnet,Tags=[{Key=Name,Value=rebloom-private-1a}]'
aws ec2 create-subnet --vpc-id vpc-xxx --cidr-block 10.0.12.0/24 --availability-zone us-east-1b --tag-specifications 'ResourceType=subnet,Tags=[{Key=Name,Value=rebloom-private-1b}]'

# Create Internet Gateway
aws ec2 create-internet-gateway --tag-specifications 'ResourceType=internet-gateway,Tags=[{Key=Name,Value=rebloom-igw}]'
aws ec2 attach-internet-gateway --vpc-id vpc-xxx --internet-gateway-id igw-xxx

# Create Route Tables
aws ec2 create-route-table --vpc-id vpc-xxx --tag-specifications 'ResourceType=route-table,Tags=[{Key=Name,Value=rebloom-public-rt}]'
aws ec2 create-route --route-table-id rtb-xxx --destination-cidr-block 0.0.0.0/0 --gateway-id igw-xxx
```

#### 2. Security Groups

```bash
# Application Load Balancer Security Group
aws ec2 create-security-group --group-name rebloom-alb-sg --description "Security group for Rebloom ALB" --vpc-id vpc-xxx
aws ec2 authorize-security-group-ingress --group-id sg-xxx --protocol tcp --port 80 --cidr 0.0.0.0/0
aws ec2 authorize-security-group-ingress --group-id sg-xxx --protocol tcp --port 443 --cidr 0.0.0.0/0

# Application Security Group
aws ec2 create-security-group --group-name rebloom-app-sg --description "Security group for Rebloom application" --vpc-id vpc-xxx
aws ec2 authorize-security-group-ingress --group-id sg-yyy --protocol tcp --port 3000 --source-group sg-xxx
aws ec2 authorize-security-group-ingress --group-id sg-yyy --protocol tcp --port 22 --cidr 10.0.0.0/16

# Database Security Group
aws ec2 create-security-group --group-name rebloom-db-sg --description "Security group for Rebloom database" --vpc-id vpc-xxx
aws ec2 authorize-security-group-ingress --group-id sg-zzz --protocol tcp --port 5432 --source-group sg-yyy
```

#### 3. EC2 Instances

```bash
# Launch application servers
aws ec2 run-instances \
  --image-id ami-0c02fb55956c7d316 \
  --count 2 \
  --instance-type t3.large \
  --key-name rebloom-key \
  --security-group-ids sg-yyy \
  --subnet-id subnet-xxx \
  --user-data file://user-data.sh \
  --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=rebloom-app-1}]'
```

### On-Premises Infrastructure

#### Server Setup

```bash
# Update system
sudo apt-get update && sudo apt-get upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Configure firewall
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443

# Create application user
sudo useradd -m -s /bin/bash rebloom
sudo usermod -aG docker rebloom
```

---

## Environment Configuration

### 1. Clone Repository

```bash
# Clone the repository
git clone https://github.com/your-org/rebloom.git
cd rebloom

# Checkout production branch
git checkout main
```

### 2. Environment Variables

Create production environment file:

```bash
# Copy template
cp .env.example .env.production

# Edit with your values
nano .env.production
```

Example `.env.production`:

```bash
# Application
NODE_ENV=production
PORT=3000
API_VERSION=v1

# Database
DATABASE_URL=postgresql://user:password@db.rebloom.app:5432/rebloom_prod
DATABASE_SSL=true

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Security
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
ENCRYPTION_KEY=your-32-character-encryption-key
SESSION_SECRET=your-session-secret-key

# Redis
REDIS_URL=redis://redis.rebloom.app:6379
REDIS_PASSWORD=your-redis-password

# AI Services
OPENAI_API_KEY=sk-your-openai-api-key
OPENAI_MODEL=gpt-4
OPENAI_MAX_TOKENS=2000

# Crisis & Safety
CRISIS_WEBHOOK_URL=https://your-crisis-webhook-endpoint
EMERGENCY_NOTIFICATION_EMAIL=crisis-team@rebloom.app

# Monitoring
SENTRY_DSN=https://your-sentry-dsn
LOG_LEVEL=info

# External Services
EMAIL_SERVICE_API_KEY=your-email-service-key
SMS_SERVICE_API_KEY=your-sms-service-key
STRIPE_SECRET_KEY=sk_live_your-stripe-key

# SSL/TLS
SSL_CERT_PATH=/etc/ssl/certs/rebloom.crt
SSL_KEY_PATH=/etc/ssl/private/rebloom.key
```

### 3. Generate Secrets

```bash
# Generate secure random keys
echo "JWT_SECRET=$(openssl rand -base64 32)"
echo "ENCRYPTION_KEY=$(openssl rand -base64 32)"
echo "SESSION_SECRET=$(openssl rand -base64 32)"
echo "REDIS_PASSWORD=$(openssl rand -base64 24)"
```

### 4. Environment Validation

```bash
# Validate environment configuration
node scripts/validate-env.js

# Test database connection
node scripts/test-db-connection.js

# Test external services
node scripts/test-services.js
```

---

## Database Setup

### Supabase Configuration

#### 1. Create Project

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Initialize project
supabase init

# Link to remote project
supabase link --project-ref your-project-id
```

#### 2. Database Schema

```sql
-- Run the schema migration
supabase db push

-- Or manually run SQL
psql $DATABASE_URL < supabase_setup.sql
```

#### 3. Row Level Security (RLS)

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE mood_entries ENABLE ROW LEVEL SECURITY;

-- Create security policies
CREATE POLICY "Users can view their own data" ON users
  FOR ALL USING (auth.uid() = id);

CREATE POLICY "Users can view their own conversations" ON conversations
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own messages" ON messages
  FOR ALL USING (auth.uid() = (SELECT user_id FROM conversations WHERE id = conversation_id));
```

### Local PostgreSQL (Alternative)

If using local PostgreSQL instead of Supabase:

```bash
# Install PostgreSQL
sudo apt-get install postgresql postgresql-contrib

# Create database and user
sudo -u postgres createdb rebloom_production
sudo -u postgres createuser rebloom_user

# Set password and permissions
sudo -u postgres psql
\password rebloom_user
GRANT ALL PRIVILEGES ON DATABASE rebloom_production TO rebloom_user;
\q

# Run migrations
psql -h localhost -U rebloom_user -d rebloom_production -f create_tables.sql
```

---

## Container Deployment

### 1. Build Images

```bash
# Build production image
docker build -t rebloom:latest .

# Tag for registry
docker tag rebloom:latest ghcr.io/your-org/rebloom:latest

# Push to registry (if using)
docker push ghcr.io/your-org/rebloom:latest
```

### 2. Docker Compose Deployment

```bash
# Create production override
cp docker-compose.yml docker-compose.production.yml

# Edit for production settings
nano docker-compose.production.yml
```

Production `docker-compose.production.yml`:

```yaml
version: '3.8'

services:
  api:
    image: ghcr.io/your-org/rebloom:latest
    restart: always
    environment:
      - NODE_ENV=production
    env_file:
      - .env.production
    ports:
      - "3000:3000"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    deploy:
      resources:
        limits:
          memory: 1G
          cpus: '1.0'
        reservations:
          memory: 512M
          cpus: '0.5'

  nginx:
    image: nginx:alpine
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./config/nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./config/ssl:/etc/nginx/ssl:ro
    depends_on:
      - api

  redis:
    image: redis:7-alpine
    restart: always
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    deploy:
      resources:
        limits:
          memory: 256M
          cpus: '0.5'

  prometheus:
    image: prom/prometheus:latest
    restart: always
    ports:
      - "9090:9090"
    volumes:
      - ./config/prometheus:/etc/prometheus:ro
      - prometheus_data:/prometheus

  grafana:
    image: grafana/grafana:latest
    restart: always
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=${GRAFANA_PASSWORD}
    volumes:
      - grafana_data:/var/lib/grafana

volumes:
  redis_data:
  prometheus_data:
  grafana_data:

networks:
  default:
    driver: bridge
```

### 3. Deploy Services

```bash
# Deploy all services
docker-compose -f docker-compose.production.yml up -d

# Check service status
docker-compose -f docker-compose.production.yml ps

# View logs
docker-compose -f docker-compose.production.yml logs -f api

# Scale application instances
docker-compose -f docker-compose.production.yml up -d --scale api=3
```

### 4. Health Checks

```bash
# Test application health
curl http://localhost:3000/health

# Test database connection
curl http://localhost:3000/api/v1/status

# Test all services
bash scripts/health-check.sh
```

---

## Load Balancer & SSL

### SSL Certificate Setup

#### Option 1: Let's Encrypt (Recommended)

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d rebloom.app -d www.rebloom.app -d api.rebloom.app

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

#### Option 2: Commercial Certificate

```bash
# Generate CSR
openssl req -new -newkey rsa:2048 -nodes -keyout rebloom.app.key -out rebloom.app.csr

# Install certificate
sudo cp rebloom.app.crt /etc/ssl/certs/
sudo cp rebloom.app.key /etc/ssl/private/
sudo chmod 600 /etc/ssl/private/rebloom.app.key
```

### Nginx Configuration

The nginx configuration is already provided in `/config/nginx/nginx.conf`. Key features:

- **HTTP to HTTPS redirect**
- **Rate limiting** for API endpoints
- **Security headers**
- **WebSocket support**
- **Static file caching**
- **Health check endpoints**

### Load Balancer Testing

```bash
# Test SSL configuration
curl -I https://rebloom.app

# Test rate limiting
for i in {1..20}; do curl -w "Response: %{http_code}\n" https://rebloom.app/api/v1/health; done

# Test WebSocket connection
wscat -c wss://rebloom.app/socket.io/

# SSL Labs test (external)
# https://www.ssllabs.com/ssltest/analyze.html?d=rebloom.app
```

---

## Monitoring & Logging

### Prometheus Configuration

Prometheus is configured to scrape metrics from:
- Application server (`/metrics`)
- Node Exporter (system metrics)
- Redis metrics
- Nginx metrics
- Custom application metrics

### Grafana Dashboards

The included Grafana dashboard monitors:
- **API Performance**: Response times, request rates, error rates
- **System Metrics**: CPU, memory, disk usage
- **Application Metrics**: Active users, conversations, mood entries
- **Mental Health Metrics**: Crisis alerts, safety plan usage
- **Infrastructure**: Container health, database connections

### Log Aggregation

```bash
# Configure log rotation
sudo nano /etc/logrotate.d/rebloom
```

```
/var/log/rebloom/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 rebloom rebloom
    postrotate
        /usr/bin/docker-compose -f /opt/rebloom/docker-compose.production.yml restart api
    endscript
}
```

### Alerting Setup

```bash
# Install AlertManager (if using)
wget https://github.com/prometheus/alertmanager/releases/latest/download/alertmanager-linux-amd64.tar.gz
tar xvfz alertmanager-*.tar.gz
sudo cp alertmanager-*/alertmanager /usr/local/bin/
sudo cp alertmanager-*/amtool /usr/local/bin/
```

Configure alerts for:
- API response time > 2 seconds
- Error rate > 5%
- Memory usage > 80%
- Disk space < 10%
- Crisis detection system failures

---

## Security Hardening

### System Security

```bash
# Update system
sudo apt-get update && sudo apt-get upgrade -y

# Install fail2ban
sudo apt-get install fail2ban
sudo systemctl enable fail2ban

# Configure SSH security
sudo nano /etc/ssh/sshd_config
```

SSH Configuration:
```
Port 22
Protocol 2
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
MaxAuthTries 3
ClientAliveInterval 600
ClientAliveCountMax 0
```

### Docker Security

```bash
# Run Docker rootless
curl -fsSL https://get.docker.com/rootless | sh

# Configure resource limits
sudo nano /etc/docker/daemon.json
```

```json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  },
  "live-restore": true,
  "userland-proxy": false,
  "no-new-privileges": true
}
```

### Application Security

```bash
# Set secure file permissions
chown -R rebloom:rebloom /opt/rebloom
chmod -R 750 /opt/rebloom
chmod 600 /opt/rebloom/.env.production

# Configure app-specific firewall rules
sudo ufw allow from 10.0.0.0/16 to any port 3000
sudo ufw deny 3000
```

### Regular Security Updates

```bash
# Create update script
cat > /opt/rebloom/scripts/security-update.sh << 'EOF'
#!/bin/bash
set -euo pipefail

# System updates
sudo apt-get update
sudo apt-get upgrade -y
sudo apt-get autoremove -y

# Docker updates
docker system prune -f
docker pull ghcr.io/your-org/rebloom:latest

# Restart services
docker-compose -f /opt/rebloom/docker-compose.production.yml up -d

# Security scan
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
  -v /tmp:/tmp anchore/grype:latest \
  ghcr.io/your-org/rebloom:latest
EOF

chmod +x /opt/rebloom/scripts/security-update.sh

# Schedule weekly updates
sudo crontab -e
# Add: 0 2 * * 0 /opt/rebloom/scripts/security-update.sh
```

---

## CI/CD Pipeline

### GitHub Actions Setup

The CI/CD pipeline is defined in `.github/workflows/ci-cd.yml` and includes:

1. **Code Quality**: Linting, type checking, testing
2. **Security Scanning**: Dependency scanning, SAST
3. **Build**: Docker image building and pushing
4. **Deploy**: Automatic deployment to staging/production
5. **Testing**: Integration and performance testing

### Deployment Secrets

Configure these secrets in GitHub:

```
# Required Secrets
EXPO_TOKEN
DOCKER_REGISTRY_TOKEN
PRODUCTION_SSH_KEY
STAGING_SSH_KEY
SLACK_WEBHOOK

# Environment Variables
DATABASE_URL
JWT_SECRET
ENCRYPTION_KEY
OPENAI_API_KEY
SENTRY_DSN
REDIS_PASSWORD
```

### Manual Deployment

```bash
# Deploy specific version
bash scripts/deploy.sh production v1.2.3

# Deploy latest
bash scripts/deploy.sh production latest

# Rollback deployment
bash scripts/deploy.sh production v1.2.2
```

### Deployment Verification

```bash
# Health check
curl -f https://rebloom.app/health

# API test
curl -f https://rebloom.app/api/v1/status

# Load test
npx artillery quick --count 10 --num 5 https://rebloom.app/health

# Security scan
nmap -sS -O rebloom.app
```

---

## Backup & Recovery

### Database Backup

#### Automated Backup Script

```bash
# Create backup script
cat > /opt/rebloom/scripts/backup-db.sh << 'EOF'
#!/bin/bash
set -euo pipefail

BACKUP_DIR="/opt/rebloom/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="rebloom_backup_${DATE}.sql"

# Create backup directory
mkdir -p $BACKUP_DIR

# Create database backup
pg_dump $DATABASE_URL > $BACKUP_DIR/$BACKUP_FILE

# Compress backup
gzip $BACKUP_DIR/$BACKUP_FILE

# Upload to S3 (optional)
# aws s3 cp $BACKUP_DIR/$BACKUP_FILE.gz s3://rebloom-backups/db/

# Cleanup old backups (keep 30 days)
find $BACKUP_DIR -name "rebloom_backup_*.sql.gz" -mtime +30 -delete

echo "Backup completed: $BACKUP_FILE.gz"
EOF

chmod +x /opt/rebloom/scripts/backup-db.sh
```

#### Schedule Backups

```bash
# Add to crontab
sudo crontab -e
# Add: 0 2 * * * /opt/rebloom/scripts/backup-db.sh
```

### File Backup

```bash
# Backup application files
cat > /opt/rebloom/scripts/backup-files.sh << 'EOF'
#!/bin/bash
set -euo pipefail

BACKUP_DIR="/opt/rebloom/backups"
DATE=$(date +%Y%m%d_%H%M%S)
APP_BACKUP="app_backup_${DATE}.tar.gz"

# Create backup
tar -czf $BACKUP_DIR/$APP_BACKUP \
  --exclude='node_modules' \
  --exclude='.git' \
  --exclude='logs' \
  /opt/rebloom

# Upload to remote storage
# rsync -avz $BACKUP_DIR/$APP_BACKUP backup-server:/backups/rebloom/

echo "Application backup completed: $APP_BACKUP"
EOF

chmod +x /opt/rebloom/scripts/backup-files.sh
```

### Disaster Recovery

#### Database Restore

```bash
# Stop application
docker-compose -f docker-compose.production.yml stop api

# Restore database
gunzip -c /opt/rebloom/backups/rebloom_backup_YYYYMMDD_HHMMSS.sql.gz | psql $DATABASE_URL

# Start application
docker-compose -f docker-compose.production.yml start api

# Verify restore
curl -f https://rebloom.app/health
```

#### Full System Restore

```bash
# Restore application files
cd /opt
sudo rm -rf rebloom
sudo tar -xzf /backups/app_backup_YYYYMMDD_HHMMSS.tar.gz

# Restore environment variables
sudo cp /backups/.env.production /opt/rebloom/

# Rebuild and start services
cd /opt/rebloom
sudo docker-compose -f docker-compose.production.yml up -d --build
```

### Backup Testing

```bash
# Test backup integrity
gunzip -t /opt/rebloom/backups/rebloom_backup_*.sql.gz

# Test restore process (staging environment)
bash scripts/test-restore.sh
```

---

## Scaling & Performance

### Horizontal Scaling

#### Multiple Application Instances

```bash
# Scale API containers
docker-compose -f docker-compose.production.yml up -d --scale api=3

# Update Nginx upstream
sudo nano /opt/rebloom/config/nginx/nginx.conf
```

Update nginx upstream configuration:
```nginx
upstream api_backend {
    least_conn;
    server api_1:3000 max_fails=3 fail_timeout=30s;
    server api_2:3000 max_fails=3 fail_timeout=30s;
    server api_3:3000 max_fails=3 fail_timeout=30s;
    keepalive 32;
}
```

#### Load Balancer Setup

```bash
# Using HAProxy for advanced load balancing
sudo apt-get install haproxy

# Configure HAProxy
sudo nano /etc/haproxy/haproxy.cfg
```

```
defaults
    timeout connect 5000ms
    timeout client 50000ms
    timeout server 50000ms
    option httpchk GET /health

frontend rebloom_frontend
    bind *:80
    bind *:443 ssl crt /etc/ssl/certs/rebloom.pem
    redirect scheme https if !{ ssl_fc }
    default_backend rebloom_backend

backend rebloom_backend
    balance roundrobin
    server api1 10.0.1.10:3000 check
    server api2 10.0.1.11:3000 check
    server api3 10.0.1.12:3000 check
```

### Performance Optimization

#### Database Optimization

```sql
-- Add database indexes
CREATE INDEX CONCURRENTLY idx_conversations_user_id ON conversations(user_id);
CREATE INDEX CONCURRENTLY idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX CONCURRENTLY idx_mood_entries_user_id_timestamp ON mood_entries(user_id, timestamp);

-- Analyze query performance
ANALYZE;

-- Update statistics
VACUUM ANALYZE;
```

#### Redis Caching

```javascript
// Add caching to frequently accessed data
const redis = require('redis');
const client = redis.createClient(process.env.REDIS_URL);

// Cache user sessions
app.use(session({
  store: new RedisStore({ client: client }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true,
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
  }
}));
```

#### CDN Setup

```bash
# Configure CloudFlare for static assets
# Add CNAME records:
# cdn.rebloom.app -> rebloom.app
# assets.rebloom.app -> rebloom.app

# Update nginx for CDN
location ~* \.(jpg|jpeg|png|gif|ico|css|js|pdf|txt)$ {
    expires 1M;
    add_header Cache-Control "public, immutable";
    add_header X-Content-Type-Options nosniff;
}
```

### Monitoring Performance

```bash
# Monitor system performance
top
htop
iostat -x 1
vmstat 1

# Monitor Docker containers
docker stats
docker system df

# Monitor database performance
psql $DATABASE_URL -c "SELECT * FROM pg_stat_activity;"
psql $DATABASE_URL -c "SELECT schemaname,tablename,attname,n_distinct,correlation FROM pg_stats;"
```

---

## Troubleshooting

### Common Issues

#### Application Won't Start

```bash
# Check environment variables
node scripts/validate-env.js

# Check logs
docker-compose -f docker-compose.production.yml logs api

# Check container health
docker-compose -f docker-compose.production.yml ps

# Test database connection
telnet db.rebloom.app 5432
psql $DATABASE_URL -c "SELECT 1;"

# Check disk space
df -h

# Check memory usage
free -h
```

#### High Memory Usage

```bash
# Check container memory usage
docker stats --no-stream

# Check for memory leaks
node --inspect=0.0.0.0:9229 server.js

# Increase container memory limits
# Edit docker-compose.production.yml
deploy:
  resources:
    limits:
      memory: 2G
```

#### Database Connection Issues

```bash
# Test database connectivity
psql $DATABASE_URL -c "\l"

# Check connection pool
psql $DATABASE_URL -c "SELECT * FROM pg_stat_activity WHERE state = 'active';"

# Check database logs
sudo tail -f /var/log/postgresql/postgresql-*.log

# Restart database (if local)
sudo systemctl restart postgresql
```

#### SSL Certificate Issues

```bash
# Test SSL certificate
openssl s_client -connect rebloom.app:443 -servername rebloom.app

# Check certificate expiration
openssl x509 -in /etc/ssl/certs/rebloom.app.crt -text -noout | grep "Not After"

# Renew Let's Encrypt certificate
sudo certbot renew --dry-run
sudo certbot renew

# Reload nginx
sudo nginx -t
sudo nginx -s reload
```

#### High CPU Usage

```bash
# Identify CPU-intensive processes
top -c
ps aux --sort=-%cpu | head -10

# Check application performance
node --prof server.js
node --prof-process isolate-*.log > profile.txt

# Monitor API response times
curl -w "@curl-format.txt" -s https://rebloom.app/api/v1/health
```

### Log Analysis

#### Application Logs

```bash
# View real-time logs
docker-compose -f docker-compose.production.yml logs -f api

# Search for errors
docker-compose logs api | grep -i error

# Analyze log patterns
awk '{print $1}' /var/log/rebloom/application.log | sort | uniq -c | sort -nr
```

#### System Logs

```bash
# System journal
sudo journalctl -f
sudo journalctl -u docker

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Database logs
sudo tail -f /var/log/postgresql/postgresql-*.log
```

### Emergency Procedures

#### Service Recovery

```bash
# Emergency restart
sudo systemctl restart docker
docker-compose -f docker-compose.production.yml restart

# Roll back to previous version
docker tag rebloom:previous rebloom:latest
docker-compose -f docker-compose.production.yml up -d

# Enable maintenance mode
cp config/nginx/maintenance.conf config/nginx/nginx.conf
nginx -s reload
```

#### Crisis Communication

```bash
# Update status page
curl -X POST https://api.statuspage.io/v1/pages/YOUR_PAGE_ID/incidents \
  -H "Authorization: OAuth YOUR_API_KEY" \
  -d '{"incident": {"name": "Service Degradation", "status": "investigating"}}'

# Send user notification
node scripts/send-service-notification.js "We are experiencing technical difficulties. Our team is working to resolve the issue."
```

---

## Maintenance

### Regular Maintenance Tasks

#### Daily Tasks

```bash
# Health check
curl -f https://rebloom.app/health

# Monitor key metrics
curl -s https://rebloom.app/metrics | grep rebloom_active_users

# Check error logs
docker-compose logs --tail=100 api | grep -i error

# Verify backups
ls -la /opt/rebloom/backups/ | tail -5
```

#### Weekly Tasks

```bash
# System updates
sudo apt-get update && sudo apt-get upgrade -y

# Docker cleanup
docker system prune -f
docker image prune -f

# Log rotation
sudo logrotate -f /etc/logrotate.d/rebloom

# Certificate check
openssl x509 -in /etc/ssl/certs/rebloom.app.crt -checkend 2592000 -noout
```

#### Monthly Tasks

```bash
# Full security scan
nmap -sS -O rebloom.app
docker run --rm anchore/grype:latest rebloom:latest

# Performance analysis
node --prof server.js &
sleep 300
kill $!
node --prof-process isolate-*.log > monthly-profile.txt

# Database maintenance
psql $DATABASE_URL -c "VACUUM ANALYZE;"
psql $DATABASE_URL -c "REINDEX DATABASE rebloom_production;"

# Backup verification
bash scripts/test-restore.sh
```

### Update Procedures

#### Application Updates

```bash
# Test update in staging
git checkout staging
git pull origin main
bash scripts/deploy.sh staging latest

# Verify staging deployment
bash scripts/integration-tests.sh staging.rebloom.app

# Deploy to production
git checkout main
bash scripts/deploy.sh production latest

# Monitor deployment
bash scripts/post-deployment-check.sh
```

#### Security Updates

```bash
# System security updates
sudo apt-get update
apt list --upgradable | grep -i security
sudo apt-get upgrade

# Container updates
docker pull ghcr.io/your-org/rebloom:latest
docker-compose -f docker-compose.production.yml up -d

# Dependency updates
npm audit
npm audit fix

# Vulnerability scan
docker run --rm -v "$PWD":/tmp/app \
  -w /tmp/app \
  anchore/grype:latest \
  --config /tmp/app/.grype.yaml .
```

### Performance Monitoring

#### Key Metrics to Monitor

**Application Metrics:**
- Response time (target: < 500ms average)
- Error rate (target: < 1%)
- Active users
- Conversations per hour
- Crisis alerts triggered

**System Metrics:**
- CPU usage (target: < 70%)
- Memory usage (target: < 80%)
- Disk usage (target: < 85%)
- Network I/O
- Database connections

**Business Metrics:**
- User retention rates
- Session duration
- Feature adoption
- Safety plan usage
- Support ticket volume

#### Monitoring Dashboard

Access monitoring at:
- **Grafana**: https://monitoring.rebloom.app:3001
- **Prometheus**: https://monitoring.rebloom.app:9090
- **Application metrics**: https://rebloom.app/metrics

---

## Contact & Support

### Production Support
- **On-call Engineer**: +1-555-0123
- **DevOps Team**: devops@rebloom.app
- **Security Team**: security@rebloom.app
- **Status Page**: https://status.rebloom.app

### Escalation Procedures

**P0 (Critical) - Immediate Response**
- Call on-call engineer
- Create incident channel: #incident-YYYYMMDD
- Notify leadership within 15 minutes
- Activate crisis team if user safety affected

**P1 (High) - 1 Hour Response**
- Create support ticket
- Assign to on-call engineer
- Notify team lead

**P2/P3 (Medium/Low) - Next Business Day**
- Create support ticket
- Normal support queue processing

---

## Conclusion

This deployment guide provides a comprehensive approach to deploying and maintaining the Rebloom mental health AI application in production. Key considerations include:

- **Security First**: All communications encrypted, regular security updates
- **High Availability**: Multi-instance deployment with load balancing
- **Monitoring**: Comprehensive monitoring and alerting
- **Compliance**: HIPAA compliance throughout the deployment
- **Scalability**: Designed to scale horizontally as needed
- **Disaster Recovery**: Regular backups and tested recovery procedures

Regular maintenance and monitoring are essential for maintaining a secure, performant, and compliant mental health application.

---

*Last updated: January 2024*  
*Version: 1.0.0*  
*Questions: devops@rebloom.app*