import { createServer } from 'node:http';
import {
  LocalExportError,
  readLatestLocalExport,
  resolveExportsDirectory,
} from './reader.ts';

export const LOCAL_EXPORT_PORT = 47631;
export const DEFAULT_ALLOWED_ORIGINS = [
  'https://rocket-guild-ranking.vercel.app',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:4173',
  'http://127.0.0.1:4173',
];

interface LocalExportServerOptions {
  directory?: string;
  allowedOrigins?: string[];
}

export function createLocalExportServer(
  options: LocalExportServerOptions = {},
) {
  const directory = options.directory ?? resolveExportsDirectory();
  const allowedOrigins = new Set(
    options.allowedOrigins ?? DEFAULT_ALLOWED_ORIGINS,
  );

  return createServer(async (request, response) => {
    response.setHeader('Cache-Control', 'no-store');
    response.setHeader('Vary', 'Origin');
    const origin = request.headers.origin;
    if (!origin || !allowedOrigins.has(origin)) {
      response.writeHead(403, {
        'Content-Type': 'application/json; charset=utf-8',
      });
      response.end(
        JSON.stringify({
          error: 'Este site não está autorizado a acessar o leitor local.',
        }),
      );
      return;
    }
    const port = response.socket?.localPort;
    if (
      request.headers.host !== `127.0.0.1:${port}` &&
      request.headers.host !== `localhost:${port}`
    ) {
      response.writeHead(403);
      response.end();
      return;
    }
    response.setHeader('Access-Control-Allow-Origin', origin);
    response.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    response.setHeader(
      'Access-Control-Allow-Headers',
      'X-Rocket-Export-Request',
    );
    response.setHeader('Access-Control-Allow-Private-Network', 'true');
    response.setHeader('Content-Type', 'application/json; charset=utf-8');
    if (request.method === 'OPTIONS') {
      response.writeHead(204);
      response.end();
      return;
    }
    if (request.method !== 'GET') {
      response.writeHead(405, { Allow: 'GET, OPTIONS' });
      response.end(JSON.stringify({ error: 'Método não permitido.' }));
      return;
    }
    const url = new URL(request.url ?? '/', 'http://127.0.0.1');
    if (url.pathname !== '/latest-guild-export') {
      response.writeHead(404);
      response.end(JSON.stringify({ error: 'Endpoint não encontrado.' }));
      return;
    }
    const at = url.searchParams.get('at');
    if (
      !at ||
      !/^\d+$/.test(at) ||
      !Number.isSafeInteger(Number(at)) ||
      [...url.searchParams.keys()].some((key) => key !== 'at')
    ) {
      response.writeHead(400);
      response.end(
        JSON.stringify({ error: 'O instante da importação é inválido.' }),
      );
      return;
    }
    if (request.headers['x-rocket-export-request'] !== 'latest') {
      response.writeHead(400);
      response.end(
        JSON.stringify({ error: 'Requisição de importação inválida.' }),
      );
      return;
    }
    try {
      const file = await readLatestLocalExport(
        directory,
        Math.min(Number(at), Date.now()),
      );
      response.writeHead(200);
      response.end(JSON.stringify(file));
    } catch (error) {
      response.writeHead(
        error instanceof LocalExportError ? error.status : 500,
      );
      response.end(
        JSON.stringify({
          error:
            error instanceof LocalExportError
              ? error.message
              : 'Não foi possível ler o export local.',
        }),
      );
    }
  });
}
