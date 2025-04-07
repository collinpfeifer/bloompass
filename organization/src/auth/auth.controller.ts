import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpOrganizationDto } from 'src/dto/signup-organization.dto';
import { LoginOrganizationDto } from 'src/dto/login-organization.dto';
import { Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signup(
    @Req() req: Request,
    @Body() signUpOrganizationDto: SignUpOrganizationDto,
  ) {
    const cookie = req.cookies['subscriber_id'];
    return await this.authService.signUp(signUpOrganizationDto, cookie);
    // need to pass subscriber_id to sign up method
  }

  @Post('login')
  async login(
    @Req() req: Request,
    @Body() loginOrganizationDto: LoginOrganizationDto,
  ) {
    const cookie = req.cookies['subscriber_id'];
    return await this.authService.login(loginOrganizationDto, cookie);
    // need to pass subscriber_id to login method
  }

  @Get('logout')
  async logout(@Req() req: Request) {
    const organizationInfo = req.headers['x-apigateway-api-userinfo'];
    if (!organizationInfo || typeof organizationInfo !== 'string')
      throw new Error('No organization info found');
    const organizationInfoJson = JSON.parse(
      Buffer.from(organizationInfo, 'base64').toString(),
    );
    await this.authService.logout(organizationInfoJson.sub);
  }

  @Get('refresh')
  async refreshTokens(@Req() req: Request) {
    const organizationInfo = req.headers['x-apigateway-api-userinfo'];
    if (!organizationInfo || typeof organizationInfo !== 'string')
      throw new UnauthorizedException('No organization info found');
    const organizationInfoJson = JSON.parse(
      Buffer.from(organizationInfo, 'base64').toString(),
    );
    const refreshTokenHeader = req.headers['x-forwarded-authorization'];
    if (!refreshTokenHeader || typeof refreshTokenHeader !== 'string')
      throw new UnauthorizedException('No refresh token found');
    const refreshToken = refreshTokenHeader.replace('Bearer ', '').trim();
    return await this.authService.refreshTokens(
      organizationInfoJson.sub,
      organizationInfoJson.subscriber_id,
      refreshToken,
    );
  }
}
