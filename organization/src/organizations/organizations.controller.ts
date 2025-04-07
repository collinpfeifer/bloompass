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
import { OrganizationsService } from './organizations.service';
import { UpdateOrganizationDto } from '../dto/update-organization.dto';
import { CacheService } from '../cache/cache.service';

@Controller('organizations')
export class OrganizationsController {
  constructor(
    private readonly organizationsService: OrganizationsService,
    private readonly cacheService: CacheService,
  ) {}

  @Get(':id')
  async findOne(@Req() request: Request, @Param('id') id: string) {
    // const entry = log.entry(metadata, request);
    // log.write(entry);
    console.log('request', request.headers);
    // const result = await this.cacheService.get(id);
    // if (result) return JSON.parse(result);
    const user = await this.organizationsService.findOne({ id });
    if (user) {
      // await this.cacheService.set(id, JSON.stringify(user));
      return user;
    } else throw new NotFoundException('User not found');
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() UpdateOrganization: UpdateOrganizationDto,
  ) {
    const update = await this.organizationsService.update(
      { id },
      UpdateOrganization,
    );
    if (update) {
      // await this.cacheService.set(id, JSON.stringify(update));
      return update;
    } else throw new NotFoundException('User not found');
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    const user = await this.organizationsService.remove({ id });
    if (user) {
      // await this.cacheService.del(id);
    } else throw new NotFoundException('User not found');
  }
}
