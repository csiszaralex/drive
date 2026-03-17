import type { StorageStructure } from '@/lib/types';
import { UploadCloud } from 'lucide-react';
import ItemCard from './ItemCard';

interface StorageGridProps {
  structure: StorageStructure;
  adminPass: string;
  onFolderDoubleClick: (id: string) => void;
  onDelete: (id: string, type: 'files' | 'folders') => void;
}

// Ha van közös config fájlod, onnan érdemes importálni
const API_BASE = 'http://localhost:3001/storage';

export default function StorageGrid({
  structure,
  adminPass,
  onFolderDoubleClick,
  onDelete,
}: StorageGridProps) {
  const handleFileDoubleClick = (fileId: string) => {
    // A natív böngészős viselkedésre támaszkodunk (a NestJS header-ek döntik el a letöltést/megnyitást)
    window.open(`${API_BASE}/file/${fileId}`, '_blank');
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
          onDoubleClick={() => handleFileDoubleClick(file.id)}
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
