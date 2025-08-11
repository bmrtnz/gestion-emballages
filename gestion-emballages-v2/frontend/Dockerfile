# Multi-stage build for Angular Frontend
FROM node:18-alpine AS base

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apk add --no-cache \
    python3 \
    make \
    g++

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install && npm cache clean --force

# Development stage
FROM base AS development
COPY . .
EXPOSE 4200
CMD ["npm", "run", "start"]

# Build stage
FROM base AS build

# Copy source code
COPY . .

# Build arguments
ARG API_URL=http://localhost:3000/api
ARG PRODUCTION=true

# Create environment file
RUN echo "export const environment = { \
    production: ${PRODUCTION}, \
    apiUrl: '${API_URL}', \
    appName: 'Blue Whale Portal', \
    version: '2.0.0' \
};" > src/environments/environment.prod.ts

# Build the application
RUN npm run build

# Production stage with Nginx
FROM nginx:alpine AS production

# Copy custom nginx configuration
COPY docker/nginx/nginx.conf /etc/nginx/nginx.conf

# Copy built application
COPY --from=build /app/dist/blue-whale-portal-frontend /usr/share/nginx/html

# Copy health check script
COPY docker/nginx/health-check.sh /usr/local/bin/health-check.sh
RUN chmod +x /usr/local/bin/health-check.sh

# Create nginx user and set permissions
RUN adduser -D -s /bin/sh nginx && \
    chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    chown -R nginx:nginx /etc/nginx/conf.d

# Switch to non-root user
USER nginx

# Expose ports
EXPOSE 80 443

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD /usr/local/bin/health-check.sh

# Start nginx
CMD ["nginx", "-g", "daemon off;"]