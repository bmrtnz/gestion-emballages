import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { Logger } from '@nestjs/common';

/**
 * CORS Configuration Factory
 * Provides secure CORS configuration based on environment
 */
export class CorsConfigFactory {
  private static readonly logger = new Logger('CORS');

  /**
   * Creates CORS configuration based on environment variables
   * @param corsOrigins - Comma-separated list of allowed origins
   * @param environment - Current environment (development, staging, production)
   * @returns CORS configuration object
   */
  static createCorsOptions(corsOrigins: string, environment: string): CorsOptions {
    const allowedOrigins = corsOrigins
      .split(',')
      .map(origin => origin.trim())
      .filter(Boolean);

    // Log configuration (secure logging for production)
    if (environment === 'development') {
      this.logger.log(`CORS enabled for origins: ${allowedOrigins.join(', ')}`);
    } else {
      this.logger.log(`CORS enabled for ${allowedOrigins.length} configured origin(s)`);
    }

    // Validate origins in production
    if (environment === 'production') {
      const invalidOrigins = allowedOrigins.filter(origin => 
        origin.includes('localhost') || 
        origin.includes('127.0.0.1') ||
        origin === '*'
      );
      
      if (invalidOrigins.length > 0) {
        this.logger.error(`Invalid origins detected in production: ${invalidOrigins.join(', ')}`);
        throw new Error('Invalid CORS origins configured for production environment');
      }
    }

    return {
      origin: (origin, callback) => {
        // Allow requests with no origin in development (Postman, mobile apps, etc.)
        if (environment === 'development' && !origin) {
          return callback(null, true);
        }

        // Check if origin is in allowed list
        if (allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          this.logger.warn(`Blocked CORS request from origin: ${origin || 'unknown'}`);
          callback(new Error('Not allowed by CORS'), false);
        }
      },
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
      allowedHeaders: [
        'Origin',
        'X-Requested-With',
        'Content-Type',
        'Accept',
        'Authorization',
        'Cache-Control',
        'X-Api-Key',
        'X-Forwarded-For',
        'User-Agent',
        'If-Modified-Since',
        'If-None-Match'
      ],
      exposedHeaders: [
        'X-Total-Count',
        'X-Page-Count', 
        'X-Current-Page',
        'Link',
        'ETag',
        'Last-Modified'
      ],
      credentials: true,
      maxAge: environment === 'production' ? 86400 : 3600, // 24h in prod, 1h in dev
      optionsSuccessStatus: 200, // For legacy browser support
      preflightContinue: false,
    };
  }

  /**
   * Validates CORS configuration
   * @param corsOrigins - Origins to validate
   * @param environment - Environment context
   */
  static validateCorsConfig(corsOrigins: string, environment: string): void {
    if (!corsOrigins || corsOrigins.trim() === '') {
      throw new Error('CORS_ORIGINS environment variable is required');
    }

    const origins = corsOrigins.split(',').map(o => o.trim()).filter(Boolean);

    if (origins.length === 0) {
      throw new Error('At least one CORS origin must be specified');
    }

    // Production-specific validations
    if (environment === 'production') {
      origins.forEach(origin => {
        if (!origin.startsWith('https://')) {
          throw new Error(`Production CORS origins must use HTTPS: ${origin}`);
        }
        
        if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
          throw new Error(`Localhost origins not allowed in production: ${origin}`);
        }

        if (origin === '*') {
          throw new Error('Wildcard origin (*) not allowed in production');
        }
      });
    }

    this.logger.log(`CORS configuration validated for ${environment} environment`);
  }
}