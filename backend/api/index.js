const { NestFactory } = require('@nestjs/core');

// Try to use the simplified module first, fallback to full module
let AppModule;
try {
  AppModule = require('../dist/app.module.vercel');
  console.log('✅ Using simplified AppModule for Vercel');
} catch (error) {
  console.log('⚠️ Simplified module not found, using full AppModule');
  AppModule = require('../dist/app.module');
}

let app;

async function createApp() {
  if (!app) {
    try {
      console.log('🚀 Starting HealthWallet API initialization...');
      
      // Create the NestJS application
      app = await NestFactory.create(AppModule, {
        logger: ['error', 'warn', 'log'],
      });
      
      console.log('✅ NestJS app created successfully');
      
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
      
      console.log('✅ CORS enabled');

      // Global validation pipe
      const { ValidationPipe } = require('@nestjs/common');
      app.useGlobalPipes(new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }));
      
      console.log('✅ Validation pipe configured');

      // Swagger documentation
      const { DocumentBuilder, SwaggerModule } = require('@nestjs/swagger');
      const config = new DocumentBuilder()
        .setTitle('HealthWallet API')
        .setDescription('Blockchain-powered health records and insurance platform API')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
      
      const document = SwaggerModule.createDocument(app, config);
      SwaggerModule.setup('api/docs', app, document);
      
      console.log('✅ Swagger documentation configured');

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
      
      console.log('✅ Health check endpoint configured');

      await app.init();
      console.log('🚀 HealthWallet API initialized successfully for Vercel');
    } catch (error) {
      console.error('❌ Failed to initialize application:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      throw error;
    }
  }
  return app;
}

module.exports = async (req, res) => {
  try {
    console.log(`📥 Incoming request: ${req.method} ${req.url}`);
    const app = await createApp();
    const server = app.getHttpAdapter().getInstance();
    return server(req, res);
  } catch (error) {
    console.error('❌ Error in Vercel function:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });
  }
};
