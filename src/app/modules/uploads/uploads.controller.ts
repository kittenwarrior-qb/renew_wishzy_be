import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { UploadsService } from './uploads.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from 'src/app/entities/user.entity';

@ApiTags('Uploads')
@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post('avatar')
  @ApiOperation({ summary: 'Upload user avatar' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Avatar uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid file' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(@CurrentUser() user: User, @UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    return this.uploadsService.uploadAvatar(user.id, file);
  }

  @Post('video')
  @ApiOperation({ summary: 'Upload video to Bunny.net' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
      required: ['file'],
    },
  })
  @ApiResponse({ status: 200, description: 'Video uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid file' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @UseInterceptors(FileInterceptor('file'))
  async uploadVideo(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    return this.uploadsService.uploadVideo(file);
  }

  @Post('image')
  @ApiOperation({ summary: 'Upload image to Cloudinary' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
      required: ['file'],
    },
  })
  @ApiResponse({ status: 200, description: 'Image uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid file' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    return this.uploadsService.uploadImage(file);
  }

  @Post('video/:videoId/info')
  @ApiOperation({ summary: 'Get video information from Bunny.net' })
  @ApiResponse({ status: 200, description: 'Video info retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid video ID' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getVideoInfo(@Body('videoId') videoId: string) {
    if (!videoId) {
      throw new BadRequestException('Video ID is required');
    }

    return this.uploadsService.getVideoInfo(videoId);
  }

  @Post('document')
  @ApiOperation({ summary: 'Upload document (PDF, DOC, DOCX) to Cloudinary' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Document file (PDF, DOC, DOCX). Max size: 20MB',
        },
      },
      required: ['file'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Document uploaded successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Document uploaded successfully' },
        url: { type: 'string', example: 'https://res.cloudinary.com/...' },
        publicId: { type: 'string', example: 'wishzy/documents/file_abc123' },
        format: { type: 'string', example: 'pdf' },
        size: { type: 'number', example: 1048576 },
        originalName: { type: 'string', example: 'my-document.pdf' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid file type or size' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @UseInterceptors(FileInterceptor('file'))
  async uploadDocument(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    return this.uploadsService.uploadDocument(file);
  }
}
