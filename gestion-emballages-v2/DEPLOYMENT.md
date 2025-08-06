# Deployment Guide - Gestion Emballages V2

This guide covers various deployment scenarios for the Gestion Emballages V2 application.

## 🐳 Docker Deployment (Recommended)

### Prerequisites
- Docker 20.10+
- Docker Compose 2.0+
- 4GB RAM minimum
- 10GB disk space

### Production Docker Setup

1. **Create docker-compose.yml**:
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: gestion_emballages
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "5432:5432"
    restart: unless-stopped

  minio:
    image: minio/minio:latest
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: ${MINIO_ACCESS_KEY}
      MINIO_ROOT_PASSWORD: ${MINIO_SECRET_KEY}
    volumes:
      - minio_data:/data
    ports:
      - "9000:9000"
      - "9001:9001"
    restart: unless-stopped

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.prod
    environment:
      NODE_ENV: production
      DATABASE_HOST: postgres
      DATABASE_PORT: 5432
      DATABASE_NAME: gestion_emballages
      DATABASE_USERNAME: postgres
      DATABASE_PASSWORD: ${DB_PASSWORD}
      JWT_SECRET: ${JWT_SECRET}
      JWT_EXPIRATION: 1d
      MINIO_ENDPOINT: minio
      MINIO_PORT: 9000
      MINIO_ACCESS_KEY: ${MINIO_ACCESS_KEY}
      MINIO_SECRET_KEY: ${MINIO_SECRET_KEY}
      MINIO_BUCKET: documents
    ports:
      - "3000:3000"
    depends_on:
      - postgres
      - minio
    restart: unless-stopped

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.prod
    ports:
      - "80:80"
    depends_on:
      - backend
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    ports:
      - "443:443"
    depends_on:
      - frontend
      - backend
    restart: unless-stopped

volumes:
  postgres_data:
  minio_data:
```

2. **Create environment file (.env)**:
```env
# Database
DB_PASSWORD=your_secure_db_password

# JWT
JWT_SECRET=your_super_secure_jwt_secret_key_minimum_32_characters

# MinIO
MINIO_ACCESS_KEY=your_minio_access_key
MINIO_SECRET_KEY=your_minio_secret_key_minimum_8_chars
```

3. **Deploy**:
```bash
docker-compose up -d
```

### Backend Dockerfile (Dockerfile.prod)
```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM node:18-alpine AS runtime

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

WORKDIR /app

COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/package*.json ./

USER nestjs

EXPOSE 3000

CMD ["node", "dist/main"]
```

### Frontend Dockerfile (Dockerfile.prod)
```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine AS runtime

COPY --from=builder /app/dist/gestion-emballages /usr/share/nginx/html
COPY nginx-default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### Nginx Configuration (nginx-default.conf)
```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1000;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Handle Angular routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API proxy
    location /api {
        proxy_pass http://backend:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Static files caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1M;
        add_header Cache-Control "public, immutable";
    }
}
```

## 🖥️ Manual Server Deployment

### Server Requirements
- Ubuntu 20.04+ or CentOS 8+
- 4GB RAM minimum
- 20GB disk space
- Node.js 18+
- PostgreSQL 15+
- Nginx
- PM2 (for process management)

### Backend Deployment

1. **Install dependencies**:
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt install nginx
```

2. **Setup database**:
```bash
sudo -u postgres psql
CREATE DATABASE gestion_emballages;
CREATE USER gestion_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE gestion_emballages TO gestion_user;
\q
```

3. **Deploy backend**:
```bash
# Clone repository
git clone <repository-url>
cd gestion-emballages-v2/backend

# Install dependencies
npm ci --production

# Build application
npm run build

# Create ecosystem file for PM2
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'gestion-emballages-backend',
    script: 'dist/main.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      DATABASE_HOST: 'localhost',
      DATABASE_PORT: 5432,
      DATABASE_NAME: 'gestion_emballages',
      DATABASE_USERNAME: 'gestion_user',
      DATABASE_PASSWORD: 'secure_password',
      JWT_SECRET: 'your_jwt_secret',
      JWT_EXPIRATION: '1d'
    }
  }]
};
EOF

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### Frontend Deployment

1. **Build frontend**:
```bash
cd ../frontend

# Install dependencies
npm ci

# Build for production
npm run build
```

2. **Configure Nginx**:
```bash
sudo tee /etc/nginx/sites-available/gestion-emballages << EOF
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/gestion-emballages;
    index index.html;

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Enable site
sudo ln -s /etc/nginx/sites-available/gestion-emballages /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Copy built files
sudo cp -r dist/gestion-emballages/* /var/www/gestion-emballages/
```

## 🔒 SSL Certificate Setup

### Using Let's Encrypt (Recommended)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Generate certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal (add to crontab)
0 12 * * * /usr/bin/certbot renew --quiet
```

### Manual SSL Certificate

```bash
# Create SSL directory
sudo mkdir -p /etc/nginx/ssl

# Copy your certificates
sudo cp your-certificate.crt /etc/nginx/ssl/
sudo cp your-private-key.key /etc/nginx/ssl/

# Update Nginx configuration
server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    ssl_certificate /etc/nginx/ssl/your-certificate.crt;
    ssl_certificate_key /etc/nginx/ssl/your-private-key.key;
    
    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    
    # ... rest of configuration
}
```

## 📊 Monitoring & Logging

### PM2 Monitoring

```bash
# View processes
pm2 list

# View logs
pm2 logs

# Monitor metrics
pm2 monit

# Restart application
pm2 restart gestion-emballages-backend
```

### Log Rotation

```bash
# Configure PM2 log rotation
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 30
pm2 set pm2-logrotate:compress true
```

### Nginx Monitoring

```bash
# Check Nginx status
sudo systemctl status nginx

# View access logs
sudo tail -f /var/log/nginx/access.log

# View error logs
sudo tail -f /var/log/nginx/error.log
```

## 🔧 Environment Variables

### Production Environment (.env)

```env
NODE_ENV=production

# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=gestion_emballages
DATABASE_USERNAME=gestion_user
DATABASE_PASSWORD=secure_password

# JWT
JWT_SECRET=your_super_secure_jwt_secret_32_characters_minimum
JWT_EXPIRATION=1d

# MinIO
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=admin
MINIO_SECRET_KEY=password123
MINIO_BUCKET=documents
MINIO_USE_SSL=false

# CORS
CORS_ORIGIN=https://your-domain.com

# Rate limiting
RATE_LIMIT_TTL=60
RATE_LIMIT_LIMIT=100
```

## 🚀 Performance Optimization

### Database Optimization

```sql
-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_articles_category ON articles(categorie);
CREATE INDEX idx_articles_active ON articles(is_active);
CREATE INDEX idx_commandes_station ON commandes(station_id);
CREATE INDEX idx_stocks_article_station ON stocks(article_id, station_id);

-- Analyze query performance
ANALYZE;
```

### Backend Optimization

```typescript
// Enable compression
app.use(compression());

// Set security headers
app.use(helmet());

// Configure CORS
app.enableCors({
  origin: process.env.CORS_ORIGIN,
  credentials: true
});

// Rate limiting
app.use(
  rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_TTL) * 1000,
    max: parseInt(process.env.RATE_LIMIT_LIMIT)
  })
);
```

## 🔍 Health Checks

### Backend Health Check

```typescript
@Controller('health')
export class HealthController {
  @Get()
  check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    };
  }
}
```

### Docker Health Checks

```yaml
# Add to docker-compose.yml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

## 🔄 Database Migrations

### Running Migrations

```bash
# Generate migration
npm run migration:generate -- --name MigrationName

# Run migrations
npm run migration:run

# Revert migration
npm run migration:revert
```

### Backup Strategy

```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"
DB_NAME="gestion_emballages"

# Create backup
pg_dump $DB_NAME > $BACKUP_DIR/backup_$DATE.sql

# Compress backup
gzip $BACKUP_DIR/backup_$DATE.sql

# Remove backups older than 30 days
find $BACKUP_DIR -type f -name "*.sql.gz" -mtime +30 -delete

# Add to crontab for daily backups
# 0 2 * * * /path/to/backup.sh
```

## 🛠️ Troubleshooting

### Common Issues

**Database Connection Issues**:
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Check connections
sudo -u postgres psql -c "SELECT * FROM pg_stat_activity;"
```

**Memory Issues**:
```bash
# Check memory usage
free -h
pm2 show gestion-emballages-backend

# Adjust PM2 configuration
pm2 set pm2:max_memory_restart 1024M
```

**Disk Space**:
```bash
# Check disk usage
df -h

# Clean logs
pm2 flush
sudo logrotate -f /etc/logrotate.d/nginx
```

## 📋 Deployment Checklist

### Pre-deployment
- [ ] Environment variables configured
- [ ] Database migrations ready
- [ ] SSL certificates obtained
- [ ] Backup strategy implemented
- [ ] Monitoring configured

### Deployment
- [ ] Build applications
- [ ] Run database migrations
- [ ] Start services
- [ ] Verify health checks
- [ ] Test functionality

### Post-deployment
- [ ] Monitor logs
- [ ] Check performance metrics
- [ ] Verify SSL certificate
- [ ] Test user workflows
- [ ] Update documentation

This deployment guide provides comprehensive instructions for deploying the Gestion Emballages V2 application in various environments. Choose the deployment method that best fits your infrastructure requirements.