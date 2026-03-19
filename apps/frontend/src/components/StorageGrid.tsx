import { UploadCloud } from 'lucide-react';
import { useEffect, useState } from 'react';
import ItemCard from './ItemCard';
import type { FileItem, TGetStructureResponse } from '@repo/shared-types';

interface StorageGridProps {
  structure: TGetStructureResponse;
  adminPass: string;
  onFolderDoubleClick: (id: string) => void;
  onFileDoubleClick: (file: FileItem) => void;
  onDelete: (id: string, type: 'files' | 'folders') => void;
}

export default function StorageGrid({
  structure,
  adminPass,
  onFolderDoubleClick,
  onFileDoubleClick,
  onDelete,
}: StorageGridProps) {
  const [downloadFileId, setDownloadFileId] = useState<string | null>(null);

  useEffect(() => {
    if (downloadFileId) {
      window.location.href = `${import.meta.env.VITE_API_URL}/files/${downloadFileId}/download`;
      // Reset after a short delay so the user can click it again if needed
      setTimeout(() => setDownloadFileId(null), 100);
    }
  }, [downloadFileId]);

  const handleFileAction = (file: FileItem) => {
    const isMdOrJson =
      file.originalName.toLowerCase().endsWith('.md') ||
      file.originalName.toLowerCase().endsWith('.json') ||
      file.mimeType === 'application/json';

    const isPreviewable =
      file.mimeType.startsWith('image/') || file.mimeType.startsWith('text/') || isMdOrJson;

    if (isPreviewable) {
      onFileDoubleClick(file);
    } else {
      setDownloadFileId(file.id);
    }
  };

  const isEmpty = structure.folders.length === 0 && structure.files.length === 0;

  return (
    <div className='grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4'>
      {structure.folders.map((folder) => (
        <ItemCard
          key={folder.id}
          name={folder.name}
          type='folder'
          showDelete={!!adminPass}
          onDoubleClick={() => onFolderDoubleClick(folder.id)}
          onDelete={(e) => {
            e.stopPropagation();
            onDelete(folder.id, 'folders');
          }}
        />
      ))}

      {structure.files.map((file) => (
        <ItemCard
          key={file.id}
          name={file.originalName}
          type='file'
          showDelete={!!adminPass}
          onDoubleClick={() => handleFileAction(file)}
          onDelete={(e) => {
            e.stopPropagation();
            onDelete(file.id, 'files');
          }}
        />
      ))}

      {isEmpty && (
        <div className='col-span-full flex flex-col items-center justify-center text-zinc-500 mt-20 pointer-events-none'>
          <UploadCloud className='h-16 w-16 mb-4 opacity-20' />
          <p>A mappa üres. Húzz ide fájlokat a feltöltéshez.</p>
        </div>
      )}
    </div>
  );
}
