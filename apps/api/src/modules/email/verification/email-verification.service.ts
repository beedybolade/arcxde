import * as crypto from 'crypto';
import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt'; // Added to issue access tokens on magic login success
import { PrismaService } from '../../prisma/prisma.service';
import { EmailService } from '../email.service';

type UserLifecycleStatus =
  | 'NEW_USER'
  | 'PENDING_ONBOARDING'
  | 'PENDING_REGISTRATION'
  | 'EXISTING_USER';

interface VerifyMagicLinkResult {
  email: string;
  registrationToken: string;
  status: UserLifecycleStatus;
  accessToken?: string; // Included to log returning users in seamlessly
  user?: { id: string; email: string };
}

@Injectable()
export class EmailVerificationService {
  private readonly maxVerificationAttempts = parseInt(
    process.env.MAX_VERIFICATION_ATTEMPTS ?? '5',
    10,
  );
  private readonly codeTTL = parseInt(process.env.MAX_VERIFICATION_CODE_TTL_MINUTES ?? '15', 10);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Orchestrates the validation, status resolution, and atomic database tracking
   * when a user clicks their email magic link.
   */
  async verifyMagicLink(token: string): Promise<VerifyMagicLinkResult> {
    const record = await this.validateLinkTokenOrThrow(token);

    const user = await this.prisma.user.findUnique({
      where: { id: record.userId },
    });

    if (!user) {
      throw new BadRequestException('User record associated with this link no longer exists.');
    }

    const status = await this.determineUserStatus(user);
    const formattedEmail = record.email.trim().toLowerCase();
    const registrationToken = crypto.randomBytes(32).toString('hex');

    const shouldCreateSession = status === 'EXISTING_USER';

    try {
      // Execute the transaction and retrieve the secure raw token string if generated
      const { rawSessionToken } = await this.executeVerificationTransaction({
        verificationRecordId: record.id,
        userId: user.id,
        email: formattedEmail,
        registrationToken,
        shouldCreateSession,
      });

      let postAuthPayload = {};
      if (status === 'EXISTING_USER' && rawSessionToken) {
        // 🔒 The record safely exists in the DB under a SHA-256 footprint.
        // Mint the JWT token now. You can embed the raw token or its hash depending on your strategy setup:
        const accessToken = this.jwtService.sign({
          sub: user.id,
          sid: this.hashToken(rawSessionToken), // Or pass the raw string if that's what your guard uses to extract and re-hash!
        });

        postAuthPayload = {
          accessToken,
          user: { id: user.id, email: user.email },
        };
      }

      return {
        email: formattedEmail,
        registrationToken,
        status,
        ...postAuthPayload,
      };
    } catch (error) {
      console.error('[VERIFICATION_FAILURE] Real underlying error:', error);
      await this.prisma.verificationToken.update({
        where: { id: record.id },
        data: { attempts: { increment: 1 } },
      });

      throw new BadRequestException('Verification processing failed. Please try again.');
    }
  }

  /**
   * Dispatches the initial magic link verification email with rate limiting
   */
  async sendMagicLinkEmail(
    userId: string,
    email: string,
    purpose: 'SIGNUP' | 'LOGIN',
  ): Promise<void> {
    const formattedEmail = email.trim().toLowerCase();

    // Verify rolling hourly rate-limit bounds
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

    const magicToken = crypto.randomBytes(32).toString('hex');
    const tokenLifespanMinutes = 30;
    const expiresAt = new Date(Date.now() + tokenLifespanMinutes * 60 * 1000);

    await this.prisma.verificationToken.upsert({
      where: { userId },
      update: { token: magicToken, expiresAt },
      create: { userId, email: formattedEmail, token: magicToken, expiresAt },
    });

    const frontendUrl =
      process.env.FRONTEND_VERIFY_URL ?? 'http://localhost:3000/signup/verification';
    const magicLinkUrl = `${frontendUrl}?token=${magicToken}`;

    if (purpose === 'LOGIN') {
      await this.emailService.sendLoginLink(formattedEmail, magicLinkUrl);
    } else {
      await this.emailService.sendVerificationLink(formattedEmail, magicLinkUrl);
    }
  }

  /**
   * Increments attempt counts if verification crashes manually out of bounds
   */
  async registerFailedAttempt(email: string): Promise<void> {
    const formattedEmail = email.trim().toLowerCase();
    await this.prisma.verificationToken.updateMany({
      where: { email: formattedEmail },
      data: { attempts: { increment: 1 } },
    });
  }

  /**
   * Confirms the onboarding registration voucher exists and is within its validation timeframe
   */
  async validateActiveSessionOrThrow(registrationToken: string): Promise<{ email: string }> {
    const session = await this.prisma.emailVerificationSession.findFirst({
      where: { registrationToken },
    });

    const sessionExpireTime = session?.expiresAt.getTime() ?? 0;
    const currentServerTime = new Date().getTime();

    if (!session || !session.verified || currentServerTime > sessionExpireTime) {
      throw new UnauthorizedException(
        'Email verification required or onboarding session has expired.',
      );
    }
    return { email: session.email };
  }

  /**
   * Clears old user validation sessions upon final persistence creation
   */
  async consumeSession(email: string): Promise<void> {
    await this.prisma.emailVerificationSession.deleteMany({
      where: { email: email.trim().toLowerCase() },
    });
  }

  /**
   * Bypasses strict tracking metrics to pipe automated verification tests
   */
  async sendTestVerificationEmail(toEmail: string): Promise<{ registrationToken: string }> {
    const formattedEmail = toEmail.trim().toLowerCase();
    const registrationToken = crypto.randomBytes(32).toString('hex');
    const codeTTL = this.codeTTL;

    try {
      await this.prisma.$transaction([
        this.prisma.verificationToken.deleteMany({ where: { email: formattedEmail } }),
        this.prisma.verificationToken.create({
          data: {
            email: formattedEmail,
            token: registrationToken,
            attempts: 0,
            expiresAt: new Date(Date.now() + codeTTL * 60 * 1000),
            userId: `test-user-${registrationToken}`,
          },
        }),
      ]);

      const frontendUrl =
        process.env.FRONTEND_VERIFY_URL ?? 'http://localhost:3000/signup/verification';
      const verificationLink = `${frontendUrl}?token=${registrationToken}`;

      await this.emailService.sendVerificationLink(formattedEmail, verificationLink);
      return { registrationToken };
    } catch (error: unknown) {
      throw new InternalServerErrorException(
        `Failed to execute verification test pipeline inside verification service: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  // -------------------------------------------------------------------------
  // PRIVATE CONTEXT SOLVER ISOLATED HELPERS
  // -------------------------------------------------------------------------

  /**
   * Extracts token record metadata and handles security guard conditions (abuse tracking/lifespan)
   */
  private async validateLinkTokenOrThrow(token: string) {
    const record = await this.prisma.verificationToken.findUnique({
      where: { token },
    });

    if (!record) {
      throw new BadRequestException('Invalid or expired verification link.');
    }

    if (record.attempts >= this.maxVerificationAttempts) {
      await this.prisma.verificationToken.delete({ where: { id: record.id } });
      throw new BadRequestException(
        'This verification link has been locked due to too many failed attempts. Please request a new link.',
      );
    }

    if (new Date() > record.expiresAt) {
      await this.prisma.verificationToken.delete({ where: { id: record.id } });
      throw new BadRequestException(
        'This verification link has expired. Please request a new one.',
      );
    }

    return record;
  }

  /**
   * Inspects credentials maps to place the routing target into the app lifecycle
   */
  private async determineUserStatus(user: {
    id: string;
    onboardingCompleted: boolean;
    registrationCompleted: boolean;
  }): Promise<UserLifecycleStatus> {
    const hasEmailIdentity = await this.prisma.identity.findFirst({
      where: {
        userId: user.id,
        provider: 'EMAIL_PASSWORD',
      },
    });

    if (hasEmailIdentity) {
      return user.onboardingCompleted ? 'EXISTING_USER' : 'PENDING_ONBOARDING';
    }

    return user.registrationCompleted ? 'PENDING_REGISTRATION' : 'NEW_USER';
  }

  /**
   * Executes atomic database record manipulations inside an isolated execution container
   */
  private async executeVerificationTransaction(params: {
    verificationRecordId: string;
    userId: string;
    email: string;
    registrationToken: string;
    shouldCreateSession: boolean; //  Pass a boolean flag instead of a pre-computed ID string
  }): Promise<{ rawSessionToken: string | null }> {
    const sessionExpiry = new Date(Date.now() + 30 * 60 * 1000); // 30-minute window
    let rawSessionToken: string | null = null;

    await this.prisma.$transaction(async (tx) => {
      // 1. Mark user verification metrics
      await tx.user.update({
        where: { id: params.userId },
        data: { emailVerified: true, emailVerifiedAt: new Date() },
      });

      // 2. Handle missing identity tracking entries (lazy-create path)
      const existingIdentity = await tx.identity.findFirst({
        where: { userId: params.userId, provider: 'EMAIL_PASSWORD' },
      });

      if (!existingIdentity) {
        await tx.identity.create({
          data: {
            userId: params.userId,
            provider: 'EMAIL_PASSWORD',
            providerId: params.email,
            providerEmail: params.email,
          },
        });
      }

      // 3. Reset temporary onboarding registration tokens
      await tx.emailVerificationSession.deleteMany({
        where: { email: params.email },
      });

      await tx.emailVerificationSession.create({
        data: {
          email: params.email,
          verified: true,
          registrationToken: params.registrationToken,
          expiresAt: sessionExpiry,
        },
      });

      // 4. GENERATE AND PERSIST TRUE AUTH SESSION IF EXISTING USER
      if (params.shouldCreateSession) {
        // Generate a cryptographically secure raw token string
        rawSessionToken = crypto.randomBytes(32).toString('hex');
        const hashed = this.hashToken(rawSessionToken);

        await tx.session.create({
          data: {
            tokenHash: hashed,
            userId: params.userId,
            expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // Valid for 7 days
          },
        });
      }

      // 5. Consume verification token to prevent reuse loops
      await tx.verificationToken.delete({
        where: { id: params.verificationRecordId },
      });
    });

    // Return the unhashed raw token back up so it can be passed to the JWT or response
    return { rawSessionToken };
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }
}
