import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { SubscribersService } from './subscribers.service';
import { UpdateSubscriberDto } from '../dto/update-subscriber.dto';
import { AccessTokenGuard } from '../auth/common/guards/access-token.guard';
import { CacheService } from '../cache/cache.service';

@Controller('subscribers')
export class SubscribersController {
  constructor(
    private readonly subscribersService: SubscribersService,
    private readonly cacheService: CacheService,
  ) {}

  @UseGuards(AccessTokenGuard)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const result = await this.cacheService.get(id);
    if (result) return JSON.parse(result);
    const subscriber = await this.subscribersService.findOne({ id });
    await this.cacheService.set(id, JSON.stringify(subscriber));
    return subscriber;
  }

  @UseGuards(AccessTokenGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateSubscriber: UpdateSubscriberDto,
  ) {
    const update = await this.subscribersService.update(
      { id },
      updateSubscriber,
    );
    await this.cacheService.set(id, JSON.stringify(update));
    return update;
  }

  @UseGuards(AccessTokenGuard)
  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.cacheService.del(id);
    await this.subscribersService.remove({ id });
  }
}
