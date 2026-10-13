import { useRef, useState } from 'react';
import { fetchLatestGuildExport } from '../services/localFiles/guildExports.ts';

export function useLatestGuildExport(
  importFile: (file: File) => Promise<void>,
) {
  const importingRef = useRef(false);
  const [error, setError] = useState('');
  const [isReadingExport, setIsReadingExport] = useState(false);

  async function importLatest(): Promise<void> {
    if (importingRef.current) return;
    const now = Date.now();
    importingRef.current = true;
    setIsReadingExport(true);
    setError('');
    try {
      const file = await fetchLatestGuildExport(now);
      await importFile(file);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : 'Não foi possível importar o último export.',
      );
    } finally {
      importingRef.current = false;
      setIsReadingExport(false);
    }
  }

  return {
    error,
    isReadingExport,
    importLatest,
    clearError: () => setError(''),
  };
}
