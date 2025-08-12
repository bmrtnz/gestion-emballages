# Local Development Setup

This guide explains how to run the backend and frontend locally (outside Docker) while using Docker only for supporting services.

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Docker and Docker Compose

## Quick Start

### 1. Start Supporting Services

Start PostgreSQL, Redis, MinIO, and development tools with Docker:

```bash
docker-compose -f docker-compose.local.yml up -d
```

### 2. Setup Backend (NestJS)

```bash
cd backend

# Install dependencies
npm install

# Copy the local environment file
copy .env.local .env
# On Linux/Mac: cp .env.local .env

# Run database migrations (if applicable)
npm run migration:run

# Start the backend in development mode
npm run start:dev
```

The backend will be available at `http://localhost:3000`

### 3. Setup Frontend (Angular)

```bash
cd frontend

# Install dependencies
npm install

# Start the frontend in development mode with local environment
ng serve --configuration=local
```

If you don't have the local configuration set up in angular.json, you can run:
```bash
ng serve --port 4200
```

The frontend will be available at `http://localhost:4200`

## Development Tools

When running the supporting services with Docker, you'll have access to:

- **Adminer** (Database GUI): http://localhost:8080
- **MailHog** (Email testing): http://localhost:8025
- **Redis Commander**: http://localhost:8081
- **MinIO Console**: http://localhost:9011

## Configuration Files

- `docker-compose.local.yml`: Only supporting services (PostgreSQL, Redis, MinIO, etc.)
- `backend/.env.local`: Backend environment variables for local development
- `frontend/src/environments/environment.local.ts`: Frontend environment configuration

## Database Connection

The backend connects to PostgreSQL running in Docker:
- Host: `localhost`
- Port: `5433` (mapped from container's 5432)
- Database: `gestion_emballages_dev`
- User: `dev_user`
- Password: `dev_password`

## Debugging

### Backend Debugging
- The backend runs with `npm run start:dev` which includes hot reload
- Enable debug logs by setting `DEBUG=true` in `.env`
- Database logging is enabled by default (`DB_LOGGING=true`)

### Frontend Debugging
- Angular dev server includes hot reload by default
- Development tools are enabled in `environment.local.ts`
- Use browser developer tools for debugging

## Stopping Services

To stop all Docker services:
```bash
docker-compose -f docker-compose.local.yml down
```

To stop and remove volumes (reset database data):
```bash
docker-compose -f docker-compose.local.yml down -v
```

## Switching Between Docker and Local

To switch back to full Docker development:
```bash
docker-compose -f docker-compose.dev.yml up -d
```

To switch to local development:
```bash
docker-compose -f docker-compose.dev.yml down
docker-compose -f docker-compose.local.yml up -d
```

## Troubleshooting

1. **Port conflicts**: Make sure ports 3000, 4200, 5433, 6380, 9010, 9011 are not in use
2. **Database connection**: Wait for PostgreSQL to be healthy before starting the backend
3. **Environment variables**: Ensure `.env` file is properly copied in the backend directory
4. **Node modules**: Run `npm install` in both backend and frontend directories if you encounter module errors