import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  ArrowLeft,
  File as FileIcon,
  Folder as FolderIcon,
  Lock,
  Plus,
  Trash2,
  UploadCloud,
} from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import type { StorageStructure } from './lib/types';

const API_BASE = 'http://localhost:3001/storage';

export default function FileManager() {
  const [structure, setStructure] = useState<StorageStructure>({ folders: [], files: [] });
  const [folderHistory, setFolderHistory] = useState<string[]>([]);
  const [adminPass, setAdminPass] = useState('');
  const [newFolderName, setNewFolderName] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const currentFolderId = folderHistory[folderHistory.length - 1] || undefined;

  // --- API HÍVÁSOK ---

  const fetchStructure = useCallback(async () => {
    try {
      const url = currentFolderId
        ? `${API_BASE}/structure?folderId=${currentFolderId}`
        : `${API_BASE}/structure`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Hiba a lekérdezés során');
      const data = await res.json();
      setStructure(data);
    } catch (error) {
      console.error(error);
    }
  }, [currentFolderId]);

  useEffect(() => {
    fetchStructure();
  }, [fetchStructure]);

  const handleUpload = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    setIsUploading(true);

    const formData = new FormData();
    acceptedFiles.forEach((file) => formData.append('files', file));
    if (currentFolderId) formData.append('folderId', currentFolderId);

    try {
      await fetch(`${API_BASE}/files`, { method: 'POST', body: formData });
      fetchStructure();
    } catch (error) {
      console.error('Feltöltési hiba', error);
    } finally {
      setIsUploading(false);
    }
  };

  const createFolder = async () => {
    if (!newFolderName.trim()) return;
    try {
      await fetch(`${API_BASE}/folders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newFolderName, parentId: currentFolderId }),
      });
      setNewFolderName('');
      fetchStructure();
    } catch (error) {
      console.error('Mappalétrehozási hiba', error);
    }
  };

  const deleteItem = async (id: string, type: 'files' | 'folders', e: React.MouseEvent) => {
    e.stopPropagation(); // Ne triggerezze a dupla klikket
    if (!adminPass) return alert('Admin jelszó szükséges!');

    try {
      const res = await fetch(`${API_BASE}/${type}/${id}`, {
        method: 'DELETE',
        headers: { 'x-admin-pass': adminPass },
      });
      if (!res.ok) throw new Error('Sikertelen törlés (Hibás jelszó?)');
      fetchStructure();
    } catch (error) {
      alert(error);
    }
  };

  // --- INTERAKCIÓK ---

  const handleFolderDoubleClick = (folderId: string) => {
    setFolderHistory((prev) => [...prev, folderId]);
  };

  const handleBack = () => {
    setFolderHistory((prev) => prev.slice(0, -1));
  };

  const handleFileDoubleClick = (fileId: string) => {
    window.open(`${API_BASE}/file/${fileId}`, '_blank');
  };

  // --- DROPZONE SETUP ---
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleUpload,
    noClick: true, // Csak drag&dropra reagáljon a konténer, a klikk a fájloké
  });

  return (
    <div className='min-h-screen bg-zinc-950 text-zinc-50 p-6 font-sans'>
      <div className='max-w-6xl mx-auto space-y-6'>
        {/* HEADER & KONTROLLOK */}
        <div className='flex items-center justify-between bg-zinc-900 p-4 rounded-xl border border-zinc-800'>
          <div className='flex items-center gap-4'>
            <Button
              variant='outline'
              size='icon'
              onClick={handleBack}
              disabled={folderHistory.length === 0}
              className='bg-zinc-800 border-zinc-700 hover:bg-zinc-700'
            >
              <ArrowLeft className='h-4 w-4' />
            </Button>
            <h1 className='text-lg font-medium tracking-tight'>Storage</h1>
          </div>

          <div className='flex items-center gap-4'>
            <div className='flex items-center gap-2'>
              <Input
                type='text'
                placeholder='Új mappa neve...'
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                className='bg-zinc-950 border-zinc-700 text-sm h-9'
              />
              <Button
                size='sm'
                onClick={createFolder}
                className='bg-zinc-100 text-zinc-900 hover:bg-zinc-300'
              >
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
                className='pl-8 bg-zinc-950 border-zinc-700 text-sm h-9 w-36 focus:w-48 transition-all'
              />
            </div>
          </div>
        </div>

        {/* FŐ TERÜLET (DROPZONE) */}
        <div
          {...getRootProps()}
          className={`relative min-h-[60vh] rounded-xl border-2 border-dashed transition-colors p-6
            ${isDragActive ? 'border-blue-500 bg-blue-500/10' : 'border-zinc-800 bg-zinc-900/50'}`}
        >
          <input {...getInputProps()} />

          {isDragActive && (
            <div className='absolute inset-0 z-10 flex items-center justify-center bg-zinc-950/80 rounded-xl backdrop-blur-sm'>
              <div className='flex flex-col items-center text-blue-400'>
                <UploadCloud className='h-12 w-12 mb-2 animate-bounce' />
                <p className='text-lg font-medium'>Húzd ide a fájlokat a feltöltéshez</p>
              </div>
            </div>
          )}

          {isUploading && (
            <div className='absolute top-4 right-4 z-10 bg-blue-500 text-white px-3 py-1.5 rounded-md text-sm font-medium animate-pulse'>
              Feltöltés folyamatban...
            </div>
          )}

          {/* GRID RENDERELÉS */}
          <div className='grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4'>
            {structure.folders.map((folder) => (
              <div
                key={folder.id}
                onDoubleClick={() => handleFolderDoubleClick(folder.id)}
                className='group relative flex flex-col items-center p-4 rounded-lg bg-zinc-800 hover:bg-zinc-700 cursor-pointer transition-colors'
              >
                <FolderIcon className='h-12 w-12 text-zinc-400 mb-2' fill='currentColor' />
                <span className='text-sm text-center truncate w-full' title={folder.name}>
                  {folder.name}
                </span>

                {adminPass && (
                  <button
                    onClick={(e) => deleteItem(folder.id, 'folders', e)}
                    className='absolute top-2 right-2 p-1.5 bg-red-500/20 text-red-400 rounded hover:bg-red-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity'
                  >
                    <Trash2 className='h-4 w-4' />
                  </button>
                )}
              </div>
            ))}

            {structure.files.map((file) => (
              <div
                key={file.id}
                onDoubleClick={() => handleFileDoubleClick(file.id)}
                className='group relative flex flex-col items-center p-4 rounded-lg bg-zinc-800 hover:bg-zinc-700 cursor-pointer transition-colors'
              >
                <FileIcon className='h-12 w-12 text-zinc-500 mb-2' />
                <span className='text-sm text-center truncate w-full' title={file.originalName}>
                  {file.originalName}
                </span>

                {adminPass && (
                  <button
                    onClick={(e) => deleteItem(file.id, 'files', e)}
                    className='absolute top-2 right-2 p-1.5 bg-red-500/20 text-red-400 rounded hover:bg-red-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity'
                  >
                    <Trash2 className='h-4 w-4' />
                  </button>
                )}
              </div>
            ))}

            {structure.folders.length === 0 && structure.files.length === 0 && !isDragActive && (
              <div className='col-span-full flex flex-col items-center justify-center text-zinc-500 mt-20'>
                <UploadCloud className='h-16 w-16 mb-4 opacity-20' />
                <p>A mappa üres. Húzz ide fájlokat a feltöltéshez.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
