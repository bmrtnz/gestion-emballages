// Local Development Environment Configuration
// Use this configuration when running frontend locally

export const environment = {
  production: false,
  development: true,
  apiUrl: 'http://localhost:3000/api',
  apiVersion: 'v1',
  
  // Enable development features
  enableDebugTools: true,
  enableLogging: true,
  
  // File upload configuration
  maxFileSize: 10485760, // 10MB
  allowedFileTypes: ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx', 'xls', 'xlsx'],
  
  // Development tools URLs (optional)
  adminUrl: 'http://localhost:8080',      // Adminer
  mailhogUrl: 'http://localhost:8025',    // MailHog
  redisCommanderUrl: 'http://localhost:8081', // Redis Commander
  minioConsoleUrl: 'http://localhost:9011'    // MinIO Console
};