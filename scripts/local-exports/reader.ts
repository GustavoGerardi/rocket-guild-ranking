import { open, readdir, stat } from 'node:fs/promises';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { findLatestJsonFile } from '../../src/utils/latestExport.ts';
import type { LocalGuildExport } from '../../src/types/localExport.ts';

export class LocalExportError extends Error {
  readonly status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export function resolveExportsDirectory(
  appData = process.env.APPDATA,
  userHome = homedir(),
): string {
  return join(
    appData || join(userHome, 'AppData', 'Roaming'),
    'PokeAlliance',
    'PokeAllianceV3',
    'exports',
  );
}

function isMissing(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === 'ENOENT'
  );
}

export async function readLatestLocalExport(
  directory: string,
  now: number,
): Promise<LocalGuildExport> {
  let entries;
  try {
    entries = await readdir(directory, { withFileTypes: true });
  } catch (error) {
    if (isMissing(error))
      throw new LocalExportError(
        'A pasta exports do PokeAlliance não foi encontrada no perfil Windows deste computador.',
        404,
      );
    throw new LocalExportError(
      'Não foi possível ler a pasta exports do PokeAlliance.',
      403,
    );
  }
  const candidates = await Promise.all(
    entries
      .filter(
        (entry) => entry.isFile() && entry.name.toLowerCase().endsWith('.json'),
      )
      .map(async (entry) => {
        try {
          const metadata = await stat(join(directory, entry.name));
          return { name: entry.name, lastModified: metadata.mtimeMs };
        } catch (error) {
          if (isMissing(error)) return null;
          throw new LocalExportError(
            'Não foi possível verificar a data de um export.',
            403,
          );
        }
      }),
  );
  const latest = findLatestJsonFile(
    candidates.filter((candidate) => candidate !== null),
    now,
  );
  if (!latest)
    throw new LocalExportError(
      'Nenhum JSON com data de modificação até o momento deste clique foi encontrado na pasta exports.',
      404,
    );
  try {
    const handle = await open(join(directory, latest.name), 'r');
    try {
      const before = await handle.stat();
      if (
        !before.isFile() ||
        before.mtimeMs !== latest.lastModified ||
        before.mtimeMs > now
      )
        throw new Error('Export changed');
      const content = await handle.readFile('utf8');
      const after = await handle.stat();
      if (after.mtimeMs !== before.mtimeMs || after.size !== before.size)
        throw new Error('Export changed');
      return { ...latest, content };
    } finally {
      await handle.close();
    }
  } catch {
    throw new LocalExportError(
      'O último export mudou ou não pôde ser lido. Clique em importar novamente.',
      409,
    );
  }
}
