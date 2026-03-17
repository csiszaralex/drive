import { UploadCloud } from 'lucide-react';
import type { ReactNode } from 'react';
import { useDropzone } from 'react-dropzone';

interface Props {
  onUpload: (files: File[]) => void;
  isUploading: boolean;
  children: ReactNode;
  renderHeader?: (openFileDialog: () => void) => ReactNode;
}

export default function DropzoneArea({ onUpload, isUploading, children, renderHeader }: Props) {
  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop: onUpload,
    noClick: true,
  });

  return (
    <div className='flex flex-col gap-4 w-full h-full'>
      {renderHeader?.(open)}
      <div
        {...getRootProps()}
        className={`relative flex-1 min-h-[60vh] rounded-xl border-2 border-dashed transition-colors p-6
          ${isDragActive ? 'border-blue-500 bg-blue-500/10' : 'border-zinc-800 bg-zinc-900/50'}`}
      >
        <input {...getInputProps()} />

      {isDragActive && (
        <div className='absolute inset-0 z-10 flex items-center justify-center bg-zinc-950/80 rounded-xl'>
          <div className='flex flex-col items-center text-blue-400'>
            <UploadCloud className='h-12 w-12 mb-2 animate-bounce' />
            <p className='text-lg'>Húzd ide a fájlokat</p>
          </div>
        </div>
      )}

      {isUploading && (
        <div className='absolute top-4 right-4 z-10 bg-blue-500 text-white px-3 py-1.5 rounded-md text-sm animate-pulse'>
          Feltöltés folyamatban...
        </div>
      )}

      {children}
      </div>
    </div>
  );
}
