import { Injectable } from '@nestjs/common';
import { SignUpUserDto } from './dto/signup-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ConfigService } from '@nestjs/config';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtService } from '@nestjs/jwt';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  url: string | undefined;
  constructor(
    private configService: ConfigService,
    private jwtService: JwtService,
  ) {
    this.url = this.configService.get<string>('AMETHYST_USERS_SERVICE_URL');
  }

  async signUpUser(signUpUser: SignUpUserDto) {
    try {
      await fetch(`${this.url}/auth/signup`, {
        method: 'Post',
        body: JSON.stringify(signUpUser),
      });
    } catch (exception: any) {
      console.log(exception);
    }
  }

  async loginUser(loginUser: LoginUserDto) {
    try {
      await fetch(`${this.url}/auth/login`, {
        method: 'Post',
        body: JSON.stringify(loginUser),
      });
    } catch (exception: any) {
      console.log(exception);
    }
  }

  async logoutUser(payload: User) {
    try {
      await fetch(`${this.url}/auth/logout`, {
        method: 'Get',
        headers: {
          Authorization: `Bearer ${this.jwtService.sign(payload, {
            expiresIn: '5s',
            algorithm: 'RS256',
            privateKey: this.configService.get('JWT_PRIVATE_KEY'),
          })}`,
        },
      });
    } catch (exception: any) {
      console.log(exception);
    }
  }

  async findById(payload: User, id: string) {
    try {
      return await fetch(`${this.url}/users?id=${id}`, {
        headers: {
          Authorization: `Bearer ${this.jwtService.sign(payload, {
            expiresIn: '5s',
            algorithm: 'RS256',
            privateKey: this.configService.get('JWT_PRIVATE_KEY'),
          })}`,
        },
      });
    } catch (exception: any) {
      console.log(exception);
    }
  }

  async findByPhoneNumber(phoneNumber: string) {
    try {
      return await fetch(`${this.url}/users?phoneNumber=${phoneNumber}`);
    } catch (exception: any) {
      console.log(exception);
    }
  }

  async update(payload: User, id: string, updateUserDto: UpdateUserDto) {
    try {
      return await fetch(`${this.url}/users?id=${id}`, {
        method: 'Patch',
        body: JSON.stringify(updateUserDto),
        headers: {
          Authorization: `Bearer ${this.jwtService.sign(payload, {
            expiresIn: '5s',
            algorithm: 'RS256',
            privateKey: this.configService.get('JWT_PRIVATE_KEY'),
          })}`,
        },
      });
    } catch (exception: any) {
      console.log(exception);
    }
  }

  async remove(payload: User, id: string) {
    try {
      return await fetch(`${this.url}/users?id=${id}`, {
        headers: {
          Authorization: `Bearer ${this.jwtService.sign(payload, {
            expiresIn: '5s',
            algorithm: 'RS256',
            privateKey: this.configService.get('JWT_PRIVATE_KEY'),
          })}`,
        },
      });
    } catch (exception: any) {
      console.log(exception);
    }
  }

  async refreshTokens(payload: User) {
    try {
      return await fetch(`${this.url}/auth/refresh`, {
        headers: {
          Authorization: `Bearer ${this.jwtService.sign(payload, {
            expiresIn: '5s',
            algorithm: 'RS256',
            privateKey: this.configService.get('JWT_PRIVATE_KEY'),
          })}`,
        },
      });
    } catch (exception: any) {
      console.log(exception);
    }
  }
}
