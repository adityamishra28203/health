import { Controller, Get, Post, Body } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  getHealth() {
    return this.appService.getHealth();
  }

  @Get('api/health-records')
  getHealthRecords() {
    return this.appService.getSampleHealthRecords();
  }

  @Get('api/insurance-claims')
  getInsuranceClaims() {
    return this.appService.getSampleInsuranceClaims();
  }

  @Get('api/analytics')
  getAnalytics() {
    return this.appService.getSampleAnalytics();
  }

  @Post('api/auth/login')
  login(@Body() loginData: any) {
    return this.appService.login(loginData);
  }

  @Post('api/auth/register')
  register(@Body() registerData: any) {
    return this.appService.register(registerData);
  }
}