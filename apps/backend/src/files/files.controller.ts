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
import { FilesService } from './files.service';
import { multerConfig } from './multer.config';

@Controller('storage')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('files')
  @UseInterceptors(FilesInterceptor('files', 50, multerConfig))
  async uploadFiles(
    @UploadedFiles() files: Express.Multer.File[],
    @Body('folderId') folderId?: string,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('Nem érkeztek fájlok.');
    }
    return this.filesService.saveFiles(files, folderId);
  }

  @Post('folders')
  async createFolder(@Body('name') name: string, @Body('parentId') parentId?: string) {
    if (!name) throw new BadRequestException('A mappa neve kötelező.');
    return this.filesService.createFolder(name, parentId);
  }

  @Get('structure')
  async getStructure(@Query('folderId') folderId?: string) {
    return this.filesService.getStructure(folderId);
  }

  @Get('file/:id')
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

  @Delete('files/:id')
  @UseGuards(AdminGuard)
  async deleteFile(@Param('id', ParseUUIDPipe) id: string) {
    await this.filesService.deleteFile(id);
    return { success: true, message: 'Fájl törölve.' };
  }

  @Delete('folders/:id')
  @UseGuards(AdminGuard)
  async deleteFolder(@Param('id', ParseUUIDPipe) id: string) {
    await this.filesService.deleteFolder(id);
    return { success: true, message: 'Mappa és tartalma törölve.' };
  }
}
