// src/modules/auth/auth.repository.ts
import { Injectable } from '@nestjs/common';
import { IdentityProvider, type User, type Identity, type Session } from '@prisma/client';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service.js'; // Adjust path based on mono setup

import {
  CreateIndividualInput,
  NormalizedProfile,
  SessionCreationData,
  UpdateUserFlagsInput,
  UpsertUserIdentityAndMembershipData,
  WorkspaceMatchResult,
} from './models/auth-registration.interface.js';

@Injectable()
export class AuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  // 1. Locate an exact Identity mapping link
  async findIdentityByProvider(
    provider: IdentityProvider,
    providerId: string,
  ): Promise<Identity | null> {
    return this.prisma.identity.findUnique({
      where: {
        provider_providerId: {
          provider,
          providerId,
        },
      },
    });
  }

  // 2. Locate a core global user by their email address
  async findUserByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }
  async findUserById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async updateUserFlags(id: string, flags: UpdateUserFlagsInput) {
    return this.prisma.user.update({
      where: { id },
      data: {
        // Mapping fields cleanly.
        // to email_verified, registration_completed, onboarding_completed
        ...(flags.emailVerified !== undefined && { emailVerified: flags.emailVerified }),
        ...(flags.registrationCompleted !== undefined && {
          registrationCompleted: flags.registrationCompleted,
        }),
        ...(flags.onboardingCompleted !== undefined && {
          onboardingCompleted: flags.onboardingCompleted,
        }),
        ...(flags.emailVerified === true && { emailVerifiedAt: new Date() }),
      },
    });
  }

  /**
   * Executes an atomic database transaction creating the root User row
   * along with their local password authentication credentials.
   */
  async createIndividualAccount(input: CreateIndividualInput) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Insert the primary user profile record
      const user = await tx.user.create({
        data: {
          email: input.email,
          fullName: `${input.firstName || ''} ${input.lastName || ''}`.trim() || null,
        },
      });

      // 2. Link their password identity to the newly created user ID
      // Adjust the table name ('identity' or 'credential') to match your schema file exactly
      await tx.identity.create({
        data: {
          userId: user.id,
          provider: 'EMAIL_PASSWORD', // Indicates standard email/password authentication
          providerId: input.email, // Often used as a unique identifier lookup hook
          providerEmail: input.email, // Store the email for reference, even if it's redundant with providerId
          passwordHash: input.passwordHash,
        },
      });

      return user;
    });
  }
  async upsertUserIdentityAndMembership(data: UpsertUserIdentityAndMembershipData): Promise<User> {
    // Execute the atomic isolation transaction block
    return this.prisma.$transaction(async (tx) => {
      // BRANCH A: User already exists -> Link the new social/OAuth identity to them
      if (data.userId) {
        await tx.identity.create({
          data: {
            userId: data.userId,
            provider: data.provider,
            providerId: data.providerId,
            providerEmail: data.email,
            ...(data.passwordHash ? { passwordHash: data.passwordHash } : {}),
          },
        });

        // Return the existing user profile
        return tx.user.findUniqueOrThrow({ where: { id: data.userId } });
      }

      // BRANCH B: Brand New User -> Create User + Identity + Membership atomatically
      const newUser = await tx.user.create({
        data: {
          email: data.email,
          fullName: data.fullName || null,
          avatarUrl: data.avatarUrl || null,
        },
      });

      await tx.identity.create({
        data: {
          userId: newUser.id,
          provider: data.provider,
          providerId: data.providerId,
          providerEmail: data.email,
          ...(data.passwordHash ? { passwordHash: data.passwordHash } : {}),
        },
      });

      if (data.organizationId) {
        await tx.membership.create({
          data: {
            userId: newUser.id,
            organizationId: data.organizationId,
            role: 'admin', // Default role assignment; adjust as necessary
          },
        });
      }

      // Return the fully formed user record back to the calling service layer
      return newUser;
    });
  }

  // 3. Complete atomic pipeline: Provision a brand new user account along with their initial verification identity link
  async createNewUserWithIdentity(profile: NormalizedProfile): Promise<User> {
    if (!profile.email) {
      throw new Error('Email is mandatory to execute primary user creation cascades.');
    }

    return this.prisma.user.create({
      data: {
        email: profile.email,
        fullName: profile.fullName,
        emailVerified: profile.emailVerified,
        identities: {
          create: {
            provider: profile.provider,
            providerId: profile.providerId,
            providerEmail: profile.email,
          },
        },
      },
    });
  }

  // 4. Attach an additional identification mechanism to an existing core User profile (Account Linking)
  async linkCredentialsIdentityToExistingUser(params: {
    userId: string;
    provider: 'EMAIL_PASSWORD';
    providerId: string;
    passwordHash: string | null;
    providerEmail: string;
  }): Promise<Identity> {
    return this.prisma.identity.create({
      data: {
        userId: params.userId,
        provider: params.provider,
        providerId: params.providerId,
        passwordHash: params.passwordHash,
        providerEmail: params.providerEmail,
      },
    });
  }

  // 5. Explicit email verification flag updates
  async updateUserEmailVerification(userId: string, isVerified: boolean): Promise<User> {
    return this.prisma.user.update({
      where: { id: userId },
      data: { emailVerified: isVerified },
    });
  }

  // 6. Cross-reference multi-domain routing tables to automatically intercept workspace associations
  async findOrganizationByDomain(domain: string): Promise<WorkspaceMatchResult | null> {
    // Explicitly querying through the unique domain registry mapping table per specification
    const domainRegistry = await this.prisma.organizationDomain.findUnique({
      where: { domain },
      select: { organizationId: true },
    });

    return domainRegistry;
  }

  // 7. Auto-join user to an organization profile registry
  async createMembership(userId: string, organizationId: string): Promise<void> {
    await this.prisma.membership.create({
      data: {
        userId,
        organizationId,
        role: 'admin', // Default access tier
      },
    });
  }

  // 8. Session Persistence Layer tracking (hashed token operations)
  async createSession(data: SessionCreationData) {
    return this.prisma.session.create({
      data: {
        userId: data.userId,
        tokenHash: data.tokenHash,
        expiresAt: data.expiresAt,
      },
    });
  }

  async findSessionByHash(tokenHash: string): Promise<(Session & { user: User }) | null> {
    return this.prisma.session.findUnique({
      where: { tokenHash },
      include: { user: true },
    });
  }
  /**
   * Updates an existing session's token hash after token generation
   * @param sessionId The database-generated 'ses_...' ID
   * @param tokenHash The cryptographic hash of the new refresh token
   */
  async updateSessionHash(sessionId: string, tokenHash: string): Promise<void> {
    await this.prisma.session.update({
      where: {
        id: sessionId,
      },
      data: {
        tokenHash: tokenHash,
      },
    });
  }

  async deleteSession(sessionId: string): Promise<void> {
    console.log('🗑️ [Logout Debug] Target Session ID from Token:', sessionId);
    await this.prisma.session.deleteMany({
      where: {
        id: sessionId,
      },
    });
  }

  /**
   * Cleans up all dead/expired sessions for a specific user in one database command
   */
  async deleteExpiredSessions(userId: string): Promise<Prisma.BatchPayload> {
    return this.prisma.session.deleteMany({
      where: {
        userId: userId,
        expiresAt: {
          lt: new Date(), // lt = Less Than the exact current moment
        },
      },
    });
  }

  // Password Reset Methods
  async findEmailPasswordIdentity(userId: string): Promise<Identity | null> {
    return this.prisma.identity.findFirst({
      where: {
        userId,
        provider: 'EMAIL_PASSWORD',
      },
    });
  }

  async findIdentityByResetToken(token: string): Promise<Identity | null> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (this.prisma.identity as any).findUnique({
      where: { reset_token: token },
    });
  }

  async updateIdentityResetToken(
    identityId: string,
    token: string,
    expiry: Date,
  ): Promise<Identity> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (this.prisma.identity as any).update({
      where: { id: identityId },
      data: {
        reset_token: token,
        reset_token_expiry: expiry,
      },
    });
  }

  async updateIdentityPassword(identityId: string, hashedPassword: string): Promise<Identity> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (this.prisma.identity as any).update({
      where: { id: identityId },
      data: {
        passwordHash: hashedPassword,
        reset_token: null,
        reset_token_expiry: null,
      },
    });
  }
}
