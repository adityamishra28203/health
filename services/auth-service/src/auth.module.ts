import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { KeycloakService } from './keycloak/keycloak.service';
import { ABHAService } from './abha/abha.service';
import { JWTService } from './jwt/jwt.service';
import { MFAService } from './mfa/mfa.service';
import { KafkaService } from './kafka/kafka.service';
import { UserSchema } from './schemas/user.schema';
import { SessionSchema } from './schemas/session.schema';
import { AuditLogSchema } from './schemas/audit-log.schema';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    MongooseModule.forRootAsync({
      useFactory: () => ({
        uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/auth-service',
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }),
    }),
    MongooseModule.forFeature([
      { name: 'User', schema: UserSchema },
      { name: 'Session', schema: SessionSchema },
      { name: 'AuditLog', schema: AuditLogSchema },
    ]),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    KeycloakService,
    ABHAService,
    JWTService,
    MFAService,
    KafkaService,
  ],
  exports: [AuthService, KeycloakService, ABHAService, JWTService],
})
export class AuthModule {}

