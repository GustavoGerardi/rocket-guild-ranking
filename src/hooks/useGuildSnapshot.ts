import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import type { GuildData } from '../types/guild.ts';
import { demoData } from '../lib/demoData.ts';
import { validateGuildJson } from '../utils/guildJson.ts';
import {
  isSupabaseConfigured,
  loadLatestGuildImport,
  saveLatestGuildImport,
} from '../services/supabase/guildImports.ts';

export interface GuildSnapshot {
  guildData: GuildData | null;
  fileName: string;
  error: string;
  storageMessage: string;
  isImporting: boolean;
  importFile: (file: File) => Promise<void>;
  onFileChange: (event: ChangeEvent<HTMLInputElement>) => Promise<void>;
  loadDemo: () => void;
}

export function useGuildSnapshot(): GuildSnapshot {
  const [guildData, setGuildData] = useState<GuildData | null>(null);
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [storageMessage, setStorageMessage] = useState(
    isSupabaseConfigured
      ? 'Conectando ao Supabase...'
      : 'Supabase não configurado; o último JSON não será compartilhado entre visitas.',
  );
  const localDataLoaded = useRef(false);

  useEffect(() => {
    if (!isSupabaseConfigured) return undefined;
    let active = true;

    async function loadLatestImport() {
      const { data, error: loadError } = await loadLatestGuildImport();

      if (!active || localDataLoaded.current) return;
      if (loadError) {
        setError(
          `Não foi possível carregar o último JSON do Supabase: ${loadError.message}`,
        );
        return;
      }
      if (!data) {
        return;
      }

      const validationError = validateGuildJson(data.data);
      if (validationError) {
        setError(
          `O último JSON salvo no Supabase é inválido: ${validationError}`,
        );
        return;
      }

      setGuildData(data.data as GuildData);
      setFileName(data.file_name || 'ultimo-import.json');
      setStorageMessage('Último JSON carregado do Supabase.');
    }

    loadLatestImport();
    return () => {
      active = false;
    };
  }, []);

  async function importFile(file: File): Promise<void> {
    setIsImporting(true);
    try {
      const text = await file.text();
      const parsed: unknown = JSON.parse(text);
      const validationError = validateGuildJson(parsed);
      if (validationError) throw new Error(validationError);
      const validated = parsed as GuildData;
      localDataLoaded.current = true;
      setGuildData(validated);
      setFileName(file.name);
      setError('');
      if (!isSupabaseConfigured) {
        setStorageMessage(
          'Supabase não configurado; este JSON ficará disponível apenas nesta sessão.',
        );
      } else {
        setStorageMessage('Salvando último JSON no Supabase...');
        const { error: saveError } = await saveLatestGuildImport(
          validated,
          file.name,
        );
        if (saveError) throw saveError;
        setStorageMessage('Último JSON salvo no Supabase.');
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Não foi possível ler o arquivo.',
      );
      setStorageMessage('');
    } finally {
      setIsImporting(false);
    }
  }

  async function onFileChange(
    event: ChangeEvent<HTMLInputElement>,
  ): Promise<void> {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      await importFile(file);
    } finally {
      event.target.value = '';
    }
  }

  function loadDemo() {
    localDataLoaded.current = true;
    setGuildData(demoData);
    setFileName('exemplo-demonstrativo.json');
    setError('');
    setStorageMessage('');
  }

  return {
    guildData,
    fileName,
    error,
    storageMessage,
    isImporting,
    importFile,
    onFileChange,
    loadDemo,
  };
}
