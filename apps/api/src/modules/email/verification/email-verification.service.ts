import * as crypto from 'crypto';

import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';
import { EmailService } from '../email.service';

@Injectable()
export class EmailVerificationService {
  // Configurable rate limit and attempt thresholds
  private readonly maxVerificationAttempts = parseInt(
    process.env.MAX_VERIFICATION_ATTEMPTS ?? '5',
    10,
  );
  private readonly codeTTL = parseInt(process.env.MAX_VERIFICATION_CODE_TTL_MINUTES ?? '15', 10);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  // Verifies the secure URL token string and transitions the user to an active onboarding session
  async verifyMagicLink(token: string): Promise<{
    email: string;
    registrationToken: string;
    status: 'NEW_USER' | 'PENDING_ONBOARDING' | 'PENDING_REGISTRATION' | 'EXISTING_USER';
  }> {
    // 1. Fetch the metadata directly via the unique secure token string
    const record = await this.prisma.verificationToken.findUnique({
      where: { token },
    });

    // Security Fallback: If token isn't found, it might be an invalid token or a brute-force guess attempt
    if (!record) {
      throw new BadRequestException('Invalid or expired verification link.');
    }

    // 2. Brute Force Protection Validation Checks
    if (record.attempts >= this.maxVerificationAttempts) {
      await this.prisma.verificationToken.delete({ where: { id: record.id } });
      throw new BadRequestException(
        'This verification link has been locked due to too many failed attempts. Please request a new link.',
      );
    }

    // 3. Expiry Validation Gate
    if (new Date() > record.expiresAt) {
      await this.prisma.verificationToken.delete({ where: { id: record.id } });
      throw new BadRequestException(
        'This verification link has expired. Please request a new one.',
      );
    }

    const user = await this.prisma.user.findUnique({
      where: { id: record.userId },
    });

    if (!user) {
      throw new BadRequestException('User record associated with this link no longer exists.');
    }

    // LOOKUP: Check if they actually have a local credential identity record
    const hasEmailIdentity = await this.prisma.identity.findFirst({
      where: {
        userId: user.id,
        provider: 'EMAIL_PASSWORD',
      },
    });

    // 🌲 Determine lifecycle status state matrix
    let status: 'NEW_USER' | 'PENDING_ONBOARDING' | 'PENDING_REGISTRATION' | 'EXISTING_USER' =
      'NEW_USER';

    if (hasEmailIdentity) {
      // 💡 TRACK A: Traditional credentials user
      if (user.onboardingCompleted) {
        status = 'EXISTING_USER';
      } else {
        status = 'PENDING_ONBOARDING';
      }
    } else {
      // 💡 TRACK B: No email identity exists yet
      if (user.registrationCompleted) {
        // 🚀 THIS IS YOU: They exist via Google, profile is already built!
        // They are coming through to strictly LINK their account with a password.
        status = 'PENDING_REGISTRATION';
      } else {
        // A completely fresh sign-up who has never completed registration or OAuth
        status = 'NEW_USER';
      }
    }

    // 💡 If it gets past these checks, the link is valid!
    const formattedEmail = record.email.trim().toLowerCase();
    const sessionExpiry = new Date(Date.now() + 30 * 60 * 1000); // 30-minute workspace onboarding window

    // Generate the unique secure registration voucher token
    const registrationToken = crypto.randomBytes(32).toString('hex');

    try {
      await this.prisma.$transaction(async (tx) => {
        // 1. Promote the actual user record to email_verified: true
        await tx.user.update({
          where: { id: record.userId },
          data: {
            emailVerified: true,
            emailVerifiedAt: new Date(),
          },
        });

        // LAZY-CREATE EMAIL IDENTITY: Link the local track if it's missing
        const existingEmailIdentity = await tx.identity.findFirst({
          where: {
            userId: record.userId,
            provider: 'EMAIL_PASSWORD',
          },
        });

        if (!existingEmailIdentity) {
          await tx.identity.create({
            data: {
              userId: record.userId,
              provider: 'EMAIL_PASSWORD',
              providerId: formattedEmail, // Storing email as the provider unique identifier
              providerEmail: formattedEmail, // Store the email for reference, even if it's redundant with providerId
            },
          });
        }

        // 2. Wipe out ANY existing registration sessions for this email address.
        // This clears out stale unique tokens completely and guarantees no constraint conflicts.
        await tx.emailVerificationSession.deleteMany({
          where: { email: formattedEmail },
        });

        // 3. Freshly create the verified onboarding session state.
        // Since step 2 guaranteed a clean slate, this will NEVER throw a unique constraint error on email.
        await tx.emailVerificationSession.create({
          data: {
            email: formattedEmail,
            verified: true,
            registrationToken: registrationToken,
            expiresAt: sessionExpiry,
          },
        });

        // 4. Prune the consumed verification token immediately so it can never be re-played
        await tx.verificationToken.delete({
          where: { id: record.id },
        });
      });

      // Return the secure temporary registration token to the controller layer
      return { email: formattedEmail, registrationToken, status };
    } catch {
      // If the token was valid but the database transaction choked due to a dead-lock or concurrency fail,
      // log an attempt against the token to protect the route from endless spamming.
      await this.prisma.verificationToken.update({
        where: { id: record.id },
        data: { attempts: { increment: 1 } },
      });

      throw new BadRequestException('Verification processing failed. Please try again.');
    }
  }

  async sendMagicLinkEmail(
    userId: string,
    email: string,
    purpose: 'SIGNUP' | 'LOGIN',
  ): Promise<void> {
    const formattedEmail = email.trim().toLowerCase();

    //  Production Rate-Limit Check: Max links per hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentLinksCount = await this.prisma.verificationToken.count({
      where: {
        email: formattedEmail,
        createdAt: { gte: oneHourAgo },
      },
    });

    if (recentLinksCount >= this.maxVerificationAttempts) {
      throw new BadRequestException('Too many verification requests. Please try again in an hour.');
    }

    // 1. Generate a 32-byte secure hex string token
    const magicToken = crypto.randomBytes(32).toString('hex');

    // 2. Set token lifespan (e.g., 30 minutes)
    const tokenLifespanMinutes = 30;
    const expiresAt = new Date(Date.now() + tokenLifespanMinutes * 60 * 1000);

    // 3. Atomically upsert the verification token linked to this user ID
    // This cleans up any old token if they click "resend" multiple times
    await this.prisma.verificationToken.upsert({
      where: { userId },
      update: {
        token: magicToken,
        expiresAt,
      },
      create: {
        userId,
        email: formattedEmail,
        token: magicToken,
        expiresAt,
      },
    });

    const frontendUrl =
      process.env.FRONTEND_VERIFY_URL ?? 'http://localhost:3000/signup/verification';
    const magicLinkUrl = `${frontendUrl}?token=${magicToken}`;

    // 5. Dispatch dynamic layouts depending on the flow purpose
    if (purpose === 'LOGIN') {
      await this.emailService.sendLoginLink(formattedEmail, magicLinkUrl);
    } else {
      await this.emailService.sendVerificationLink(formattedEmail, magicLinkUrl);
    }
  }

  // Helper method: if someone hits your validation with a bad token structure but you want to track attempts manually via an email fallback
  async registerFailedAttempt(email: string): Promise<void> {
    const formattedEmail = email.trim().toLowerCase();
    await this.prisma.verificationToken.updateMany({
      where: { email: formattedEmail },
      data: { attempts: { increment: 1 } },
    });
  }

  // Validates that the user has an active verified session for their email before allowing them to proceed with registration
  async validateActiveSessionOrThrow(registrationToken: string): Promise<{ email: string }> {
    const session = await this.prisma.emailVerificationSession.findFirst({
      where: { registrationToken },
    });
    const sessionExpireTime = session?.expiresAt.getTime() ?? 0;
    const currentServerTime = new Date().getTime();
    // If no session, or session isn't verified, or session is expired, block the registration flow
    if (!session || !session.verified || currentServerTime > sessionExpireTime) {
      throw new UnauthorizedException(
        'Email verification required or onboarding session has expired.',
      );
    }
    return { email: session.email };
  }

  async consumeSession(email: string): Promise<void> {
    await this.prisma.emailVerificationSession.deleteMany({
      where: { email: email.trim().toLowerCase() },
    });
  }

  /**
   * 💡 Test runner method that handles the database transaction,
   * link assembly, and hands it off to EmailService for dispatch.
   */
  async sendTestVerificationEmail(toEmail: string): Promise<{ registrationToken: string }> {
    const formattedEmail = toEmail.trim().toLowerCase();

    // 1. Generate token and TTL configuration bypassing hourly rate-limit counters
    const registrationToken = crypto.randomBytes(32).toString('hex');
    const codeTTL = this.codeTTL;

    try {
      // 2. Clear out old instances and save the test token atomically
      await this.prisma.$transaction([
        this.prisma.verificationToken.deleteMany({ where: { email: formattedEmail } }),
        this.prisma.verificationToken.create({
          data: {
            email: formattedEmail,
            token: registrationToken,
            attempts: 0,
            expiresAt: new Date(Date.now() + codeTTL * 60 * 1000),
            userId: `test-user-${registrationToken}`, // Link the token to a pseudo-user for testing
          },
        }),
      ]);

      const frontendUrl =
        process.env.FRONTEND_VERIFY_URL ?? 'http://localhost:3000/signup/verification';
      const verificationLink = `${frontendUrl}?token=${registrationToken}`;

      // 4. Dispatch via the base EmailService instance
      await this.emailService.sendVerificationLink(formattedEmail, verificationLink);
      return { registrationToken };
    } catch (error: unknown) {
      throw new InternalServerErrorException(
        `Failed to execute verification test pipeline inside verification service: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}
