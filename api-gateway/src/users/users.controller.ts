import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { SignUpUserDto } from './dto/signup-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { AccessTokenGuard } from './common/guards/access-token.guard';
import { RefreshTokenGuard } from './common/guards/refresh-token.strategy';
import { Request } from 'express';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('signup')
  signUpUser(@Body() signUpUser: SignUpUserDto) {
    return this.usersService.signUpUser(signUpUser);
  }

  @Post('login')
  loginUser(@Body() loginUser: LoginUserDto) {
    return this.usersService.loginUser(loginUser);
  }

  @UseGuards(AccessTokenGuard)
  @Get('logout')
  logoutUser(@Req() req: Request) {
    if (req.user !== undefined) return this.usersService.logoutUser(req.user);
  }

  @Get(':phoneNumber')
  findByPhoneNumber(@Param('phoneNumber') phoneNumber: string) {
    return this.usersService.findByPhoneNumber(phoneNumber);
  }

  @UseGuards(AccessTokenGuard)
  @Get(':id')
  findById(@Req() req: Request, @Param('id') id: string) {
    if (req.user !== undefined) return this.usersService.findById(req.user, id);
  }

  @UseGuards(AccessTokenGuard)
  @Patch(':id')
  update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() updateUser: UpdateUserDto,
  ) {
    if (req.user !== undefined)
      return this.usersService.update(req.user, id, updateUser);
  }

  @UseGuards(AccessTokenGuard)
  @Delete(':id')
  remove(@Req() req: Request, @Param('id') id: string) {
    if (req.user !== undefined) return this.usersService.remove(req.user, id);
  }

  @UseGuards(RefreshTokenGuard)
  @Get('refresh')
  refreshTokens(@Req() req: Request) {
    if (req.user !== undefined)
      return this.usersService.refreshTokens(req.user);
  }
}
