import { File as FileIcon, Folder as FolderIcon, Trash2 } from 'lucide-react';

interface ItemCardProps {
  name: string;
  type: 'folder' | 'file';
  showDelete: boolean;
  onDoubleClick: () => void;
  onDelete: (e: React.MouseEvent) => void;
}

export default function ItemCard({
  name,
  type,
  showDelete,
  onDoubleClick,
  onDelete,
}: ItemCardProps) {
  const isFolder = type === 'folder';
  const Icon = isFolder ? FolderIcon : FileIcon;

  return (
    <div
      onDoubleClick={onDoubleClick}
      className='group relative flex flex-col items-center p-4 rounded-lg bg-zinc-800 hover:bg-zinc-700 cursor-pointer transition-colors select-none'
    >
      <Icon
        className={`h-12 w-12 mb-2 ${isFolder ? 'text-zinc-400' : 'text-zinc-500'}`}
        fill={isFolder ? 'currentColor' : 'none'}
      />
      <span className='text-sm text-center truncate w-full' title={name}>
        {name}
      </span>

      {showDelete && (
        <button
          onClick={onDelete}
          className='absolute top-2 right-2 p-1.5 bg-red-500/20 text-red-400 rounded hover:bg-red-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity'
          aria-label='Törlés'
        >
          <Trash2 className='h-4 w-4' />
        </button>
      )}
    </div>
  );
}
