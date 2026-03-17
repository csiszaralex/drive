import type { TGetStructureResponse } from '@repo/shared-types';
import { useCallback, useEffect, useState } from 'react';
import { apiClient } from '../lib/api';

export function useStorage() {
  const [structure, setStructure] = useState<TGetStructureResponse>({ folders: [], files: [] });
  const [folderHistory, setFolderHistory] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const currentFolderId = folderHistory[folderHistory.length - 1] || undefined;

  const fetchStructure = useCallback(async () => {
    try {
      const url = currentFolderId
        ? `/files?folderId=${currentFolderId}`
        : `/files`;

      const data = await apiClient<TGetStructureResponse>(url);
      setStructure(data);
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
      await apiClient('/files', { method: 'POST', body: formData });
      fetchStructure();
    } finally {
      setIsUploading(false);
    }
  };

  const createFolder = async (name: string) => {
    if (!name.trim()) return;
    await apiClient('/folders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, parentId: currentFolderId }),
    });
    fetchStructure();
  };

  const deleteItem = async (id: string, type: 'files' | 'folders', adminPass: string) => {
    await apiClient(`/${type}/${id}`, {
      method: 'DELETE',
      headers: { 'x-admin-pass': adminPass },
    });
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
