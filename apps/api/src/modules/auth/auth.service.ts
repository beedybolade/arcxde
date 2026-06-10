import * as crypto from 'crypto';
import * as argon2 from 'argon2';

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Prisma } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service.js';
import type { NormalizedProfile } from './models/auth-registration.interface.js';
import { AuthRepository } from './auth.repository.js';
import { IdentityResolver } from './identity/identity.resolver.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly identityResolver: IdentityResolver,
    private readonly jwtService: JwtService,
  ) {}

  async registerOrLoginWithProvider(profile: NormalizedProfile) {
    let user = null;
    const identityResult = await this.resolveAccount(profile);

    if (identityResult.isNewUser) {
      await this.authRepository.updateUserFlags(identityResult.userId, {
        emailVerified: true,
        registrationCompleted: true,
        onboardingCompleted: false,
      });
    } else {
      const existingUser = await this.authRepository.findUserById(identityResult.userId);

      if (existingUser && (!existingUser.emailVerified || !existingUser.registrationCompleted)) {
        await this.authRepository.updateUserFlags(identityResult.userId, {
          emailVerified: true,
          registrationCompleted: true,
        });
      }
    }

    const tokens = await this.createAuthenticatedSession(identityResult.userId);

    if (!identityResult.isNewUser && profile.email) {
      user = await this.authRepository.findUserByEmail(profile.email);
    }

    return {
      tokens,
      isNewUser: identityResult.isNewUser,
      user,
    };
  }

  /**
   * Core orchestrator method to resolve an incoming OAuth profile to a user account,
   * handling edge cases around identity linking, new user creation, and organization mapping.
   */
  private async resolveAccount(
    profile: NormalizedProfile,
  ): Promise<{ userId: string; isNewUser: boolean }> {
    // 1. Evaluate the incoming footprint using our pure read-only decision engine
    const resolution = await this.identityResolver.resolveIdentity(profile);

    // 2. Fast-Path: Returning user with an exact identity match
    if (resolution.type === 'EXISTING_IDENTITY') {
      if (profile.emailVerified) {
        this.authRepository.updateUserEmailVerification(resolution.userId, true).catch(() => {
          /* background telemetry */
        });
      }
      return {
        userId: resolution.userId,
        isNewUser: false,
      };
    }

    let matchedOrgId: string | null = null;

    // 3. Domain Check: Only scan for corporate infrastructure auto-joins if this is a brand new account
    if (resolution.type === 'NEW_USER' && resolution.domain) {
      const match = await this.authRepository.findOrganizationByDomain(resolution.domain);
      matchedOrgId = match?.organizationId ?? null;
    }

    // 4. Atomic Execution: Map the resolution data structures directly down to your database transaction layer
    const targetUser = await this.authRepository.upsertUserIdentityAndMembership({
      userId: resolution.type === 'EXISTING_USER_NO_IDENTITY' ? resolution.userId : null, // Passing an ID triggers an Identity Link; null triggers User Creation
      email: resolution.email,
      fullName: profile.fullName ?? null,
      avatarUrl: profile.avatarUrl ?? null,
      provider: profile.provider,
      providerId: profile.providerId,
      organizationId: matchedOrgId,
    });

    return {
      userId: targetUser.id,
      isNewUser: resolution.type === 'NEW_USER',
    };
  }

  public async createAuthenticatedSession(
    userId: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    await this.authRepository.deleteExpiredSessions(userId);
    const temporarySession = await this.authRepository.createSession({
      userId,
      tokenHash: 'TEMP_HOLDING_PREROTATION',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    const sessionId = temporarySession.id;

    const tokens = await this.generateSessionTokens(userId, sessionId);
    const tokenHash = this.hashToken(tokens.refreshToken);

    await this.authRepository.updateSessionHash(sessionId, tokenHash);

    return tokens;
  }

  async createAuthenticatedSessionWithTx(
    userId: string,
    dbClient: Prisma.TransactionClient | PrismaService,
  ) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { sub: userId },
        {
          expiresIn: '15m',
          secret: process.env.JWT_ACCESS_SECRET ?? 'fallback_development_secret_access_key',
        },
      ),
      this.jwtService.signAsync(
        { sub: userId },
        {
          expiresIn: '7d',
          secret: process.env.JWT_REFRESH_SECRET ?? 'fallback_development_secret_refresh_key',
        },
      ),
    ]);

    await dbClient.session.create({
      data: {
        userId,
        tokenHash: refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  async refreshSession(rawRefreshToken: string) {
    const currentHash = this.hashToken(rawRefreshToken);
    const session = await this.authRepository.findSessionByHash(currentHash);

    if (!session || session.expiresAt < new Date()) {
      if (session) {
        await this.authRepository.deleteSession(session.id);
      }
      throw new UnauthorizedException('Session has expired or is invalid.');
    }

    await this.authRepository.deleteSession(session.id);

    const newTokens = await this.generateSessionTokens(session.userId, session.id);
    const newHash = this.hashToken(newTokens.refreshToken);

    await this.authRepository.createSession({
      userId: session.userId,
      tokenHash: newHash,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    return newTokens;
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  private async generateSessionTokens(userId: string, sessionId: string) {
    const accessSecret = process.env.JWT_ACCESS_SECRET;
    const refreshSecret = process.env.JWT_REFRESH_SECRET;

    const accessSecretExpiresIn = (process.env.JWT_ACCESS_TTL ?? '15m') as never;
    const refreshSecretExpiresIn = (process.env.JWT_REFRESH_TTL ?? '7d') as never;

    if (!accessSecret || !refreshSecret) {
      throw new Error(
        'Authentication configuration error: Cryptographic environment signatures are missing.',
      );
    }

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { sub: userId, sid: sessionId },
        {
          secret: accessSecret, // Now strictly guaranteed to be a string
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
          expiresIn: accessSecretExpiresIn as any,
        },
      ),
      this.jwtService.signAsync(
        { sub: userId },
        {
          secret: refreshSecret, // Now strictly guaranteed to be a string
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
          expiresIn: refreshSecretExpiresIn as any,
        },
      ),
    ]);

    return { accessToken, refreshToken };
  }

  // 5. Session Termination Logic for Logout and Token Revocation
  async clearSession(sessionId: string): Promise<void> {
    await this.authRepository.deleteSession(sessionId);
  }

  async generatePasswordResetToken(email: string): Promise<string | null> {
    const user = await this.authRepository.findUserByEmail(email);
    if (!user) {
      return null;
    }

    const identity = await this.authRepository.findEmailPasswordIdentity(user.id);
    if (!identity) {
      return null;
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 15 * 60 * 1000);

    await this.authRepository.updateIdentityResetToken(identity.id, token, expiry);
    return token;
  }

  async resetPassword(token: string, newPassword: string): Promise<boolean> {
    const identity = await this.authRepository.findIdentityByResetToken(token);
    if (!identity) {
      return false;
    }

    if (!identity.resetTokenExpiry || identity.resetTokenExpiry < new Date()) {
      return false;
    }

    const hashedPassword = await argon2.hash(newPassword);
    await this.authRepository.updateIdentityPassword(identity.id, hashedPassword);
    return true;
  }
}
