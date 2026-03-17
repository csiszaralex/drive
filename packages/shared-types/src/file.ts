import z from 'zod';

export const UploadFilesBodySchema = z.object({
  folderId: z.uuid('Érvénytelen mappa ID').optional(),
});
export type TUploadFilesBody = z.infer<typeof UploadFilesBodySchema>;

const file = z.object({
  id: z.uuid(),
  originalName: z.string(),
  mimeType: z.string(),
  size: z.number().int().nonnegative(),
  createdAt: z.date(),
  folderId: z.uuid().nullable(),
});

const folder = z.object({
  id: z.uuid(),
  name: z.string(),
  createdAt: z.date(),
  parentId: z.uuid().nullable(),
});

export const UploadFilesResponseSchema = z.array(file.omit({ createdAt: true }));
export type TUploadFilesResponse = z.infer<typeof UploadFilesResponseSchema>;

export const GetStructureResponseSchema = z.object({
  folders: z.array(folder),
  files: z.array(file.omit({ folderId: true })),
});
export type TGetStructureResponse = z.infer<typeof GetStructureResponseSchema>;
