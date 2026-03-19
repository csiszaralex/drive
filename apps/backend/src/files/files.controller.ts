import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  Res,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { AdminGuard } from 'src/common/admin.guard';
import { UploadFileDto } from './dto/upload-file.dto';
import { FilesService } from './files.service';
import { multerConfig } from './multer.config';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post()
  @UseInterceptors(FilesInterceptor('files', 50, multerConfig))
  async uploadFiles(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() { folderId }: UploadFileDto,
  ) {
    if (!files || files.length === 0) throw new BadRequestException('Nem érkeztek fájlok.');

    return this.filesService.saveFiles(files, folderId);
  }

  @Get()
  async getStructure(@Query('folderId') folderId?: string) {
    return this.filesService.getStructure(folderId);
  }

  @Get(':id')
  async getFile(@Param('id', ParseUUIDPipe) id: string, @Res({ passthrough: true }) res: Response) {
    const { fileMetadata, stream } = await this.filesService.getFileStream(id);

    const isImage = fileMetadata.mimeType.startsWith('image/');
    const isMdOrJson =
      fileMetadata.originalName.toLowerCase().endsWith('.md') ||
      fileMetadata.originalName.toLowerCase().endsWith('.json') ||
      fileMetadata.mimeType === 'application/json';

    const isInline = isImage || fileMetadata.mimeType.startsWith('text/') || isMdOrJson;

    const dispositionType = isInline ? 'inline' : 'attachment';

    const encodedFileName = encodeURIComponent(fileMetadata.originalName);

    // If it's markdown or json returning as inline, set content-type to text/plain to prevent browser from downloading or forcing a new external app page
    const responseContentType = isMdOrJson && isInline ? 'text/plain' : fileMetadata.mimeType;

    res.set({
      'Content-Type': responseContentType,
      'Content-Disposition': `${dispositionType}; filename*=UTF-8''${encodedFileName}`,
      'X-Content-Type-Options': 'nosniff',
    });

    return stream;
  }

  @Get(':id/download')
  async getFileDownload(
    @Param('id', ParseUUIDPipe) id: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { fileMetadata, stream } = await this.filesService.getFileStream(id);
    const encodedFileName = encodeURIComponent(fileMetadata.originalName);

    res.set({
      'Content-Type': fileMetadata.mimeType,
      'Content-Disposition': `attachment; filename*=UTF-8''${encodedFileName}`,
      'X-Content-Type-Options': 'nosniff',
    });

    return stream;
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  async deleteFile(@Param('id', ParseUUIDPipe) id: string) {
    await this.filesService.deleteFile(id);
    return { success: true, message: 'Fájl törölve.' };
  }
}
