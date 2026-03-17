import { useState } from 'react';
import DropzoneArea from './components/DropzoneArea';
import StorageGrid from './components/StorageGrid';
import StorageHeader from './components/StorageHeader';
import { useStorage } from './hooks/useStorage';

export default function FileManager() {
  const [adminPass, setAdminPass] = useState('');
  const storage = useStorage();

  const handleDelete = async (id: string, type: 'files' | 'folders') => {
    if (!adminPass) return alert('Admin jelszó szükséges!');
    try {
      await storage.deleteItem(id, type, adminPass);
    } catch (error) {
      if (error instanceof Error) alert(error.message);
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
      <DropzoneArea onUpload={storage.uploadFiles} isUploading={storage.isUploading}>
        <StorageGrid
          structure={storage.structure}
          adminPass={adminPass}
          onFolderDoubleClick={storage.enterFolder}
          onDelete={handleDelete}
        />
      </DropzoneArea>
    </>
  );
}
