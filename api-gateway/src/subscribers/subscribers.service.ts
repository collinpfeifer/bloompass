import { Injectable } from '@nestjs/common';
import { RegisterSubscriberDto } from './dto/register-subscriber.dto';
import { LoginSubscriberDto } from './dto/login-subscriber.dto';
import { UpdateSubscriberDto } from './dto/update-subscriber.dto';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class SubscribersService {
  url: string | undefined;
  constructor(
    private configService: ConfigService,
    private jwtService: JwtService,
  ) {
    this.url = this.configService.get<string>(
      'AMETHYST_SUBSCRIBERS_SERVICE_URL',
    );
  }
  async register(registerSubscriberDto: RegisterSubscriberDto) {
    return await fetch(`${this.url}/users/register`, {
      method: 'Post',
      body: JSON.stringify(registerSubscriberDto),
    });
  }

  login(loginSubscriberDto: LoginSubscriberDto) {
    return fetch(`${this.url}/users/login`, {
      method: 'Post',
      body: JSON.stringify(loginSubscriberDto),
    });
  }

  findIfPhoneNumberAvailable(phoneNumber: string) {
    return fetch(`${this.url}/users/${phoneNumber}`, {
      method: 'Get',
      body: JSON.stringify({ phoneNumber }),
    });
  }

  findById(id: string) {
    return fetch(`${this.url}/users/${id}`, {
      method: 'Get',
      headers: { Authorization: 'Bearer' },
    });
  }

  update(id: string, updateSubscriberDto: UpdateSubscriberDto) {
    return fetch(`${this.url}/users/${id}`, {
      method: 'Patch',
      body: JSON.stringify(updateSubscriberDto),
    });
  }

  refreshAuthToken(id: string) {
    return;
  }

  remove(id: string) {
    return fetch(`${this.url}/users/${id}`, {
      method: 'Delete',
    });
  }

  async signPayload(payload: string) {
    return this.jwtService.sign(payload);
  }
}
