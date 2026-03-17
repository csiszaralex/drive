export interface FileItem {
  id: string;
  originalName: string;
  mimeType: string;
  size: number;
  createdAt: string;
}

export interface FolderItem {
  id: string;
  name: string;
  parentId: string | null;
  createdAt: string;
}

export interface StorageStructure {
  folders: FolderItem[];
  files: FileItem[];
}
