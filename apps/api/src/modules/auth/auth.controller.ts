/**
 * AuthController.
 *
 * Thin HTTP layer:
 * - Validates inputs with @ZodBody / @ZodQuery / @ZodParam (single source of
 *   truth: @app/contracts).
 * - Calls the service. Does NOT contain business logic.
 * - Lets DomainError propagate; the global HttpExceptionFilter takes care
 *   of mapping to the envelope.
 *
 * Response shapes intentionally match the contract envelopes in
 * docs/conventions/api-design.md.
 */
import type { FastifyReply, FastifyRequest } from 'fastify';

import {
  testEmailSchema,
  tokenRefreshSchema,
  type TestEmailSchema,
  type TokenRefreshBody,
} from '@app/contracts';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';

import { ApiZodBody } from '../../common/swagger/zod-swagger.decorator.js';
import { ZodBody } from '../../common/validation/zod.decorators.js';
import { EmailService } from '../email/email.service.js';
import { EmailVerificationService } from '../email/verification/email-verification.service.js';
import { AuthService } from './auth.service.js';
import { ForgotPasswordDto } from './dto/forgot-password.dto.js';
import { ResetPasswordDto } from './dto/reset-password.dto.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import type { NormalizedProfile } from './models/auth-registration.interface.js';
import { JwtService } from '@nestjs/jwt';

interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

@ApiTags('Auth')
@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly emailVerificationService: EmailVerificationService,
    private readonly emailService: EmailService,
    private readonly jwtService: JwtService,
  ) {}

  // --------------- GOOGLE OAUTH FLOWS --------------- //

  // Endpoint to trigger Google OAuth flow; Passport strategy handles the rest
  @Get('google')
  @UseGuards(AuthGuard('google'))
  @ApiResponse({ status: 200, description: 'Initiates Google OAuth flow.' })
  async googleAuth(@Req() _req: FastifyRequest): Promise<void> {
    // Triggers the initial OAuth redirect handshake handled by Passport Google Strategy
  }

  // Callback endpoint that Google redirects to after user consents; Passport strategy processes the response and populates req.user
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async googleAuthRedirect(
    @Req() req: FastifyRequest & { user?: unknown },
    @Res() res: FastifyReply,
  ): Promise<void> {
    try {
      // req.user is populated by Passport safely regardless of the underlying driver
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      const profile = req.user as NormalizedProfile;
      const { tokens, isNewUser, user } =
        await this.authService.registerOrLoginWithProvider(profile);

      // BAKE THE REFRESH TOKEN INTO A HIGH-SECURITY COOKIE
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      res.cookie('refresh_token', tokens.refreshToken, {
        httpOnly: true, // Prevents JavaScript/XSS extraction
        secure: process.env.NODE_ENV === 'production', // Only sent over HTTPS in production
        sameSite: 'strict', // Mitigates CSRF attacks
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 Days matching DB session window
        path: '/api/v1/auth/refresh', // Sent only to the token rotation route
      });

      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      res.cookie('access_token', tokens.accessToken, {
        httpOnly: false, // Set to false IF your client-side React code needs to read it directly, or true if only middleware/API needs it
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 15 * 60 * 1000, // 15 Minutes matching your access token TTL
        path: '/', // Crucial: Must be root path so Next.js middleware can read it on any route
      });

      const baseUrl =
        isNewUser || !user?.onboardingCompleted
          ? process.env.FRONTEND_ONBOARDING_URL
          : process.env.FRONTEND_DASHBOARD_URL;

      // Ensure fallback if environment variables lack trailing slashes
      const destinationUrl = baseUrl || 'http://localhost:3000/dashboard';
      //Redirect the user to the appropriate frontend URL with their session tokens in query params; frontend will handle storing tokens securely and redirecting to the right place
      // Will direct to dashboard if existing user, or onboarding flow if new user, Tokens are included in query params for the frontend to capture and store securely (e.g. HttpOnly cookies or secure storage).
      res.redirect(destinationUrl, 302);
      return;
    } catch (error: unknown) {
      // Direct print to screen if something else breaks inside the service loop
      const message = error instanceof Error ? error.message : String(error);
      res.status(500).send({
        error: 'Redirect Loop Exception',
        message,
      });
      return;
    }
  }

  // --------------- SESSION LIFECYCLE MANAGEMENT --------------- //
  @Post('logout')
  @UseGuards(JwtAuthGuard) // Must be logged in to log out
  @ApiBearerAuth() // Indicates this endpoint requires a bearer token for Swagger documentation
  @ApiResponse({ status: 200, description: 'Session successfully revoked.' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token.' })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async logout(
    @Req() req: FastifyRequest & { user?: unknown },
    @Res() res: FastifyReply,
  ): Promise<void> {
    const accessToken = req.cookies.access_token;

    try {
      if (accessToken) {
        // Decode the access token to capture the session ID (sid)
        // If you don't have jwtService injected, you can use standard jwt.decode(accessToken)
        const decoded: { sid?: string } = this.jwtService.decode(accessToken);

        if (decoded?.sid) {
          // Route it to a service function that handles the session table deletion
          await this.authService.clearSessionBySessionID(decoded.sid);
        }
      } else {
        console.warn('[AuthController] No access token found in cookies.');
      }

      const isProd = process.env.NODE_ENV === 'production';

      // Clear both cookies via headers
      res.clearCookie('refresh_token', {
        httpOnly: true,
        secure: isProd,
        sameSite: 'strict',
        path: '/api/v1/auth/refresh',
      });

      res.clearCookie('access_token', {
        httpOnly: false,
        secure: isProd,
        sameSite: 'lax',
        path: '/',
      });

      res.status(200).send({ success: true });
    } catch (error) {
      console.error('[AuthController] Logout exception:', error);
      res.status(500).send({ error: 'Logout failed' });
    }
  }

  // Endpoint for clients to rotate their session refresh tokens
  @Post('refresh')
  @HttpCode(200)
  @ApiZodBody(tokenRefreshSchema, 'Rotates session refresh token(s).') //  100% Automated & In Sync
  async refreshSession(
    @ZodBody(tokenRefreshSchema) body: TokenRefreshBody,
  ): Promise<{ data: TokenResponse }> {
    return { data: await this.authService.refreshSession(body.refreshToken) };
  }

  @Post('test-verification-email')
  @ApiZodBody(testEmailSchema, 'Sends a test verification email.')
  async testEmailVerification(
    @ZodBody(testEmailSchema) body: TestEmailSchema,
  ): Promise<{ success: boolean; message: string; registrationToken: string }> {
    // body is fully validated, stripped of unknown properties, and type-safe!
    const { email } = body;

    const result = await this.emailVerificationService.sendTestVerificationEmail(email);

    return {
      success: true,
      message: `A test verification email was successfully sent to ${email}`,
      registrationToken: result.registrationToken,
    };
  }

  // --------------- PASSWORD RESET FLOW --------------- //

  @Post('forgot-password')
  @HttpCode(200)
  @ApiResponse({ status: 200, description: 'Password reset email sent if account exists.' })
  async forgotPassword(@Body() body: ForgotPasswordDto): Promise<{ message: string }> {
    const token = await this.authService.generatePasswordResetToken(body.email);
    if (token) {
      await this.emailService.sendPasswordResetEmail(body.email, token).catch(() => {
        // Log but don't fail the request
      });
    }
    // Always return success message to avoid email enumeration
    return {
      message: 'If an account with that email exists, we have sent a password reset link.',
    };
  }

  @Post('reset-password')
  @HttpCode(200)
  @ApiResponse({ status: 200, description: 'Password successfully reset.' })
  @ApiResponse({ status: 401, description: 'Invalid or expired token.' })
  async resetPassword(@Body() body: ResetPasswordDto): Promise<{ message: string }> {
    const success = await this.authService.resetPassword(body.token, body.newPassword);
    if (!success) {
      throw new UnauthorizedException('Invalid or expired reset token');
    }
    return {
      message:
        'Your password has been successfully updated. You can now log in with your new password.',
    };
  }

  @Get('me')
  getMe(@Req() req: FastifyRequest) {
    const accessToken = req.cookies.access_token;

    if (!accessToken) {
      throw new UnauthorizedException('No session cookie present');
    }

    // Decode the token using your injected JwtService
    const decoded: { sub: string } = this.jwtService.decode(accessToken);

    // 'sub' contains your user ID string (e.g. usr_f22db73a...)
    return {
      userId: decoded.sub,
    };
  }
}
