import { VersionBadge } from './components/versionBadge';
import FileManager from './FileManager';

export default function App() {
  return (
    <main className='min-h-screen bg-zinc-950 p-6'>
      <FileManager />
      <VersionBadge />
    </main>
  );
}
