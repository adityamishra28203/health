import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { json, urlencoded } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security middleware
  app.use(helmet());
  
  // CORS configuration
  app.use(cors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
      'https://healthwallet.vercel.app',
      'https://healthwallet-frontend.vercel.app',
      process.env.FRONTEND_URL
    ].filter(Boolean) as string[],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Set-Cookie']
  }));

  // Rate limiting
  app.use(rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
  }));

  // Body parsing middleware - configure before our custom middleware
  app.use(json({ limit: '2mb' })); // Increased to handle base64 avatar data
  app.use(urlencoded({ extended: true, limit: '2mb' }));

  // File upload size limits
  app.use((req, res, next) => {
    // For multipart/form-data (file uploads), limit to 1MB
    if (req.headers['content-type']?.includes('multipart/form-data')) {
      if (req.headers['content-length'] && parseInt(req.headers['content-length']) > 1024 * 1024) {
        return res.status(413).json({
          statusCode: 413,
          message: 'Request entity too large. Maximum file size is 1MB.',
          error: 'Payload Too Large'
        });
      }
    }
    // For JSON requests (profile updates with base64 avatars), allow up to 2MB
    else if (req.headers['content-type']?.includes('application/json')) {
      if (req.headers['content-length'] && parseInt(req.headers['content-length']) > 2 * 1024 * 1024) {
        return res.status(413).json({
          statusCode: 413,
          message: 'Request entity too large. Maximum JSON payload size is 2MB.',
          error: 'Payload Too Large'
        });
      }
    }
    next();
  });

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('HealthWallet API')
    .setDescription('Secure healthcare data management API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Health check endpoint
  app.getHttpAdapter().get('/health', (req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0'
    });
  });

  const port = process.env.PORT || 3003;
  await app.listen(port);
  
  console.log(`🚀 HealthWallet API running on port ${port}`);
  console.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
  console.log(`🏥 Health Check: http://localhost:${port}/health`);
}

bootstrap();