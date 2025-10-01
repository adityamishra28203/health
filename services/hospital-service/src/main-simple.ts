import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { HospitalSimpleModule } from './hospital-simple.module';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

async function bootstrap() {
  const logger = new Logger('HospitalService');
  
  try {
    const app = await NestFactory.create(HospitalSimpleModule);
    const configService = app.get(ConfigService);

    // Security middleware
    app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
    }));

    // Rate limiting
    app.use(rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 2000, // limit each IP to 2000 requests per windowMs
      message: 'Too many requests from this IP, please try again later.',
      standardHeaders: true,
      legacyHeaders: false,
    }));

    // Global validation pipe
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }));

    // CORS
    app.enableCors({
      origin: configService.get('ALLOWED_ORIGINS', 'http://localhost:3000').split(','),
      credentials: true,
    });

    // Global prefix
    app.setGlobalPrefix('api/v1');

    const port = configService.get('PORT', 3003);
    await app.listen(port);
    
    logger.log(`🏥 Hospital Service is running on port ${port}`);
    logger.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
    logger.log(`🔍 Health Check: http://localhost:${port}/api/v1/health`);
    
  } catch (error) {
    logger.error('❌ Failed to start Hospital Service', error);
    process.exit(1);
  }
}

bootstrap().catch((error) => {
  const logger = new Logger('HospitalService');
  logger.error('❌ Bootstrap failed', error);
  process.exit(1);
});
