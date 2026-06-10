import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/*
 * This guard is exported and used in controllers to protect routes that require authentication.
 * It uses the 'jwt' strategy defined in JwtStrategy to validate incoming JWTs
 * and ensure that only authenticated users can access those routes.
 *
 * For example, in a controller you might have:
 *
 * @UseGuards(JwtAuthGuard)
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  override handleRequest<TUser = unknown>(err: unknown, user: TUser, info: unknown): TUser {
    if (err || !user) {
      const message = (info as { message?: string }).message ?? 'Unauthorized';
      throw err instanceof Error ? err : new UnauthorizedException(message);
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return user;
  }
}
