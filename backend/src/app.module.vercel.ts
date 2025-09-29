import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    // Only include modules that don't require external services for basic functionality
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}



