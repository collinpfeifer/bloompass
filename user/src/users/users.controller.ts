import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Req,
  Delete,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from '../dto/update-user.dto';
import { CacheService } from '../cache/cache.service';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly cacheService: CacheService,
  ) {}

  @Get(':id')
  async findOne(@Req() request: Request, @Param('id') id: string) {
    // const result = await this.cacheService.get(id);
    // if (result) return JSON.parse(result);
    const user = await this.usersService.findOne({ id });
    if (user) {
      // await this.cacheService.set(id, JSON.stringify(user));
      return user;
    } else throw new NotFoundException('User not found');
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateUser: UpdateUserDto) {
    const update = await this.usersService.update({ id }, updateUser);
    if (update) {
      // await this.cacheService.set(id, JSON.stringify(update));
      return update;
    } else throw new NotFoundException('User not found');
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    const user = await this.usersService.remove({ id });
    if (user) {
      // await this.cacheService.del(id);
    } else throw new NotFoundException('User not found');
  }
}
