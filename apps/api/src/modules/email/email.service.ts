// apps/api/src/modules/email/email.service.ts
import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private readonly resend: Resend;
  private readonly fromAddress: string;
  private readonly logger = new Logger(EmailService.name);

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    this.fromAddress =
      this.configService.get<string>('EMAIL_FROM_ADDRESS') || 'no-reply@arcxde.com';

    if (!apiKey) {
      this.logger.warn('⚠️ RESEND_API_KEY is missing. Inbound verification emails will fail.');
    }

    this.resend = new Resend(apiKey);
  }

  /**
   * Dispatches a verification email containing a unique link to the specified recipient.
   * The link is designed to be time-sensitive and single-use, ensuring secure account verification.
   *
   */
  async sendVerificationLink(to: string, url: string): Promise<void> {
    const subject = `Verify your email address`;

    const htmlContent = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 24px; max-width: 480px; margin: 0 auto; background-color: #ffffff; border: 1px solid #f0f0f0; border-radius: 8px;">
        <h2 style="color: #1a1a1a; font-size: 20px; font-weight: 600; margin-bottom: 16px;">Verify your email address</h2>
        <p style="color: #666666; font-size: 14px; line-height: 24px; margin-bottom: 24px;">
          Thanks for signing up! Click the verification button below to safely verify your account and continue your registration. This link will expire in 15 minutes.
        </p>
        <div style="text-align: center; margin-bottom: 24px;">
          <a href="${url}" target="_blank" style="display: inline-block; background-color: #09090b; color: #ffffff; font-size: 15px; font-weight: 500; text-decoration: none; padding: 12px 32px; border-radius: 6px; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
            Verify Email
          </a>
        </div>
        <p style="color: #666666; font-size: 13px; line-height: 20px; margin-bottom: 24px; word-break: break-all;">
          If the button above doesn't work, copy and paste this URL into your browser:<br />
          <a href="${url}" style="color: #2563eb; text-decoration: underline;">${url}</a>
        </p>
        <p style="color: #9ca3af; font-size: 12px; line-height: 20px; margin-top: 32px; border-top: 1px solid #e4e4e7; padding-top: 16px;">
          If you did not request this email, you can safely ignore it.
        </p>
      </div>
    `;

    try {
      const { data, error } = await this.resend.emails.send({
        from: this.fromAddress,
        to: [to],
        subject,
        html: htmlContent,
      });

      if (error) {
        this.logger.error(`Failed to send verification email to ${to}: ${error.message}`);
        throw new InternalServerErrorException('Email delivery engine failed.');
      }

      this.logger.log(`🎉 Verification link successfully dispatched to ${to} (ID: ${data?.id})`);
    } catch (err) {
      this.logger.error(`Unexpected error during email transmission to ${to}`, err);
      throw new InternalServerErrorException('Could not process authentication mailer pipeline.');
    }
  }
  /**
   * Dispatches a secure login magic link to an existing user.
   * The link is time-sensitive and single-use to authenticate the session safely.
   */
  async sendLoginLink(to: string, url: string): Promise<void> {
    const subject = `Log in to your account`;

    const htmlContent = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 24px; max-width: 480px; margin: 0 auto; background-color: #ffffff; border: 1px solid #f0f0f0; border-radius: 8px;">
        <h2 style="color: #1a1a1a; font-size: 20px; font-weight: 600; margin-bottom: 16px;">Log in to your account</h2>
        <p style="color: #666666; font-size: 14px; line-height: 24px; margin-bottom: 24px;">
          Welcome back! Click the secure button below to log in to your dashboard instantly. For security reasons, this login link will expire in 30 minutes.
        </p>
        <div style="text-align: center; margin-bottom: 24px;">
          <a href="${url}" target="_blank" style="display: inline-block; background-color: #09090b; color: #ffffff; font-size: 15px; font-weight: 500; text-decoration: none; padding: 12px 32px; border-radius: 6px; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
            Sign In Instantly
          </a>
        </div>
        <p style="color: #666666; font-size: 13px; line-height: 20px; margin-bottom: 24px; word-break: break-all;">
          If the button above doesn't work, copy and paste this URL into your browser:<br />
          <a href="${url}" style="color: #2563eb; text-decoration: underline;">${url}</a>
        </p>
        <p style="color: #9ca3af; font-size: 12px; line-height: 20px; margin-top: 32px; border-top: 1px solid #e4e4e7; padding-top: 16px;">
          If you didn't request a login link, you can safely ignore this security email.
        </p>
      </div>
    `;

    try {
      const { data, error } = await this.resend.emails.send({
        from: this.fromAddress,
        to: [to],
        subject,
        html: htmlContent,
      });

      if (error) {
        this.logger.error(`Failed to send login magic link to ${to}: ${error.message}`);
        throw new InternalServerErrorException('Email delivery engine failed.');
      }

      this.logger.log(`🔑 Login magic link successfully dispatched to ${to} (ID: ${data?.id})`);
    } catch (err) {
      this.logger.error(`Unexpected error during login email transmission to ${to}`, err);
      throw new InternalServerErrorException('Could not process authentication mailer pipeline.');
    }
  }

  /**
   * Sends a password reset email with a secure, time-limited reset link.
   * The link is single-use and expires in 15 minutes.
   */
  async sendPasswordResetEmail(to: string, token: string): Promise<void> {
    const subject = `Reset your password`;
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;

    const htmlContent = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 24px; max-width: 480px; margin: 0 auto; background-color: #ffffff; border: 1px solid #f0f0f0; border-radius: 8px;">
        <h2 style="color: #1a1a1a; font-size: 20px; font-weight: 600; margin-bottom: 16px;">Reset your password</h2>
        <p style="color: #666666; font-size: 14px; line-height: 24px; margin-bottom: 24px;">
          We received a request to reset your password. Click the button below to set a new password. This link will expire in 15 minutes.
        </p>
        <div style="text-align: center; margin-bottom: 24px;">
          <a href="${resetUrl}" target="_blank" style="display: inline-block; background-color: #09090b; color: #ffffff; font-size: 15px; font-weight: 500; text-decoration: none; padding: 12px 32px; border-radius: 6px; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
            Reset Password
          </a>
        </div>
        <p style="color: #666666; font-size: 13px; line-height: 20px; margin-bottom: 24px; word-break: break-all;">
          If the button above doesn't work, copy and paste this URL into your browser:<br />
          <a href="${resetUrl}" style="color: #2563eb; text-decoration: underline;">${resetUrl}</a>
        </p>
        <p style="color: #9ca3af; font-size: 12px; line-height: 20px; margin-top: 32px; border-top: 1px solid #e4e4e7; padding-top: 16px;">
          If you did not request a password reset, please ignore this email. Your password will remain unchanged.
        </p>
      </div>
    `;

    try {
      const { data, error } = await this.resend.emails.send({
        from: this.fromAddress,
        to: [to],
        subject,
        html: htmlContent,
      });

      if (error) {
        this.logger.error(`Failed to send password reset email to ${to}: ${error.message}`);
        throw new InternalServerErrorException('Email delivery engine failed.');
      }

      this.logger.log(`🔐 Password reset link successfully dispatched to ${to} (ID: ${data?.id})`);
    } catch (err) {
      this.logger.error(`Unexpected error during password reset email transmission to ${to}`, err);
      throw new InternalServerErrorException('Could not process authentication mailer pipeline.');
    }
  }
}
