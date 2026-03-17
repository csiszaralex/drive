import { z } from 'zod';

export const CreateFolderApiSchema = z.object({
  name: z.string().min(1, 'A mappa neve nem lehet üres.'),
  parentId: z.uuid('Érvénytelen UUID formátum a parentId mezőben.').optional(),
});
export type TCreateFolderApi = z.infer<typeof CreateFolderApiSchema>;

export const FolderResponseApiSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  parentId: z.uuid().nullable(),
  createdAt: z.date(),
});
export type TFolderResponseApiSchema = z.infer<typeof FolderResponseApiSchema>;
