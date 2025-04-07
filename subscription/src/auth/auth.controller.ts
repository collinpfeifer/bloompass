import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpSubscriberDto } from 'src/dto/signup-subscriber.dto';
import { LoginSubscriberDto } from 'src/dto/login-subscriber.dto';
import { RefreshTokenGuard } from './common/guards/refresh-token.guard';
import { Request } from 'express';
import { AccessTokenGuard } from './common/guards/access-token.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signup(@Body() signUpSubscriber: SignUpSubscriberDto) {
    return await this.authService.signUp(signUpSubscriber);
  }

  @Post('login')
  async login(@Body() loginSubscriber: LoginSubscriberDto) {
    return await this.authService.login(loginSubscriber);
  }

  @UseGuards(AccessTokenGuard)
  @Get('logout')
  logout(@Req() req: Request) {
    // this.authService.logout(req.user['subscriber_id']);
  }

  @UseGuards(RefreshTokenGuard)
  @Get('refresh')
  refreshTokens(@Req() req: Request) {
    // const subscriberId = req.user['subscriber_id'];
    // const refreshToken = req.user['refresh_token'];
    // return this.authService.refreshTokens(subscriberId, refreshToken);
  }
}
