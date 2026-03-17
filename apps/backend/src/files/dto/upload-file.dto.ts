import { UploadFilesBodySchema } from '@repo/shared-types';
import { createZodDto } from 'nestjs-zod';

export class UploadFileDto extends createZodDto(UploadFilesBodySchema) {}
