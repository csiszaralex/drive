import { useState } from 'react';
import { toast } from 'sonner';
import DropzoneArea from './components/DropzoneArea';
import FilePreviewDialog from './components/FilePreviewDialog';
import StorageGrid from './components/StorageGrid';
import StorageHeader from './components/StorageHeader';
import { useStorage } from './hooks/useStorage';
import type { FileItem } from '@repo/shared-types';

export default function FileManager() {
  const [adminPass, setAdminPass] = useState('');
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);
  const storage = useStorage();

  const handleUpload = async (files: File[]) => {
    try {
      await storage.uploadFiles(files);
      toast.success('Sikeres feltöltés', { description: `${files.length} fájl feltöltve.` });
    } catch (error) {
      if (error instanceof Error)
        toast.error('Hiba a feltöltésnél', { description: error.message });
    }
  };

  const handleDelete = async (id: string, type: 'files' | 'folders') => {
    if (!adminPass) {
      return toast.error('Hiba', { description: 'Admin jelszó szükséges a törléshez!' });
    }
    try {
      await storage.deleteItem(id, type, adminPass);
      toast.success('Törölve', {
        description: `A ${type === 'files' ? 'fájl' : 'mappa'} sikeresen törölve.`,
      });
    } catch (error) {
      if (error instanceof Error) toast.error('Hiba a törlésnél', { description: error.message });
    }
  };

  return (
    <>
      <StorageHeader
        onBack={storage.goBack}
        canGoBack={storage.canGoBack}
        onCreateFolder={storage.createFolder}
        adminPass={adminPass}
        setAdminPass={setAdminPass}
      />

      <DropzoneArea onUpload={handleUpload} isUploading={storage.isUploading}>
        <StorageGrid
          structure={storage.structure}
          adminPass={adminPass}
          onFolderDoubleClick={storage.enterFolder}
          onFileDoubleClick={setPreviewFile}
          onDelete={handleDelete}
        />
      </DropzoneArea>

      <FilePreviewDialog file={previewFile} onClose={() => setPreviewFile(null)} />
    </>
  );
}
