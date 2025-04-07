import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

type JwtPayload = {
  sub_id: string;
  email: string;
  roles: Array<string>;
  permissions: Array<string>;
};

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'subscribers-jwt-refresh',
) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secret: configService.get<string>('JWT_REFRESH_SECRET'),
      passReqToCallback: true,
    });
  }

  validate(req: Request, payload: JwtPayload) {
    const refreshToken = req
      ?.get('Authorization')
      ?.replace('Bearer', '')
      ?.trim();
    return { ...payload, refreshToken };
  }
}
