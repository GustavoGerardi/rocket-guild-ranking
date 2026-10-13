import type { LocalGuildExport } from '../../types/localExport.ts';

export const EXPORTS_PATH_HINT =
  '%APPDATA%\\PokeAlliance\\PokeAllianceV3\\exports';
const LOCAL_READER_URL = 'http://127.0.0.1:47631/latest-guild-export';

export async function fetchLatestGuildExport(now: number): Promise<File> {
  let response: Response;
  try {
    response = await fetch(`${LOCAL_READER_URL}?at=${now}`, {
      cache: 'no-store',
      headers: { 'X-Rocket-Export-Request': 'latest' },
      signal: AbortSignal.timeout(10000),
    });
  } catch {
    throw new Error(
      'Não foi possível conectar ao leitor local. Inicie-o neste computador e permita o acesso à rede local no navegador.',
    );
  }

  const payload: unknown = await response.json();
  if (!response.ok) {
    const message =
      payload &&
      typeof payload === 'object' &&
      'error' in payload &&
      typeof payload.error === 'string'
        ? payload.error
        : 'Não foi possível buscar o último export do PokeAlliance.';
    throw new Error(message);
  }
  if (
    !payload ||
    typeof payload !== 'object' ||
    !('name' in payload) ||
    typeof payload.name !== 'string' ||
    !('lastModified' in payload) ||
    typeof payload.lastModified !== 'number' ||
    !Number.isFinite(payload.lastModified) ||
    payload.lastModified > now ||
    !('content' in payload) ||
    typeof payload.content !== 'string' ||
    !payload.name.toLowerCase().endsWith('.json')
  ) {
    throw new Error('O leitor local retornou um export inválido.');
  }
  const file = payload as LocalGuildExport;
  return new File([file.content], file.name, {
    type: 'application/json',
    lastModified: file.lastModified,
  });
}
