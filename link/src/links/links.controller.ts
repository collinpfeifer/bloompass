import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
} from '@nestjs/common';
import { LinksService } from './links.service';
import { CreateLinkDto } from '../dto/create-link.dto';
import { UpdateLinkDto } from '../dto/update-link.dto';
import { Request } from 'express';

@Controller('links')
export class LinksController {
  constructor(private readonly linksService: LinksService) {}

  @Post()
  async create(@Body() createLinkDto: CreateLinkDto) {
    return await this.linksService.create(createLinkDto);
  }

  @Get()
  async findAll(@Req() req: Request) {
    const userInfo = req.headers['x-apigateway-api-userinfo'];
    if (!userInfo || typeof userInfo !== 'string')
      throw new Error('No user info found');
    const userInfoJson = JSON.parse(Buffer.from(userInfo, 'base64').toString());
    return await this.linksService.findAll(userInfoJson.sub);
  }

  @Get('posts/:postId')
  async findAllByPostId(@Param('postId') postId: string) {
    return await this.linksService.findAllByPostId(postId);
  }

  @Get(':id/click')
  async click(@Param('id') id: string) {
    return await this.linksService.click(id);
  }

  @Get(':id/sale')
  async sale(@Param('id') id: string) {
    return await this.linksService.sale(id);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.linksService.findOne(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateLinkDto: UpdateLinkDto) {
    return await this.linksService.update(id, updateLinkDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.linksService.remove(id);
  }
}
