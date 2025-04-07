import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { SignUpUserDto } from 'src/dto/signup-user.dto';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { LoginUserDto } from '../dto/login-user.dto';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}
  async signUp(signUpUser: SignUpUserDto, subscriberId: string): Promise<any> {
    // Check if user exists
    const userExists = await this.usersService.findOne({
      phoneNumber: signUpUser.phoneNumber,
    });
    if (userExists) {
      throw new BadRequestException('User already exists');
    }

    // Hash password
    const hash = await this.hashData(signUpUser.password);
    const newUser = await this.usersService.create({
      ...signUpUser,
      password: hash,
    });
    const tokens = await this.getTokens(newUser.id, subscriberId);
    await this.updateRefreshToken(newUser.id, tokens.refreshToken);
    return tokens;
  }

  async login(loginUser: LoginUserDto, subscriberId: string) {
    // Check if user exists
    const user = await this.usersService.findOne({
      phoneNumber: loginUser.phoneNumber,
    });
    if (!user) throw new BadRequestException('User does not exist');
    const passwordMatches = await this.verifyData(
      loginUser.password,
      user.password,
    );
    if (!passwordMatches)
      throw new BadRequestException('Password is incorrect');
    const tokens = await this.getTokens(user.id, subscriberId);
    await this.updateRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }

  async logout(userId: string) {
    await this.usersService.update({ id: userId }, { refreshToken: null });
  }

  async hashData(data: string) {
    return await bcrypt.hash(data, 10);
  }
  async verifyData(data: string, hash: string) {
    return await bcrypt.compare(data, hash);
  }

  async updateRefreshToken(userId: string, refreshToken: string) {
    const hashedRefreshToken = await this.hashData(refreshToken);
    await this.usersService.update(
      { id: userId },
      {
        refreshToken: hashedRefreshToken,
      },
    );
  }

  async refreshTokens(
    userId: string,
    subscriberId: string,
    refreshToken: string,
  ) {
    const user = await this.usersService.findOne({ id: userId });
    if (!user || !user.refreshToken)
      throw new ForbiddenException('Access Denied');
    const refreshTokenMatches = await this.verifyData(
      refreshToken,
      user.refreshToken,
    );
    if (!refreshTokenMatches) throw new ForbiddenException('Access Denied');
    const tokens = await this.getTokens(user.id, subscriberId);
    await this.updateRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }

  async getTokens(userId: string, subscriberId: string) {
    const key = this.configService.get<string>('JWT_PRIVATE_KEY');
    if (!key) throw new BadRequestException('JWT_PRIVATE_KEY not found');
    const privateKey = crypto.createPrivateKey(
      key.split(String.raw`\n`).join('\n'),
    );
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: userId,
          subscriber_id: subscriberId,
          roles: ['user'],
          permissions: [
            'read_user',
            'update_user',
            'delete_user',
            'read_pass',
            'create_link',
            'read_link',
            'delete_link',
            'create_pass',
          ],
          iss: 'adfluent-api-gateway-auth@adfluent.iam.gserviceaccount.com',
          aud: '102839281963594688405',
        },
        {
          privateKey,
          expiresIn: '6h',
          algorithm: 'RS256',
        },
      ),
      this.jwtService.signAsync(
        {
          sub: userId,
          subscriber_id: subscriberId,
          iss: 'adfluent-api-gateway-auth@adfluent.iam.gserviceaccount.com',
          aud: '102839281963594688405',
        },
        {
          privateKey,
          expiresIn: '60d',
          algorithm: 'RS256',
        },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }
}
