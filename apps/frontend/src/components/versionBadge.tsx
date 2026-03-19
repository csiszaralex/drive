import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';

export const VersionBadge = () => {
  const [backendVersion, setBackendVersion] = useState<string>('loading...');
  const frontendVersion = import.meta.env.VITE_APP_VERSION || '0.0.0-dev';

  useEffect(() => {
    const fetchVersion = async () => {
      try {
        const data = await apiClient<{ version: string }>('/health/version');
        setBackendVersion(data.version);
      } catch {
        setBackendVersion('offline');
      }
    };

    void fetchVersion();
  }, []);

  return (
    <div className='fixed bottom-2 left-2 flex gap-2 text-[10px] font-mono opacity-50 hover:opacity-100 transition-opacity'>
      <span className='bg-slate-800 text-slate-300 px-2 py-1 rounded'>UI: v{frontendVersion}</span>
      <span className='bg-slate-800 text-slate-300 px-2 py-1 rounded'>API: v{backendVersion}</span>
    </div>
  );
};
