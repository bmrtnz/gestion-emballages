import { CorsConfigFactory } from './cors.config';
import { Logger } from '@nestjs/common';

// Mock Logger to prevent actual logging during tests
jest.mock('@nestjs/common', () => ({
  ...jest.requireActual('@nestjs/common'),
  Logger: jest.fn().mockImplementation(() => ({
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  })),
}));

describe('CorsConfigFactory', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('validateCorsConfig', () => {
    it('should validate development configuration', () => {
      expect(() => {
        CorsConfigFactory.validateCorsConfig(
          'http://localhost:4200,http://localhost:3000',
          'development'
        );
      }).not.toThrow();
    });

    it('should validate production HTTPS configuration', () => {
      expect(() => {
        CorsConfigFactory.validateCorsConfig(
          'https://app.example.com,https://admin.example.com',
          'production'
        );
      }).not.toThrow();
    });

    it('should reject empty CORS origins', () => {
      expect(() => {
        CorsConfigFactory.validateCorsConfig('', 'development');
      }).toThrow('CORS_ORIGINS environment variable is required');
    });

    it('should reject localhost in production', () => {
      expect(() => {
        CorsConfigFactory.validateCorsConfig(
          'http://localhost:4200',
          'production'
        );
      }).toThrow('Localhost origins not allowed in production');
    });

    it('should reject HTTP in production', () => {
      expect(() => {
        CorsConfigFactory.validateCorsConfig(
          'http://example.com',
          'production'
        );
      }).toThrow('Production CORS origins must use HTTPS');
    });

    it('should reject wildcard in production', () => {
      expect(() => {
        CorsConfigFactory.validateCorsConfig('*', 'production');
      }).toThrow('Wildcard origin (*) not allowed in production');
    });
  });

  describe('createCorsOptions', () => {
    it('should create development CORS options', () => {
      const options = CorsConfigFactory.createCorsOptions(
        'http://localhost:4200',
        'development'
      );

      expect(options).toBeDefined();
      expect(options.credentials).toBe(true);
      expect(options.maxAge).toBe(3600);
      expect(options.methods).toContain('GET');
      expect(options.methods).toContain('POST');
      expect(options.allowedHeaders).toContain('Authorization');
    });

    it('should create production CORS options', () => {
      const options = CorsConfigFactory.createCorsOptions(
        'https://app.example.com',
        'production'
      );

      expect(options).toBeDefined();
      expect(options.credentials).toBe(true);
      expect(options.maxAge).toBe(86400); // 24 hours for production
    });

    it('should allow multiple origins', () => {
      const corsOrigins = 'https://app.example.com,https://admin.example.com';
      const options = CorsConfigFactory.createCorsOptions(
        corsOrigins,
        'production'
      );

      // Test the origin function
      const originCallback = options.origin as Function;
      const mockCallback = jest.fn();

      // Test allowed origins
      originCallback('https://app.example.com', mockCallback);
      expect(mockCallback).toHaveBeenCalledWith(null, true);

      mockCallback.mockClear();
      originCallback('https://admin.example.com', mockCallback);
      expect(mockCallback).toHaveBeenCalledWith(null, true);

      // Test disallowed origin
      mockCallback.mockClear();
      originCallback('https://malicious.com', mockCallback);
      expect(mockCallback).toHaveBeenCalledWith(
        new Error('Not allowed by CORS'),
        false
      );
    });

    it('should allow no origin in development', () => {
      const options = CorsConfigFactory.createCorsOptions(
        'http://localhost:4200',
        'development'
      );

      const originCallback = options.origin as Function;
      const mockCallback = jest.fn();

      // Test no origin (Postman, mobile apps)
      originCallback(undefined, mockCallback);
      expect(mockCallback).toHaveBeenCalledWith(null, true);
    });

    it('should reject no origin in production', () => {
      const options = CorsConfigFactory.createCorsOptions(
        'https://app.example.com',
        'production'
      );

      const originCallback = options.origin as Function;
      const mockCallback = jest.fn();

      // Test no origin in production
      originCallback(undefined, mockCallback);
      expect(mockCallback).toHaveBeenCalledWith(
        new Error('Not allowed by CORS'),
        false
      );
    });

    it('should throw error for invalid production origins', () => {
      expect(() => {
        CorsConfigFactory.createCorsOptions(
          'http://localhost:4200',
          'production'
        );
      }).toThrow('Invalid CORS origins configured for production environment');
    });

    it('should include security headers', () => {
      const options = CorsConfigFactory.createCorsOptions(
        'http://localhost:4200',
        'development'
      );

      expect(options.allowedHeaders).toContain('Authorization');
      expect(options.allowedHeaders).toContain('Content-Type');
      expect(options.allowedHeaders).toContain('X-Api-Key');
      expect(options.exposedHeaders).toContain('X-Total-Count');
    });
  });
});