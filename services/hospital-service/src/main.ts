import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { HospitalModule } from './hospital.module';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { KafkaService } from './kafka/kafka.service';

async function bootstrap() {
  const logger = new Logger('HospitalService');
  
  const app = await NestFactory.create(HospitalModule);
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
  
  logger.log(`Hospital Service is running on port ${port}`);
  
  // Initialize Kafka consumer
  const kafkaService = app.get(KafkaService);
  await kafkaService.onModuleInit();
}

bootstrap().catch((error) => {
  const logger = new Logger('HospitalService');
  logger.error('Failed to start Hospital Service', error);
  process.exit(1);
});

