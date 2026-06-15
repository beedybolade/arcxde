// apps/api/src/modules/email/email.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { EmailService } from './email.service';
import { EmailVerificationService } from './verification/email-verification.service';
import { JwtEngineModule } from '../shared/jwt-engine.module';

@Module({
  imports: [ConfigModule, JwtEngineModule], // JwtModule provides JwtService for EmailVerificationService
  providers: [EmailService, EmailVerificationService],
  exports: [EmailService, EmailVerificationService], // 🔑 Exporting it allows other modules to use this service
})
export class EmailModule {}
