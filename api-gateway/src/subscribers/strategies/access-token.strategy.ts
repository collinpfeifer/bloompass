import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

type JwtPayload = {
  sub_id: string;
  email: string;
  roles: Array<string>;
  permissions: Array<string>;
};

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(
  Strategy,
  'subscribers-jwt',
) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get<string>('JWT_REFRESH_SECRET'),
    });
  }

  validate(payload: JwtPayload) {
    return payload;
  }
}
