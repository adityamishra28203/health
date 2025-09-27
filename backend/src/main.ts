import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);
    
    // Enable CORS
    app.enableCors({
      origin: process.env.CORS_ORIGIN?.split(',') || [
        'http://localhost:3000', 
        'http://localhost:8081',
        'https://healthwallet.vercel.app',
        'https://healthwallet-frontend.vercel.app',
        'https://health-j0gvmolnu-adityamishra28203s-projects.vercel.app'
      ],
      credentials: true,
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
      .setDescription('Blockchain-powered health records and insurance platform API')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);

    // Health check endpoint
    app.getHttpAdapter().get('/health', (req, res) => {
      res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        platform: 'vercel',
      });
    });

    const port = process.env.PORT || 3001;
    await app.listen(port, '0.0.0.0');
    
    console.log(`🚀 HealthWallet API is running on: http://0.0.0.0:${port}`);
    console.log(`📚 API Documentation: http://0.0.0.0:${port}/api/docs`);
    console.log(`🌐 Platform: Vercel`);
  } catch (error) {
    console.error('❌ Failed to start application:', error);
    process.exit(1);
  }
}

bootstrap();