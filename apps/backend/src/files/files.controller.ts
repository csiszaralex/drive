import {
  BadRequestException,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { FilesService } from './files.service';
import { multerConfig } from './multer.config';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file', multerConfig))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Nem érkezett fájl.');
    }

    const savedFile = await this.filesService.saveFile(file);

    return {
      id: savedFile.id,
      originalName: savedFile.originalName,
      size: savedFile.size,
    };
  }

  @Get()
  async listFiles() {
    return this.filesService.getAllFiles();
  }

  @Get(':id')
  async getFile(@Param('id', ParseUUIDPipe) id: string, @Res({ passthrough: true }) res: Response) {
    const { fileMetadata, stream } = await this.filesService.getFileStream(id);

    const isInline =
      fileMetadata.mimeType.startsWith('image/') || fileMetadata.mimeType.startsWith('text/');
    const dispositionType = isInline ? 'inline' : 'attachment';

    const encodedFileName = encodeURIComponent(fileMetadata.originalName);

    res.set({
      'Content-Type': fileMetadata.mimeType,
      'Content-Disposition': `${dispositionType}; filename*=UTF-8''${encodedFileName}`,
      'X-Content-Type-Options': 'nosniff',
    });

    return stream;
  }
}
