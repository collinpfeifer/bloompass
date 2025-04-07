import {
  Controller,
  Get,
  Post,
  Delete,
  UploadedFile,
  UseInterceptors,
  NotFoundException,
  Param,
  FileTypeValidator,
  ParseFilePipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Storage } from '@google-cloud/storage';
import { v4 as uuidv4 } from 'uuid';
import { memoryStorage } from 'multer';
import * as fs from 'fs';
@Controller('images')
export class ImagesController {
  private storage = new Storage({
    projectId: process.env.PROJECT_ID,
    credentials: {
      type: 'service_account',
      client_email: process.env.CLIENT_EMAIL,
      client_id: process.env.CLIENT_ID,
      private_key: process.env.PRIVATE_KEY?.replace(/\\n/g, '\n') as string,
    },
  });
  private bucketName = process.env.BUCKET_NAME;

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: memoryStorage(),
    }),
  )
  async uploadImage(
    @UploadedFile(
      new ParseFilePipe({
        validators: [new FileTypeValidator({ fileType: 'image' })],
      }),
    )
    file: Express.Multer.File,
  ) {
    const imageBuffer = file?.buffer || fs.readFileSync(file.path);
    if (!this.bucketName) {
      throw new Error('BUCKET_NAME not found in .env file');
    }
    const bucket = this.storage.bucket(this.bucketName);
    const splits = file.originalname.split('.');
    const ext = splits[splits.length - 1];
    splits.pop();
    file.originalname =
      splits
        .join('')
        .replace(/[. \s]/g, '_')
        .trim()
        .toLowerCase()
        .substring(0, 16) + `.${ext}`;
    const fileName = `${uuidv4()}_${file.originalname || ''}`;
    file.filename = fileName;
    const fileObj = bucket.file(file.filename);
    await fileObj.save(imageBuffer);

    return {
      success: true,
      message: 'Image uploaded successfully',
      imageId: file.filename,
    };
  }

  @Get(':id')
  async getImage(@Param('id') id: string) {
    if (!this.bucketName) {
      throw new Error('BUCKET_NAME not found in .env file');
    }
    const bucket = this.storage.bucket(this.bucketName);
    const fileObj = bucket.file(id);

    const [fileExists] = await fileObj.exists();

    if (!fileExists) {
      throw new NotFoundException('Image not found');
    }

    const [file] = await fileObj.download();
    const base64Image = file.toString('base64');

    return {
      success: true,
      image: `data:image/${
        base64Image.split('.')[1] === 'jpg' ||
        base64Image.split('.')[1] === 'jpeg'
          ? 'jpg'
          : base64Image.split('.')[1]
      };base64,${base64Image}`,
    };
  }

  @Delete(':id')
  async deleteImage(@Param('id') id: string) {
    if (!this.bucketName) {
      throw new Error('BUCKET_NAME not found in .env file');
    }
    const bucket = this.storage.bucket(this.bucketName);
    const fileObj = bucket.file(id);

    const [fileExists] = await fileObj.exists();

    if (!fileExists) {
      throw new NotFoundException('Image not found');
    }

    await fileObj.delete();

    return {
      success: true,
      message: 'Image deleted successfully',
    };
  }
}
