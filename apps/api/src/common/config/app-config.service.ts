/**
 * Typed configuration service.
 *
 * Inject this anywhere config is needed. Never read `process.env` directly in
 * application code — that bypasses Zod validation and creates "undefined sneaks
 * through everything" bugs.
 */
import { Injectable } from '@nestjs/common';

import type { Env } from './env.schema.js';

@Injectable()
export class AppConfigService {
  constructor(private readonly env: Env) {}

  // ---- Generic typed getter ----
  get<K extends keyof Env>(key: K): Env[K] {
    return this.env[key];
  }

  // ---- Convenience accessors for things used in many places ----
  get isProduction(): boolean {
    return this.env.NODE_ENV === 'production';
  }

  get isDevelopment(): boolean {
    return this.env.NODE_ENV === 'development';
  }

  get isTest(): boolean {
    return this.env.NODE_ENV === 'test';
  }

  get http(): { port: number; host: string; publicUrl: string; corsOrigins: string[] } {
    return {
      port: this.env.API_PORT,
      host: this.env.API_HOST,
      publicUrl: this.env.API_PUBLIC_URL,
      corsOrigins: this.env.CORS_ALLOWED_ORIGINS,
    };
  }

  get database(): { url: string } {
    return { url: this.env.DATABASE_URL };
  }

  get redis(): { url: string } {
    return { url: this.env.REDIS_URL };
  }

  get auth(): {
    accessSecret: string;
    refreshSecret: string;
    accessTtl: string;
    refreshTtl: string;
  } {
    return {
      accessSecret: this.env.JWT_ACCESS_SECRET,
      refreshSecret: this.env.JWT_REFRESH_SECRET,
      accessTtl: this.env.JWT_ACCESS_TTL,
      refreshTtl: this.env.JWT_REFRESH_TTL,
    };
  }

  get logging(): { level: Env['LOG_LEVEL']; pretty: boolean } {
    return { level: this.env.LOG_LEVEL, pretty: this.env.LOG_PRETTY };
  }

  get rateLimits(): { globalPerMin: number; authPerMin: number } {
    return {
      globalPerMin: this.env.RATE_LIMIT_GLOBAL_PER_MIN,
      authPerMin: this.env.RATE_LIMIT_AUTH_PER_MIN,
    };
  }

  get observability(): { otlpEndpoint?: string; serviceName: string; sentryDsn?: string } {
    const otlp = this.env.OTEL_EXPORTER_OTLP_ENDPOINT;
    const sentry = this.env.SENTRY_DSN;
    return {
      serviceName: this.env.OTEL_SERVICE_NAME,
      ...(otlp ? { otlpEndpoint: otlp } : {}),
      ...(sentry ? { sentryDsn: sentry } : {}),
    };
  }
}
