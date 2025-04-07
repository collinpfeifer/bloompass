import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpUserDto } from 'src/dto/signup-user.dto';
import { LoginUserDto } from 'src/dto/login-user.dto';
import { Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signup(@Req() req: Request, @Body() signUpUserDto: SignUpUserDto) {
    const cookie = req.cookies['subscriber_id'];
    return await this.authService.signUp(signUpUserDto, cookie);
    // need to pass subscriber_id to sign up method
  }

  @Post('login')
  async login(@Req() req: Request, @Body() loginUserDto: LoginUserDto) {
    const cookie = req.cookies['subscriber_id'];
    return await this.authService.login(loginUserDto, cookie);
    // need to pass subscriber_id to login method
  }

  @Get('logout')
  async logout(@Req() req: Request) {
    const userInfo = req.headers['x-apigateway-api-userinfo'];
    if (!userInfo || typeof userInfo !== 'string')
      throw new Error('No user info found');
    const userInfoJson = JSON.parse(Buffer.from(userInfo, 'base64').toString());
    await this.authService.logout(userInfoJson.sub);
  }

  @Get('refresh')
  async refreshTokens(@Req() req: Request) {
    const userInfo = req.headers['x-apigateway-api-userinfo'];
    if (!userInfo || typeof userInfo !== 'string')
      throw new Error('No user info found');
    const userInfoJson = JSON.parse(Buffer.from(userInfo, 'base64').toString());
    const refreshTokenHeader = req.headers['x-forwarded-authorization'];
    if (!refreshTokenHeader || typeof refreshTokenHeader !== 'string')
      throw new Error('No refresh token found');
    const refreshToken = refreshTokenHeader.replace('Bearer ', '').trim();
    return await this.authService.refreshTokens(
      userInfoJson.sub,
      userInfoJson.subscriber_id,
      refreshToken,
    );
  }
}
