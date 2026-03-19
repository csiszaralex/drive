import { 
  File as FileIcon, 
  Folder as FolderIcon, 
  Trash2,
  FileText,
  FileJson,
  FileArchive,
  Image as ImageIcon,
  FileCode,
  FileAudio,
  FileVideo
} from 'lucide-react';

function getFileProperties(name: string) {
  const ext = name.split('.').pop()?.toLowerCase() || '';
  
  switch (ext) {
    case 'pdf':
      return { Icon: FileText, color: 'text-red-500' };
    case 'md':
    case 'txt':
      return { Icon: FileText, color: 'text-blue-400' };
    case 'json':
      return { Icon: FileJson, color: 'text-yellow-500' };
    case 'js':
    case 'ts':
    case 'jsx':
    case 'tsx':
    case 'html':
    case 'css':
      return { Icon: FileCode, color: 'text-blue-500' };
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'gif':
    case 'svg':
    case 'webp':
      return { Icon: ImageIcon, color: 'text-emerald-500' };
    case 'zip':
    case 'rar':
    case '7z':
    case 'tar':
    case 'gz':
      return { Icon: FileArchive, color: 'text-orange-500' };
    case 'mp3':
    case 'wav':
    case 'ogg':
      return { Icon: FileAudio, color: 'text-purple-500' };
    case 'mp4':
    case 'webm':
    case 'mkv':
    case 'avi':
      return { Icon: FileVideo, color: 'text-pink-500' };
    default:
      return { Icon: FileIcon, color: 'text-zinc-500' };
  }
}

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
  const fileProps = isFolder ? { Icon: FolderIcon, color: 'text-zinc-400' } : getFileProperties(name);
  const Icon = fileProps.Icon;

  return (
    <div
      onDoubleClick={onDoubleClick}
      className='group relative flex flex-col items-center p-4 rounded-lg bg-zinc-800 hover:bg-zinc-700 cursor-pointer transition-colors select-none'
    >
      <Icon
        className={`h-12 w-12 mb-2 ${fileProps.color}`}
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
