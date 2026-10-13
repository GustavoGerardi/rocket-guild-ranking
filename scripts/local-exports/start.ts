import { parseArgs } from 'node:util';
import {
  createLocalExportServer,
  DEFAULT_ALLOWED_ORIGINS,
  LOCAL_EXPORT_PORT,
} from './server.ts';
import { resolveExportsDirectory } from './reader.ts';

const { values } = parseArgs({
  options: { origin: { type: 'string', multiple: true } },
});
const extraOrigins = (values.origin ?? []).map((value) => {
  const url = new URL(value);
  if (
    url.protocol !== 'https:' &&
    !(
      url.protocol === 'http:' &&
      ['localhost', '127.0.0.1'].includes(url.hostname)
    )
  ) {
    throw new Error('Use uma URL HTTPS para o site publicado.');
  }
  return url.origin;
});
const server = createLocalExportServer({
  allowedOrigins: [...DEFAULT_ALLOWED_ORIGINS, ...extraOrigins],
});
server.on('error', (error) => {
  console.error(`Não foi possível iniciar o leitor local: ${error.message}`);
  process.exitCode = 1;
});
server.listen(LOCAL_EXPORT_PORT, '127.0.0.1', () => {
  console.log(`Leitor Rocket ativo em http://127.0.0.1:${LOCAL_EXPORT_PORT}`);
  console.log(`Pasta de exports: ${resolveExportsDirectory()}`);
  console.log(
    'Mantenha esta janela aberta enquanto usa “Importar JSON mais recente” no site. Ctrl+C encerra o leitor.',
  );
});
