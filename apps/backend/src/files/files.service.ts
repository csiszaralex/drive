import { Injectable, NotFoundException, StreamableFile } from '@nestjs/common';
import { createReadStream, existsSync, unlinkSync } from 'fs';
import { FileCreateManyInput } from 'src/generated/prisma/models';
import { PrismaService } from '../prisma.service';

@Injectable()
export class FilesService {
  constructor(private prisma: PrismaService) {}

  async saveFiles(files: Express.Multer.File[], folderId?: string) {
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
      select: { id: true, originalName: true, size: true, folderId: true },
    });
  }

  async createFolder(name: string, parentId?: string) {
    if (parentId) {
      const folder = await this.prisma.folder.findUnique({ where: { id: parentId } });
      if (!folder) throw new NotFoundException('A megadott mappa nem található.');
    }
    return this.prisma.folder.create({
      data: { name, parentId: parentId || null },
    });
  }

  async getStructure(folderId?: string) {
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

  async deleteFolder(id: string) {
    const folder = await this.prisma.folder.findUnique({ where: { id } });
    if (!folder) throw new NotFoundException('Mappa nem található.');

    // 1. Fizikai fájlok rekurzív törlése
    await this.deletePhysicalFilesRecursively(id);

    // 2. DB rekordok törlése (A Prisma Cascade megoldja a fájl-rekordok és almappák törlését)
    await this.prisma.folder.delete({ where: { id } });
  }

  private async deletePhysicalFilesRecursively(folderId: string) {
    const folder = await this.prisma.folder.findUnique({
      where: { id: folderId },
      include: { files: true, children: true },
    });

    if (!folder) return;

    for (const file of folder.files) {
      if (existsSync(file.path)) unlinkSync(file.path);
    }

    for (const child of folder.children) {
      await this.deletePhysicalFilesRecursively(child.id);
    }
  }
}
