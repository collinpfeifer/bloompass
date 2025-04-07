import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { SignUpOrganizationDto } from 'src/dto/signup-organization.dto';
import { OrganizationsService } from 'src/organizations/organizations.service';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { LoginOrganizationDto } from '../dto/login-organization.dto';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private readonly organizationsService: OrganizationsService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}
  async signUp(
    signUpOrganization: SignUpOrganizationDto,
    subscriberId: string,
  ): Promise<any> {
    // Check if organization exists
    const organizationExists = await this.organizationsService.findOne({
      email: signUpOrganization.email,
    });
    if (organizationExists) {
      throw new BadRequestException('Organization already exists');
    }

    // Hash password
    const hash = await this.hashData(signUpOrganization.password);
    const newOrganization = await this.organizationsService.create({
      ...signUpOrganization,
      password: hash,
    });
    const tokens = await this.getTokens(newOrganization.id, subscriberId);
    await this.updateRefreshToken(newOrganization.id, tokens.refreshToken);
    return tokens;
  }

  async login(loginOrganization: LoginOrganizationDto, subscriberId: string) {
    // Check if organization exists
    const organization = await this.organizationsService.findOne({
      email: loginOrganization.email,
    });
    if (!organization)
      throw new BadRequestException('Organization does not exist');
    const passwordMatches = await this.verifyData(
      loginOrganization.password,
      organization.password,
    );
    if (!passwordMatches)
      throw new BadRequestException('Password is incorrect');
    const tokens = await this.getTokens(organization.id, subscriberId);
    await this.updateRefreshToken(organization.id, tokens.refreshToken);
    return tokens;
  }

  async logout(organizationId: string) {
    await this.organizationsService.update(
      { id: organizationId },
      { refreshToken: null },
    );
  }

  async hashData(data: string) {
    return await bcrypt.hash(data, 10);
  }
  async verifyData(data: string, hash: string) {
    return await bcrypt.compare(data, hash);
  }

  async updateRefreshToken(organizationId: string, refreshToken: string) {
    const hashedRefreshToken = await this.hashData(refreshToken);
    await this.organizationsService.update(
      { id: organizationId },
      {
        refreshToken: hashedRefreshToken,
      },
    );
  }

  async refreshTokens(
    organizationId: string,
    subscriberId: string,
    refreshToken: string,
  ) {
    const organization = await this.organizationsService.findOne({
      id: organizationId,
    });
    if (!organization || !organization.refreshToken)
      throw new ForbiddenException('Access Denied');
    const refreshTokenMatches = await this.verifyData(
      refreshToken,
      organization.refreshToken,
    );
    if (!refreshTokenMatches) throw new ForbiddenException('Access Denied');
    const tokens = await this.getTokens(organization.id, subscriberId);
    await this.updateRefreshToken(organization.id, tokens.refreshToken);
    return tokens;
  }

  async getTokens(organizationId: string, subscriberId: string) {
    const key = this.configService.get<string>('JWT_PRIVATE_KEY');
    if (!key) throw new BadRequestException('JWT_PRIVATE_KEY not found');
    const privateKey = crypto.createPrivateKey(
      key.split(String.raw`\n`).join('\n'),
    );
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: organizationId,
          subscriber_id: subscriberId,
          roles: ['organization'],
          permissions: [
            'read_organization',
            'update_organization',
            'delete_organization',
            'create_post',
            'read_post',
            'update_post',
            'delete_post',
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
          sub: organizationId,
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
