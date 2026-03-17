import { Injectable, NotFoundException } from '@nestjs/common';
import { TFolderResponseApiSchema } from '@repo/shared-types';
import { existsSync, unlinkSync } from 'fs';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class FoldersService {
  constructor(private prisma: PrismaService) {}

  async createFolder(name: string, parentId?: string): Promise<TFolderResponseApiSchema> {
    if (parentId) {
      const folder = await this.prisma.folder.findUnique({ where: { id: parentId } });
      if (!folder) throw new NotFoundException('A megadott mappa nem található.');
    }
    return this.prisma.folder.create({
      data: { name, parentId: parentId || null },
    });
  }

  async deleteFolder(id: string): Promise<void> {
    const folder = await this.prisma.folder.findUnique({ where: { id } });
    if (!folder) throw new NotFoundException('Mappa nem található.');

    await this.deletePhysicalFilesRecursively(id);
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
