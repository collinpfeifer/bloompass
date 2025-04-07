import { Module } from '@nestjs/common';
import { OrganizationsController } from './organizations/organizations.controller';
import { OrganizationsService } from './organizations/organizations.service';
import { OrganizationsModule } from './organizations/organizations.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { AuthService } from './auth/auth.service';
import { AuthController } from './auth/auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from './cache/cache.module';

@Module({
  imports: [
    PrismaModule,
    OrganizationsModule,
    AuthModule,
    CacheModule,
    ConfigModule.forRoot({ isGlobal: true, cache: true }),
    JwtModule.register({}),
  ],
  controllers: [OrganizationsController, AuthController],
  providers: [OrganizationsService, AuthService],
})
export class AppModule {}
