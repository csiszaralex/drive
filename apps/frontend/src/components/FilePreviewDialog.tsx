import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { FileItem } from '@repo/shared-types';
import { Download, ExternalLink, File as FileIcon } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { apiClient } from '@/lib/api';

interface Props {
  file: FileItem | null;
  onClose: () => void;
}

export default function FilePreviewDialog({ file, onClose }: Props) {
  const [textContent, setTextContent] = useState<string | null>(file ? null : null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!file) return;

    let isMounted = true;
    const isMd = file.originalName.toLowerCase().endsWith('.md');
    const isJson =
      file.mimeType === 'application/json' || file.originalName.toLowerCase().endsWith('.json');

    if (isMd || isJson) {
      const fetchText = async () => {
        setLoading(true);
        try {
          const text = await apiClient<string>(`/files/${file.id}`, { responseType: 'text' });
          if (isMounted) setTextContent(text);
        } catch (error) {
          console.error(error);
        } finally {
          if (isMounted) setLoading(false);
        }
      };

      void fetchText();
    } else {
      setTextContent(null);
    }

    return () => {
      isMounted = false;
      setTextContent(null);
    };
  }, [file]);

  const fileInfo = useMemo(() => {
    if (!file) return null;
    const size =
      file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(2)} MB`
        : `${(file.size / 1024).toFixed(2)} KB`;

    return { size };
  }, [file]);

  if (!file) return null;

  const fileUrl = `${import.meta.env.VITE_API_URL}/files/${file.id}`;
  const isImage = file.mimeType.startsWith('image/');
  const isMd = file.originalName.toLowerCase().endsWith('.md');
  const isJson =
    file.mimeType === 'application/json' || file.originalName.toLowerCase().endsWith('.json');
  const isText =
    (file.mimeType.startsWith('text/') || file.mimeType === 'application/json') && !isMd && !isJson;

  return (
    <Dialog open={!!file} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className='max-w-[90vw] w-full max-h-[95vh] h-full sm:max-w-6xl p-0 gap-0 overflow-hidden bg-zinc-950/95 backdrop-blur-xl border-zinc-800/50 shadow-2xl flex flex-col rounded-xl'>
        <DialogHeader className='p-4 border-b border-zinc-800/50 bg-zinc-900/50 flex flex-row items-center justify-between shrink-0 h-16'>
          <div className='flex flex-col gap-1 overflow-hidden'>
            <DialogTitle className='flex items-center gap-2 text-zinc-100 text-lg font-medium truncate'>
              <FileIcon className='h-5 w-5 text-zinc-400 shrink-0' />
              <span className='truncate'>{file.originalName}</span>
            </DialogTitle>
            <span className='text-xs text-zinc-500 font-mono pl-7'>
              {fileInfo?.size} • {file.mimeType}
            </span>
          </div>
          <div className='flex items-center gap-2 pr-8'>
            <a
              href={fileUrl}
              target='_blank'
              rel='noreferrer'
              className='p-2 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 rounded-md transition-colors'
              title='Megnyitás új lapon'
            >
              <ExternalLink className='h-4 w-4' />
            </a>
            <a
              href={`${fileUrl}/download`}
              download={file.originalName}
              className='p-2 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 rounded-md transition-colors'
              title='Letöltés'
            >
              <Download className='h-4 w-4' />
            </a>
          </div>
        </DialogHeader>

        <div className='flex-1 overflow-auto bg-zinc-950/20 relative items-center justify-center flex p-4 sm:p-8'>
          {loading && (
            <div className='absolute inset-0 flex items-center justify-center bg-zinc-950/50 backdrop-blur-sm z-10'>
              <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-400'></div>
            </div>
          )}

          {isImage && (
            <div className='w-full h-full flex items-center justify-center p-4 bg-zinc-900/30 rounded-xl border border-zinc-800/30 shadow-inner'>
              <img
                src={fileUrl}
                alt={file.originalName}
                className='max-w-full max-h-full object-contain drop-shadow-2xl rounded-lg'
              />
            </div>
          )}

          {isMd && textContent !== null && (
            <div className='w-full h-full overflow-auto p-6 sm:p-12 bg-zinc-900/40 rounded-xl border border-zinc-800/50 shadow-inner prose prose-zinc dark:prose-invert prose-headings:font-semibold prose-a:text-blue-400 max-w-4xl mx-auto'>
              <ReactMarkdown>{textContent}</ReactMarkdown>
            </div>
          )}

          {isJson && textContent !== null && (
            <div className='w-full h-full overflow-auto p-6 bg-zinc-900/40 rounded-xl border border-zinc-800/50 shadow-inner max-w-5xl mx-auto text-left'>
              <pre className='text-zinc-300 text-[13px] leading-tight font-mono'>
                {(() => {
                  try {
                    return JSON.stringify(JSON.parse(textContent), null, 2);
                  } catch {
                    return textContent;
                  }
                })()}
              </pre>
            </div>
          )}

          {!isImage && !isMd && !isJson && isText && (
            <div className='w-full h-full bg-zinc-900/40 rounded-xl border border-zinc-800/50 shadow-inner overflow-hidden max-w-5xl mx-auto p-1'>
              <iframe
                src={fileUrl}
                title={file.originalName}
                className='w-full h-full bg-zinc-100 dark:bg-zinc-900 rounded-lg'
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
