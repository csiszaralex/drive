import { CreateFolderApiSchema } from '@repo/shared-types';
import { createZodDto } from 'nestjs-zod';

export class CreateFolderDto extends createZodDto(CreateFolderApiSchema) {}
