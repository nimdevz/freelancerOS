import { Controller, Post, Get, Param, Body, Res, NotFoundException } from '@nestjs/common';
import { FilesService } from './files.service';
import { Response } from 'express';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Files')
@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('presigned-url')
  @ApiOperation({ summary: 'Generate Cloudflare R2 / S3 presigned upload URL' })
  async getPresignedUrl(@Body() body: { fileName: string; mimeType: string; size: number }) {
    return this.filesService.getUploadUrl(body);
  }

  @Get('download/:key')
  @ApiOperation({ summary: 'Download or view stored file' })
  async downloadFile(@Param('key') key: string, @Res() res: Response) {
    const filePath = this.filesService.getFilePath(key);
    if (!filePath) {
      throw new NotFoundException('File not found');
    }
    return res.sendFile(filePath);
  }
}
