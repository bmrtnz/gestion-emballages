import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { CorsConfigFactory } from './config/cors.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  // Global prefix
  const apiPrefix = configService.get<string>('API_PREFIX', 'api');
  const apiVersion = configService.get<string>('API_VERSION', 'v1');
  app.setGlobalPrefix(`${apiPrefix}/${apiVersion}`);

  // CORS Configuration
  const environment = configService.get<string>('NODE_ENV', 'development');
  const corsOrigins = configService.get<string>('CORS_ORIGINS', 'http://localhost:4200');
  
  // Validate CORS configuration
  CorsConfigFactory.validateCorsConfig(corsOrigins, environment);
  
  // Apply CORS configuration
  const corsOptions = CorsConfigFactory.createCorsOptions(corsOrigins, environment);
  app.enableCors(corsOptions);

  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    })
  );

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('Blue Whale Portal API')
    .setDescription('API documentation for the Blue Whale Portal - B2B Supply Chain Management Platform')
    .setVersion('2.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(`${apiPrefix}/docs`, app, document);

  const port = configService.get<number>('PORT', 3001);
  await app.listen(port);

  const bootstrapLogger = new Logger('Bootstrap');
  bootstrapLogger.log(`Application is running on: http://localhost:${port}/${apiPrefix}/${apiVersion}`);
  bootstrapLogger.log(`Swagger documentation: http://localhost:${port}/${apiPrefix}/docs`);
}

bootstrap();
