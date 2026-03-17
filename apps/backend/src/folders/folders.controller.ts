import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AdminGuard } from 'src/common/admin.guard';
import { CreateFolderDto } from 'src/folders/dto/create-folder.dto';
import { FoldersService } from './folders.service';

@Controller('folders')
export class FoldersController {
  constructor(private readonly foldersService: FoldersService) {}

  @Post()
  createFolder(@Body() createFolderDto: CreateFolderDto) {
    const { name, parentId } = createFolderDto;
    return this.foldersService.createFolder(name, parentId);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteFolder(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.foldersService.deleteFolder(id);
  }
}
