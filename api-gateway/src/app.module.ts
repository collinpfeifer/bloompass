import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { LinksModule } from './links/links.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { SubscribersModule } from './subscribers/subscribers.module';
import { PostsModule } from './posts/posts.module';
import { PassesModule } from './passes/passes.module';
import { UsersService } from './users/users.service';
import { LinksService } from './links/links.service';
import { OrganizationsService } from './organizations/organizations.service';
import { SubscribersService } from './subscribers/subscribers.service';
import { PostsService } from './posts/posts.service';
import { PassesService } from './passes/passes.service';
import { UsersController } from './users/users.controller';
import { LinksController } from './links/links.controller';
import { OrganizationsController } from './organizations/organizations.controller';
import { SubscribersController } from './subscribers/subscribers.controller';
import { PostsController } from './posts/posts.controller';
import { PassesController } from './passes/passes.controller';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
    }),
    JwtModule.register({}),
    UsersModule,
    LinksModule,
    OrganizationsModule,
    SubscribersModule,
    PostsModule,
    PassesModule,
  ],
  controllers: [
    UsersController,
    LinksController,
    OrganizationsController,
    SubscribersController,
    PostsController,
    PassesController,
  ],
  providers: [
    UsersService,
    LinksService,
    OrganizationsService,
    SubscribersService,
    PostsService,
    PassesService,
  ],
})
export class AppModule {}
