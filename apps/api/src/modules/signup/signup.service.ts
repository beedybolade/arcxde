import * as argon2 from 'argon2';

import { FinalizeRegistrationDto } from '@app/contracts';
import { BadRequestException, Injectable } from '@nestjs/common';

import type { NormalizedProfile } from '../auth/models/auth-registration.interface';
import { AuthService } from '../auth/auth.service.js';
import { IdentityResolver } from '../auth/identity/identity.resolver.js';
import { EmailVerificationService } from '../email/verification/email-verification.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class SignupService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly verificationService: EmailVerificationService,
    private readonly identityResolver: IdentityResolver,
    private readonly authService: AuthService,
  ) {}

  async initializeMagicLinkSignup(body: { email: string }) {
    const formattedEmail = body.email.trim().toLowerCase();

    // 1. Scan for an existing lazy-provisioned or complete user record
    const existingUser = await this.prisma.user.findUnique({
      where: { email: formattedEmail },
    });

    if (existingUser) {
      // Check if they have a local EMAIL identity record
      const hasEmailIdentity = await this.prisma.identity.findFirst({
        where: {
          userId: existingUser.id,
          provider: 'EMAIL_PASSWORD', // Adjust string to match your schema's enum/value
        },
      });

      // Flow A: User has completed their credentials -> Send a LOGIN magic link
      if (existingUser.registrationCompleted && hasEmailIdentity) {
        await this.verificationService.sendMagicLinkEmail(existingUser.id, formattedEmail, 'LOGIN');
      } else {
        // Flow C: User dropped out before creating a password -> Send a SIGNUP magic link
        // or They exist via other Auth methods but have NO email identity record yet, so we treat them as a SIGNUP flow to complete their registration.
        await this.verificationService.sendMagicLinkEmail(
          existingUser.id,
          formattedEmail,
          'SIGNUP',
        );
      }

      return { success: true };
    }

    // Flow D: Complete Stranger -> Lazy-provision the row immediately & send SIGNUP layout email
    const newUser = await this.prisma.user.create({
      data: {
        email: formattedEmail,
        emailVerified: false,
        registrationCompleted: false,
        onboardingCompleted: false,
      },
    });

    await this.verificationService.sendMagicLinkEmail(newUser.id, formattedEmail, 'SIGNUP');

    return { success: true };
  }

  // Password entry at last step after email verification, identity evaluation, and transient state validation
  async completeUserRegistration(body: FinalizeRegistrationDto) {
    const { token, password, firstName, lastName } = body;

    // 1. Strict Guard Barrier: Look up and validate the active session by its voucher token
    // This returns the verified email bound to this specific onboarding session
    const activeSession = await this.verificationService.validateActiveSessionOrThrow(token);
    const formattedEmail = activeSession.email;

    // 2. Map and resolve the identity footprint
    const normalizedProfile = this.mapSignupToNormalizedProfile(
      formattedEmail,
      firstName ?? '',
      lastName ?? '',
    );
    const identityResolution = await this.identityResolver.resolveIdentity(normalizedProfile);

    const isValidSessionState =
      identityResolution.type === 'EXISTING_USER_NO_IDENTITY' ||
      identityResolution.type === 'EXISTING_IDENTITY';
    // 3. Evaluate identity states using your resolver outputs
    if (!isValidSessionState) {
      throw new BadRequestException(
        'Registration session expired or user identity not found. Please start over.',
      );
    }

    // 💡 Then handle the password identity check we built earlier:
    if (identityResolution.type === 'EXISTING_IDENTITY') {
      const passwordIdentity = await this.prisma.identity.findFirst({
        where: {
          userId: identityResolution.userId,
          provider: 'EMAIL_PASSWORD',
        },
      });

      if (passwordIdentity?.passwordHash) {
        throw new BadRequestException('An account with this email address already exists.');
      }
    }

    // Hash the password cleanly using argon2
    const passwordHash = await argon2.hash(password);

    // 4. Execute Core Identity Write Transaction
    const updatedUser = await this.prisma.$transaction(async (tx) => {
      // A. Attach the email/password authentication identity to the existing user row
      // This handles the cross-linking perfectly if they started via OAuth first!
      await tx.identity.upsert({
        where: {
          // Assumes you have a compound unique constraint on userId and provider in schema.prisma:
          // @@unique([userId, provider])
          userId_provider: {
            userId: identityResolution.userId,
            provider: 'EMAIL_PASSWORD',
          },
        },
        update: {
          passwordHash,
          providerId: formattedEmail,
        },
        create: {
          userId: identityResolution.userId,
          provider: 'EMAIL_PASSWORD',
          providerId: formattedEmail,
          passwordHash,
        },
      });

      // B. Save concatenated profile fields and flip onboarding completion flags
      return tx.user.update({
        where: { id: identityResolution.userId },
        data: {
          fullName: normalizedProfile.fullName,
          registrationCompleted: true,
        },
        select: {
          id: true,
          email: true,
          fullName: true,
          createdAt: true,
        },
      });
    });

    // 5. Burn the temporary onboarding session token state immediately
    await this.verificationService.consumeSession(formattedEmail);

    // 6. Issue full secure authenticated session payload tokens
    const tokens = await this.authService.createAuthenticatedSession(updatedUser.id);

    return {
      user: updatedUser,
      tokens,
    };
  }

  /**
   * Helper mapping strategy to turn a credentials registration payload
   * into an object usable by the global identity layer context.
   */
  private mapSignupToNormalizedProfile(
    email: string,
    firstName: string,
    lastName: string,
  ): NormalizedProfile {
    return {
      provider: 'EMAIL_PASSWORD',
      providerId: email,
      email: email,
      emailVerified: true, // Successfully cleared the Magic Link validation step
      fullName: `${firstName.trim()} ${lastName.trim()}`,
    };
  }
}
