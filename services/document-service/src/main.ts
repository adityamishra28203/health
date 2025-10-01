import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentModule } from './document.module';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { KafkaService } from './kafka/kafka.service';

async function bootstrap() {
  const logger = new Logger('DocumentService');
  
  const app = await NestFactory.create(DocumentModule);
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
    max: 1000, // limit each IP to 1000 requests per windowMs
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

  const port = configService.get('PORT', 3001);
  await app.listen(port);
  
  logger.log(`Document Service is running on port ${port}`);
  
  // Initialize Kafka consumer
  const kafkaService = app.get(KafkaService);
  await kafkaService.onModuleInit();
}

bootstrap().catch((error) => {
  const logger = new Logger('DocumentService');
  logger.error('Failed to start Document Service', error);
  process.exit(1);
});

