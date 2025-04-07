import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { SubscribersService } from './subscribers.service';
import { RegisterSubscriberDto } from './dto/register-subscriber.dto';
import { LoginSubscriberDto } from './dto/login-subscriber.dto';
import { UpdateSubscriberDto } from './dto/update-subscriber.dto';

@Controller('subscribers')
export class SubscribersController {
  constructor(private readonly subscribersService: SubscribersService) {}

  @Post()
  register(@Body() registerSubscriberDto: RegisterSubscriberDto) {
    return this.subscribersService.register(registerSubscriberDto);
  }

  @Post()
  login(@Body() loginSubscriberDto: LoginSubscriberDto) {
    return this.subscribersService.login(loginSubscriberDto);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.subscribersService.findById(id);
  }

  @Get(':phoneNumber')
  findIfPhoneNumberAvailable(@Param('phoneNumber') phoneNumber: string) {
    return this.subscribersService.findIfPhoneNumberAvailable(phoneNumber);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateSubscriberDto: UpdateSubscriberDto,
  ) {
    return this.subscribersService.update(id, updateSubscriberDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.subscribersService.remove(id);
  }
}
