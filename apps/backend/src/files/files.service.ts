import { Injectable, NotFoundException, StreamableFile } from '@nestjs/common';
import { createReadStream, existsSync } from 'fs';
import { PrismaService } from '../prisma.service';

@Injectable()
export class FilesService {
  constructor(private prisma: PrismaService) {}

  async saveFile(file: Express.Multer.File) {
    return this.prisma.file.create({
      data: {
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        path: file.path,
      },
    });
  }

  async getAllFiles() {
    return this.prisma.file.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        originalName: true,
        mimeType: true,
        size: true,
        createdAt: true,
      },
    });
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
}
