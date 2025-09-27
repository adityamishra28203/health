const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('../dist/app.module');

let app;

async function createApp() {
  if (!app) {
    try {
      app = await NestFactory.create(AppModule);
      
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
      const { ValidationPipe } = require('@nestjs/common');
      app.useGlobalPipes(new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }));

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

      await app.init();
      console.log('🚀 HealthWallet API initialized for Vercel');
    } catch (error) {
      console.error('❌ Failed to initialize application:', error);
      throw error;
    }
  }
  return app;
}

module.exports = async (req, res) => {
  try {
    const app = await createApp();
    const server = app.getHttpAdapter().getInstance();
    return server(req, res);
  } catch (error) {
    console.error('Error in Vercel function:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};
