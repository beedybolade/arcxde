// src/modules/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';

import { EmailModule } from '../email/email.module.js';

import { GoogleAdapter } from './adapters/google.adapter.js';
import { AuthController } from './auth.controller.js';
import { AuthRepository } from './auth.repository.js';
import { AuthService } from './auth.service.js';
import { IdentityResolver } from './identity/identity.resolver.js';
import { JwtStrategy } from './strategies/jwt.strategy.js';
import { JwtEngineModule } from '../shared/jwt-engine.module.js';

@Module({
  imports: [PassportModule, EmailModule, JwtEngineModule],
  controllers: [AuthController],
  providers: [AuthService, AuthRepository, GoogleAdapter, JwtStrategy, IdentityResolver],
  exports: [AuthService, IdentityResolver, JwtEngineModule], // JwtEngineModule re-exports JwtModule for downstream modules
})
export class AuthModule {}
