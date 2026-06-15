// apps/api/src/modules/shared/jwt-engine.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const secret = configService.get<string>('JWT_ACCESS_SECRET');
        if (!secret) {
          throw new Error('CRITICAL CONFIGURATION ERROR: JWT_ACCESS_SECRET is not defined.');
        }
        return {
          secret,
          signOptions: {
            expiresIn: (configService.get<string>('JWT_ACCESS_TTL') ?? '15m') as any,
          },
        };
      },
    }),
  ],
  exports: [JwtModule], // 🚀 Export it out
})
export class JwtEngineModule {}
