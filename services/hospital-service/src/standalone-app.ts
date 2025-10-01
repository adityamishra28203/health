import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { Module, Controller, Get, Post, Body, Param, Injectable } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

// Simple in-memory data storage
@Injectable()
export class HospitalService {
  private readonly logger = new Logger(HospitalService.name);
  private hospitals: any[] = [];

  async registerHospital(request: any): Promise<any> {
    this.logger.log(`Registering hospital: ${request.name}`);

    const hospitalId = `HOSP_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const hospital = {
      hospitalId,
      name: request.name,
      registrationNumber: request.registrationNumber,
      type: request.type,
      address: request.address,
      contactInfo: request.contactInfo,
      specialties: request.specialties || [],
      status: 'pending',
      ownerEmail: request.ownerEmail,
      ownerName: request.ownerName,
      createdAt: new Date(),
    };

    this.hospitals.push(hospital);

    return {
      hospitalId,
      status: 'pending',
      message: 'Hospital registered successfully. Awaiting verification.',
    };
  }

  async getHospital(hospitalId: string): Promise<any> {
    const hospital = this.hospitals.find(h => h.hospitalId === hospitalId);
    if (!hospital) {
      throw new Error('Hospital not found');
    }
    return hospital;
  }

  async getHospitals(): Promise<any> {
    return {
      hospitals: this.hospitals,
      total: this.hospitals.length,
    };
  }
}

@ApiTags('hospitals')
@Controller('hospitals')
export class HospitalController {
  constructor(private readonly hospitalService: HospitalService) {}

  @Get('health')
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  async healthCheck() {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'hospital-service',
      version: '1.0.0'
    };
  }

  @Post()
  @ApiOperation({ summary: 'Register new hospital' })
  @ApiResponse({ status: 201, description: 'Hospital registered successfully' })
  async registerHospital(@Body() request: any) {
    return this.hospitalService.registerHospital(request);
  }

  @Get()
  @ApiOperation({ summary: 'Get all hospitals' })
  @ApiResponse({ status: 200, description: 'List of hospitals' })
  async getHospitals() {
    return this.hospitalService.getHospitals();
  }

  @Get(':hospitalId')
  @ApiOperation({ summary: 'Get hospital details' })
  @ApiResponse({ status: 200, description: 'Hospital details' })
  async getHospital(@Param('hospitalId') hospitalId: string) {
    return this.hospitalService.getHospital(hospitalId);
  }
}

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '15m' },
    }),
  ],
  controllers: [HospitalController],
  providers: [HospitalService],
})
export class AppModule {}

async function bootstrap() {
  const logger = new Logger('HospitalService');
  
  try {
    const app = await NestFactory.create(AppModule);

    // Security middleware
    app.use(helmet());

    // Rate limiting
    app.use(rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 2000, // limit each IP to 2000 requests per windowMs
      message: 'Too many requests from this IP, please try again later.',
    }));

    // Global validation pipe
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }));

    // CORS
    app.enableCors({
      origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
      credentials: true,
    });

    // Global prefix
    app.setGlobalPrefix('api/v1');

    const port = process.env.PORT || 3003;
    await app.listen(port);
    
    logger.log(`🏥 Hospital Service is running on port ${port}`);
    logger.log(`📚 Health Check: http://localhost:${port}/api/v1/hospitals/health`);
    logger.log(`📋 Register Hospital: http://localhost:${port}/api/v1/hospitals`);
    logger.log(`📋 Get Hospitals: http://localhost:${port}/api/v1/hospitals`);
    
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
