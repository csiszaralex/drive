import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { FileItem } from '@/lib/types';

interface Props {
  file: FileItem | null;
  onClose: () => void;
}

const API_BASE = 'http://localhost:3001/storage';

export default function FilePreviewDialog({ file, onClose }: Props) {
  if (!file) return null;

  const fileUrl = `${API_BASE}/file/${file.id}`;
  const isImage = file.mimeType.startsWith('image/');
  const isText = file.mimeType.startsWith('text/');

  return (
    <Dialog open={!!file} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className='max-w-4xl bg-zinc-950 border-zinc-800 text-zinc-50'>
        <DialogHeader>
          <DialogTitle className='truncate'>{file.originalName}</DialogTitle>
        </DialogHeader>

        <div className='flex items-center justify-center min-h-[50vh] mt-4 bg-zinc-900 rounded-md overflow-hidden'>
          {isImage && (
            <img
              src={fileUrl}
              alt={file.originalName}
              className='max-w-full max-h-[70vh] object-contain'
            />
          )}
          {isText && (
            <iframe
              src={fileUrl}
              title={file.originalName}
              className='w-full h-[70vh] bg-zinc-100 dark:bg-zinc-900 rounded'
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
