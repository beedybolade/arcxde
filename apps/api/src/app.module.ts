/**
 * Root application module.
 *
 * Wiring order matters: global modules (config, logger, prisma) before feature
 * modules so DI resolves cleanly. The order is alphabetized within each tier
 * to keep diffs small as features are added.
 */
import { Module } from '@nestjs/common';
import { ClsModule } from 'nestjs-cls';

import { AppConfigModule } from './common/config/app-config.module.js';
import { AppLoggerModule } from './common/logger/app-logger.module.js';
import { HealthModule } from './modules/health/health.module.js';
import { OnboardingModule } from './modules/onboarding/onboarding.module.js';
import { OrganizationsModule } from './modules/organizations/organizations.module.js';
import { PrismaModule } from './modules/prisma/prisma.module.js';

@Module({
  imports: [
    // ---- Cross-cutting (global modules) ----
    AppConfigModule,
    AppLoggerModule,
    // AsyncLocalStorage-backed request context. Available to any service that
    // needs the requestId or current user without threading them through args.
    ClsModule.forRoot({
      global: true,
      middleware: { mount: false },
      // middleware: { mount: true,  setup: (cls, req: { id?: string }) => cls.set('requestId', req.id) },
    }),
    PrismaModule,

    // ---- Feature modules (one per bounded context) ----
    HealthModule,
    OnboardingModule,
    OrganizationsModule,
  ],
})
export class AppModule {}
