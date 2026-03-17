import type { StorageStructure } from '@/lib/types';
import { useCallback, useEffect, useState } from 'react';

const API_BASE = 'http://localhost:3001/storage';

export function useStorage() {
  const [structure, setStructure] = useState<StorageStructure>({ folders: [], files: [] });
  const [folderHistory, setFolderHistory] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const currentFolderId = folderHistory[folderHistory.length - 1] || undefined;

  const fetchStructure = useCallback(async () => {
    try {
      const url = currentFolderId
        ? `${API_BASE}/structure?folderId=${currentFolderId}`
        : `${API_BASE}/structure`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Hiba a lekérdezés során');
      setStructure(await res.json());
    } catch (error) {
      console.error(error);
    }
  }, [currentFolderId]);

  useEffect(() => {
    fetchStructure();
  }, [fetchStructure]);

  const uploadFiles = async (files: File[]) => {
    if (files.length === 0) return;
    setIsUploading(true);
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    if (currentFolderId) formData.append('folderId', currentFolderId);

    try {
      await fetch(`${API_BASE}/files`, { method: 'POST', body: formData });
      fetchStructure();
    } finally {
      setIsUploading(false);
    }
  };

  const createFolder = async (name: string) => {
    if (!name.trim()) return;
    await fetch(`${API_BASE}/folders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, parentId: currentFolderId }),
    });
    fetchStructure();
  };

  const deleteItem = async (id: string, type: 'files' | 'folders', adminPass: string) => {
    const res = await fetch(`${API_BASE}/${type}/${id}`, {
      method: 'DELETE',
      headers: { 'x-admin-pass': adminPass },
    });
    if (!res.ok) throw new Error('Sikertelen törlés (Hibás jelszó?)');
    fetchStructure();
  };

  const enterFolder = (folderId: string) => setFolderHistory((prev) => [...prev, folderId]);
  const goBack = () => setFolderHistory((prev) => prev.slice(0, -1));

  return {
    structure,
    isUploading,
    canGoBack: folderHistory.length > 0,
    uploadFiles,
    createFolder,
    deleteItem,
    enterFolder,
    goBack,
  };
}
