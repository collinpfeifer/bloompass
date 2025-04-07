import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { SignUpSubscriberDto } from 'src/dto/signup-subscriber.dto';
import { SubscribersService } from 'src/subscribers/subscribers.service';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { LoginSubscriberDto } from '../dto/login-subscriber.dto';
import { randomBytes } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private readonly subscribersService: SubscribersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}
  async signUp(signUpSubscriber: SignUpSubscriberDto): Promise<any> {
    // Check if subscriber exists
    const subscriberExists = await this.subscribersService.findOne({
      email: signUpSubscriber.email,
    });
    if (subscriberExists) {
      throw new BadRequestException('Subscriber already exists');
    }
    if (signUpSubscriber.password !== signUpSubscriber.confirmPassword)
      throw new BadRequestException('Passwords do not match');

    // Hash password
    const hash = await this.hashData(signUpSubscriber.password);
    const accountAuthToken = randomBytes(32).toString('hex');
    const hashToken = await this.hashData(accountAuthToken);
    const newSubscriber = await this.subscribersService.create({
      ...signUpSubscriber,
      password: hash,
      accountAuthToken: hashToken,
    });
    const tokens = await this.getTokens(newSubscriber.id, newSubscriber.email);
    await this.updateRefreshToken(newSubscriber.id, tokens.refreshToken);
    return { ...tokens, accountAuthToken };
  }

  async login(loginSubscriber: LoginSubscriberDto) {
    // Check if subscriber exists
    const subscriber = await this.subscribersService.findOne({
      email: loginSubscriber.email,
    });
    if (!subscriber) throw new BadRequestException('Subscriber does not exist');
    const passwordMatches = await this.verifyData(
      loginSubscriber.password,
      subscriber.password,
    );
    if (!passwordMatches)
      throw new BadRequestException('Password is incorrect');
    const tokens = await this.getTokens(subscriber.id, subscriber.email);
    await this.updateRefreshToken(subscriber.id, tokens.refreshToken);
    return tokens;
  }

  async logout(subscriberId: string) {
    return await this.subscribersService.update(
      { id: subscriberId },
      { refreshToken: undefined },
    );
  }

  async hashData(data: string) {
    return await bcrypt.hash(data, 10);
  }
  async verifyData(data: string, hash: string) {
    return await bcrypt.compare(data, hash);
  }

  async updateRefreshToken(subscriberId: string, refreshToken: string) {
    const hashedRefreshToken = await this.hashData(refreshToken);
    await this.subscribersService.update(
      { id: subscriberId },
      {
        refreshToken: hashedRefreshToken,
      },
    );
  }

  async refreshTokens(subscriberId: string, refreshToken: string) {
    const subscriber = await this.subscribersService.findOne({
      id: subscriberId,
    });
    if (!subscriber || !subscriber.refreshToken)
      throw new ForbiddenException('Access Denied');
    const refreshTokenMatches = await this.verifyData(
      refreshToken,
      subscriber.refreshToken,
    );
    if (!refreshTokenMatches) throw new ForbiddenException('Access Denied');
    const tokens = await this.getTokens(subscriber.id, subscriber.email);
    await this.updateRefreshToken(subscriber.id, tokens.refreshToken);
    return tokens;
  }

  async getTokens(subscriberId: string, email: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          subscriber_id: subscriberId,
          email,
          roles: ['subscriber'],
          permissions: [
            'read_subscriber',
            'update_subscriber',
            'delete_subscriber',
            'read_post',
            'create_post',
            'update_post',
            'delete_post',
          ],
        },
        {
          privateKey: this.configService.get<string>('JWT_ACCESS_SECRET'),
          expiresIn: '1d',
          algorithm: 'HS256',
        },
      ),
      this.jwtService.signAsync(
        {
          subscriber_id: subscriberId,
          email,
          roles: ['subscriber'],
          permissions: [
            'read_subscriber',
            'update_subscriber',
            'delete_subscriber',
            'read_post',
            'create_post',
            'update_post',
            'delete_post',
          ],
        },
        {
          privateKey: this.configService.get<string>('JWT_REFRESH_SECRET'),
          expiresIn: '7d',
          algorithm: 'HS256',
        },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }
}
