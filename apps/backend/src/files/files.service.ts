import { Injectable, NotFoundException, StreamableFile } from '@nestjs/common';
import { TGetStructureResponse, TUploadFilesResponse } from '@repo/shared-types';
import { createReadStream, existsSync, unlinkSync } from 'fs';
import { FileCreateManyInput } from 'src/generated/prisma/models';
import { PrismaService } from '../prisma.service';

@Injectable()
export class FilesService {
  constructor(private prisma: PrismaService) {}

  async saveFiles(files: Express.Multer.File[], folderId?: string): Promise<TUploadFilesResponse> {
    if (folderId) {
      const folder = await this.prisma.folder.findUnique({ where: { id: folderId } });
      if (!folder) throw new NotFoundException('A megadott mappa nem található.');
    }

    const data = files.map((file) => ({
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      path: file.path,
      folderId: folderId || null,
    })) satisfies FileCreateManyInput[];

    await this.prisma.file.createMany({ data });

    return this.prisma.file.findMany({
      where: { path: { in: files.map((f) => f.path) } },
      select: { id: true, originalName: true, size: true, folderId: true, mimeType: true },
    });
  }

  async getStructure(folderId?: string): Promise<TGetStructureResponse> {
    const folders = await this.prisma.folder.findMany({ where: { parentId: folderId || null } });
    const files = await this.prisma.file.findMany({
      where: { folderId: folderId || null },
      select: { id: true, originalName: true, mimeType: true, size: true, createdAt: true },
    });
    return { folders, files };
  }

  async getFileStream(id: string) {
    const file = await this.prisma.file.findUnique({ where: { id } });

    if (!file) {
      throw new NotFoundException('A fájl nem található az adatbázisban.');
    }
    if (!existsSync(file.path)) {
      throw new NotFoundException('A fizikai fájl hiányzik a szerverről.');
    }

    return {
      fileMetadata: file,
      stream: new StreamableFile(createReadStream(file.path)),
    };
  }

  async deleteFile(id: string) {
    const file = await this.prisma.file.findUnique({ where: { id } });
    if (!file) throw new NotFoundException('Fájl nem található.');

    if (existsSync(file.path)) unlinkSync(file.path);
    await this.prisma.file.delete({ where: { id } });
  }
}
