import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { AppConfigService } from '../../../common/config/app-config.service.js';

interface JwtPayload {
  sub: string; // The User ID
  email: string;
  sid: string; // The Session ID
}

// This strategy is responsible for validating JWTs on protected routes. It checks the token's signature and expiration, and if valid, it extracts the user information and attaches it to the request object.
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(configService: AppConfigService) {
    super({
      // Look for the bearer token inside the Authorization header: "Bearer eyJhbG..."
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.auth.accessSecret,
    });
  }

  validate(payload: JwtPayload) {
    if (!payload.sub) {
      throw new UnauthorizedException('Invalid token structure');
    }

    return {
      id: payload.sub,
      email: payload.email,
      sessionId: payload.sid,
    };
  }
}
