# Docker Setup Guide

This document explains the Docker Compose configurations for the Gestion Emballages project.

## Files Overview

- **`docker-compose.yml`** - Base configuration (infrastructure services only)
- **`docker-compose.dev.yml`** - Development overrides and additional services
- **`docker-compose.prod.yml`** - Production overrides and optimization
- **`docker-compose.local.yml`** - Local development (infrastructure only)
- **`.env.example`** - Environment variables template

## Quick Start

### Development (Full Stack)

```bash
# Start infrastructure + backend + frontend
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.yml -f docker-compose.dev.yml logs -f
```

### Local Development (Infrastructure Only)

```bash
# Start only infrastructure services (database, redis, minio)
docker-compose -f docker-compose.local.yml up -d

# Run backend and frontend locally
cd backend && npm run start:dev
cd frontend && npm start
```

### Production

```bash
# Start with production configuration
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# With monitoring stack
docker-compose -f docker-compose.yml -f docker-compose.prod.yml --profile monitoring up -d

# With load balancer
docker-compose -f docker-compose.yml -f docker-compose.prod.yml --profile loadbalancer up -d
```

## Configuration Strategy

### Base Configuration (`docker-compose.yml`)
- **PostgreSQL** - Database service with health checks
- **Redis** - Caching and session storage  
- **MinIO** - Object storage for files
- All services use environment variable defaults
- Consistent naming: `blue-whale-portal-*`
- Shared network: `blue-whale-portal-network`

### Development Override (`docker-compose.dev.yml`)
- Extends base configuration
- **Backend** - NestJS with hot reload, debugging enabled
- **Frontend** - Angular with live reload
- **Development Tools**:
  - Adminer (database management)
  - MailHog (email testing) 
  - Redis Commander (redis management)
  - Test database for running tests
- Volume mounts for live code editing
- Different ports to avoid conflicts

### Production Override (`docker-compose.prod.yml`)
- Production-optimized builds and configurations
- Resource limits and health checks
- **Optional Profiles**:
  - `monitoring` - Prometheus, Grafana, Loki
  - `loadbalancer` - HAProxy load balancer
  - `backup` - Database backup service
- Environment variable driven configuration
- SSL/TLS support ready

### Local Configuration (`docker-compose.local.yml`)
- Infrastructure services only
- Designed for running backend/frontend locally
- Simplified service stack
- Cross-platform volume handling

## Environment Variables

Copy `.env.example` to `.env` and customize:

```bash
cp .env.example .env
# Edit .env with your specific values
```

### Key Variables

```env
# Database
POSTGRES_DB=blue_whale_portal
POSTGRES_USER=postgres  
POSTGRES_PASSWORD=your-secure-password

# MinIO
MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=minioadmin123

# Backend
JWT_SECRET=your-super-secret-jwt-key
CORS_ORIGIN=http://localhost:4200
```

## Service Ports

### Development
- **Backend**: 3000
- **Frontend**: 4200
- **PostgreSQL**: 5433 (to avoid conflicts)
- **Redis**: 6380 (to avoid conflicts)
- **MinIO API**: 9010
- **MinIO Console**: 9011
- **Adminer**: 8080
- **MailHog Web**: 8025
- **Redis Commander**: 8081

### Production
- **Backend**: 3000 (internal)
- **Frontend**: 80, 443 (via nginx)
- **PostgreSQL**: 5432 (internal)
- **Redis**: 6379 (internal)
- **MinIO API**: 9000 (internal)
- **MinIO Console**: 9001 (internal)
- **Load Balancer**: 80, 443, 8404 (stats)
- **Monitoring**: 9090 (Prometheus), 3001 (Grafana), 3100 (Loki)

### Local
- **PostgreSQL**: 5432
- **Redis**: 6379
- **MinIO API**: 9000
- **MinIO Console**: 9001
- **Adminer**: 8080
- **MailHog Web**: 8025

## Profiles

Use profiles to start optional services:

```bash
# Start with monitoring stack
docker-compose -f docker-compose.yml -f docker-compose.prod.yml --profile monitoring up -d

# Start test database  
docker-compose -f docker-compose.yml -f docker-compose.dev.yml --profile test up postgres-test

# Start development tools
docker-compose -f docker-compose.local.yml --profile tools up -d
```

## Health Checks

All services include health checks:
- **PostgreSQL**: `pg_isready` command
- **Redis**: `redis-cli ping`
- **MinIO**: HTTP health endpoint
- **Backend**: `/health` endpoint (when running)
- **Frontend**: nginx health check

## Volume Management

### Development
- **Code Volumes**: `./backend:/app` and `./frontend:/app` for live reload
- **Anonymous Volumes**: `/app/node_modules` to prevent conflicts
- **Persistent Data**: Named volumes for database, redis, minio data

### Production  
- **Persistent Data**: Named volumes with optional bind mounts
- **Configuration**: Read-only bind mounts for config files
- **Logs**: Bind mounts for log collection
- **SSL Certificates**: Read-only bind mounts

## Common Commands

```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f [service-name]

# Stop services
docker-compose down

# Remove volumes (WARNING: deletes data)
docker-compose down -v

# Rebuild services
docker-compose build --no-cache

# Scale services (production)
docker-compose up -d --scale backend=3

# Access service shell
docker-compose exec postgres psql -U postgres -d blue_whale_portal
docker-compose exec redis redis-cli
docker-compose exec backend bash

# Database operations
docker-compose exec backend npm run migration:run
docker-compose exec backend npm run seed
```

## Troubleshooting

### Common Issues

1. **Port Conflicts**
   ```bash
   # Check what's using the port
   netstat -tulpn | grep :5432
   # Use different ports in .env
   POSTGRES_PORT=5433
   ```

2. **Permission Issues (Linux/Mac)**
   ```bash
   # Fix ownership
   sudo chown -R $USER:$USER ./docker/data
   ```

3. **Volume Issues**
   ```bash
   # Remove and recreate volumes
   docker-compose down -v
   docker volume prune
   docker-compose up -d
   ```

4. **Build Issues**
   ```bash
   # Clean rebuild
   docker-compose build --no-cache
   docker system prune -f
   ```

### Logs and Debugging

```bash
# Check all services
docker-compose ps

# Detailed logs
docker-compose logs --tail=50 -f backend

# Service health
docker-compose exec postgres pg_isready -U postgres
docker-compose exec redis redis-cli ping
docker-compose exec backend curl -f http://localhost:3000/health
```

## Development Workflow

1. **Start infrastructure**:
   ```bash
   docker-compose -f docker-compose.local.yml up -d
   ```

2. **Run applications locally**:
   ```bash
   cd backend && npm run start:dev
   cd frontend && npm start  
   ```

3. **Or run everything in Docker**:
   ```bash
   docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d
   ```

## Production Deployment

1. **Prepare environment**:
   ```bash
   cp .env.example .env.prod
   # Edit .env.prod with production values
   ```

2. **Build and deploy**:
   ```bash
   docker-compose -f docker-compose.yml -f docker-compose.prod.yml --env-file .env.prod up -d
   ```

3. **Enable monitoring**:
   ```bash
   docker-compose -f docker-compose.yml -f docker-compose.prod.yml --profile monitoring up -d
   ```

4. **Setup SSL** (if needed):
   - Place certificates in `./docker/haproxy/ssl/`
   - Configure HAProxy in `./docker/haproxy/haproxy.cfg`

## Security Notes

- Change all default passwords in production
- Use strong JWT secrets
- Enable SSL/TLS in production
- Restrict network access appropriately
- Regular security updates for base images
- Use secrets management for sensitive data

## Performance Tuning

- Adjust resource limits in production override
- Configure connection pools appropriately  
- Use Redis for session storage and caching
- Monitor resource usage with included monitoring stack
- Scale services horizontally as needed

## Backup and Recovery

The production configuration includes a backup service:

```bash
# Run backup manually
docker-compose -f docker-compose.yml -f docker-compose.prod.yml --profile backup run --rm backup

# Restore from backup
docker-compose exec postgres psql -U postgres -d blue_whale_portal < backup.sql
```