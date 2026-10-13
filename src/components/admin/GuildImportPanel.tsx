import { useRef } from 'react';
import { LoaderCircle, Upload, XCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import type { GuildSnapshot } from '@/hooks/useGuildSnapshot';
import { useLatestGuildExport } from '@/hooks/useLatestGuildExport';
import { EXPORTS_PATH_HINT } from '@/services/localFiles/guildExports';

type GuildImportPanelProps = Pick<
  GuildSnapshot,
  | 'error'
  | 'storageMessage'
  | 'onFileChange'
  | 'importFile'
  | 'isImporting'
  | 'fileName'
> & {
  importUnlocked: boolean;
};

export function GuildImportPanel({
  importUnlocked,
  error,
  storageMessage,
  onFileChange,
  importFile,
  isImporting,
  fileName,
}: GuildImportPanelProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const latestExport = useLatestGuildExport(importFile);
  const busy = isImporting || latestExport.isReadingExport;
  const importError = latestExport.error || error;

  return (
    <>
      <div className="mt-7 ml-[74px] flex flex-wrap items-center gap-2.5 max-[900px]:ml-0 max-[620px]:items-stretch">
        {importUnlocked && (
          <>
            <input
              ref={inputRef}
              type="file"
              accept="application/json,.json"
              onChange={onFileChange}
              hidden
            />
            <Button
              className="h-auto gap-[9px] rounded-[13px] border border-transparent px-[18px] py-[13px] text-base font-semibold shadow-sm transition-colors duration-200 [&_svg]:size-auto max-[620px]:w-full"
              onClick={latestExport.importLatest}
              disabled={busy}
            >
              {busy ? (
                <LoaderCircle size={19} className="animate-spin" />
              ) : (
                <Upload size={19} />
              )}
              {busy ? 'Importando...' : 'Importar JSON mais recente'}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                latestExport.clearError();
                inputRef.current?.click();
              }}
              disabled={busy}
              className="max-[620px]:w-full"
            >
              Escolher arquivo
            </Button>
            <Button asChild variant="outline" className="max-[620px]:w-full">
              <a
                href={`${import.meta.env.BASE_URL}rocket-export-helper.zip`}
                download
              >
                Baixar leitor local
              </a>
            </Button>
          </>
        )}
      </div>
      {importUnlocked && (
        <div className="mt-3 ml-[74px] space-y-1 text-xs text-secondary-foreground max-[900px]:ml-0">
          <p>
            Com o leitor local ativo, cada clique importa o JSON mais recente
            deste computador.
          </p>
          <p>
            Na primeira vez, baixe o leitor, extraia o ZIP e abra
            start-local-exports.cmd. Requer Node.js 22.13+ ou 24+.
          </p>
          <code className="block break-all text-muted-foreground">
            {EXPORTS_PATH_HINT}
          </code>
          {fileName && <p>Arquivo carregado: {fileName}</p>}
        </div>
      )}
      {importError && (
        <Alert
          variant="destructive"
          className="mt-3.5 ml-[74px] flex max-w-[700px] items-center gap-2 rounded-xl border-primary bg-card px-3.5 py-3 text-foreground max-[900px]:ml-0 [&>svg]:static [&>svg]:size-[18px] [&>svg]:translate-y-0 [&>svg]:text-primary-hover [&_[data-slot=alert-description]]:text-foreground"
        >
          <XCircle size={18} />
          <AlertDescription className="text-inherit">
            {importError}
          </AlertDescription>
        </Alert>
      )}
      {storageMessage && (
        <p
          className="mt-2.5 ml-[74px] text-xs text-muted-foreground max-[900px]:ml-0"
          aria-live="polite"
        >
          {storageMessage}
        </p>
      )}
    </>
  );
}
