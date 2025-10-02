import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ConsentController } from './consent.controller';
import { ConsentService } from './consent.service';
import { ConsentSchema } from './schemas/consent.schema';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      useFactory: () => ({
        uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/consent-service',
      }),
    }),
    MongooseModule.forFeature([
      { name: 'Consent', schema: ConsentSchema },
    ]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'consent-service-secret',
      signOptions: { expiresIn: '24h' },
    }),
    EventEmitterModule.forRoot(),
  ],
  controllers: [ConsentController],
  providers: [ConsentService],
  exports: [ConsentService],
})
export class AppModule {}


