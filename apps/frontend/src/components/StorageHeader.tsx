import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Lock, Plus } from 'lucide-react';
import { useState } from 'react';

interface Props {
  onBack: () => void;
  canGoBack: boolean;
  onCreateFolder: (name: string) => Promise<void>;
  adminPass: string;
  setAdminPass: (val: string) => void;
}

export default function StorageHeader({
  onBack,
  canGoBack,
  onCreateFolder,
  adminPass,
  setAdminPass,
}: Props) {
  const [folderName, setFolderName] = useState('');

  const handleCreate = () => {
    onCreateFolder(folderName);
    setFolderName('');
  };

  return (
    <div className='flex items-center justify-between bg-zinc-900 p-4 rounded-xl border border-zinc-800'>
      <div className='flex items-center gap-4'>
        <Button
          variant='outline'
          size='icon'
          onClick={onBack}
          disabled={!canGoBack}
          className='bg-zinc-800'
        >
          <ArrowLeft className='h-4 w-4' />
        </Button>
        <h1 className='text-lg font-medium'>Storage</h1>
      </div>

      <div className='flex items-center gap-4'>
        <div className='flex items-center gap-2'>
          <Input
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            placeholder='Új mappa neve...'
            className='bg-zinc-950 border-zinc-700 h-9'
          />
          <Button size='sm' onClick={handleCreate} className='bg-zinc-100 text-zinc-900'>
            <Plus className='h-4 w-4 mr-1' /> Létrehoz
          </Button>
        </div>
        <div className='h-6 w-px bg-zinc-700 mx-2' />
        <div className='relative group'>
          <Lock className='h-4 w-4 absolute left-2.5 top-2.5 text-zinc-500' />
          <Input
            type='password'
            placeholder='Admin jelszó'
            value={adminPass}
            onChange={(e) => setAdminPass(e.target.value)}
            className='pl-8 bg-zinc-950 border-zinc-700 h-9 w-36 focus:w-48 transition-all'
          />
        </div>
      </div>
    </div>
  );
}
