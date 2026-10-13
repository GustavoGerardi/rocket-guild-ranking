import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdtemp, mkdir, rm, utimes, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, dirname, join, resolve } from 'node:path';
import { request } from 'node:http';
import { findLatestJsonFile } from '../src/utils/latestExport.ts';
import {
  readLatestLocalExport,
  resolveExportsDirectory,
} from '../scripts/local-exports/reader.ts';
import {
  createLocalExportServer,
  DEFAULT_ALLOWED_ORIGINS,
} from '../scripts/local-exports/server.ts';
import { fetchLatestGuildExport } from '../src/services/localFiles/guildExports.ts';
import type { AddressInfo } from 'node:net';

const now = Date.UTC(2026, 9, 13, 12);

async function removeTestDirectory(directory: string) {
  const target = resolve(directory);
  assert.equal(dirname(target), resolve(tmpdir()));
  assert.ok(basename(target).startsWith('rocket-export-test-'));
  await rm(target, { recursive: true, force: true });
}

test('selects the newest JSON at the click cutoff, filters future files and deterministically breaks ties', () => {
  const old = { name: 'z-old.json', lastModified: now - 1000 };
  const newest = { name: 'a-latest.JSON', lastModified: now };
  const future = { name: 'future.json', lastModified: now + 1 };
  const candidates = [
    old,
    newest,
    future,
    { name: 'notes.txt', lastModified: now },
    { name: 'bad.json', lastModified: NaN },
  ];
  assert.equal(findLatestJsonFile(candidates, now), newest);
  assert.equal(findLatestJsonFile([...candidates].reverse(), now), newest);
  assert.equal(findLatestJsonFile(candidates, now + 1), future);
  assert.equal(findLatestJsonFile([], now), null);
  const tie = { name: 'b-latest.json', lastModified: now };
  assert.equal(findLatestJsonFile([tie, newest], now), tie);
});

test('uses each Windows profile, including redirected APPDATA and a user-home fallback', () => {
  assert.equal(
    resolveExportsDirectory(join('D:', 'Profiles', 'Other User', 'Roaming')),
    join(
      'D:',
      'Profiles',
      'Other User',
      'Roaming',
      'PokeAlliance',
      'PokeAllianceV3',
      'exports',
    ),
  );
  assert.equal(
    resolveExportsDirectory('', join('C:', 'Users', 'Different User')),
    join(
      'C:',
      'Users',
      'Different User',
      'AppData',
      'Roaming',
      'PokeAlliance',
      'PokeAllianceV3',
      'exports',
    ),
  );
});

async function createExport(
  directory: string,
  name: string,
  timestamp: number,
  content = '{}',
) {
  const path = join(directory, name);
  await writeFile(path, content);
  await utimes(path, timestamp / 1000, timestamp / 1000);
}

test('reads real files again on every click and leaves invalid JSON validation to the app', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'rocket-export-test-'));
  try {
    await createExport(directory, 'old.json', now - 1000, '{"members":[]}');
    await createExport(directory, 'notes.txt', now);
    await createExport(directory, 'future.json', now + 60000);
    await mkdir(join(directory, 'nested'));
    await createExport(join(directory, 'nested'), 'nested.json', now);
    assert.equal(
      (await readLatestLocalExport(directory, now)).name,
      'old.json',
    );
    await createExport(directory, 'new.JSON', now, '{invalid');
    const latest = await readLatestLocalExport(directory, now);
    assert.deepEqual(latest, {
      name: 'new.JSON',
      lastModified: now,
      content: '{invalid',
    });
    await createExport(directory, 'old.json', now + 1000, 'updated');
    assert.equal(
      (await readLatestLocalExport(directory, now + 1000)).content,
      'updated',
    );
  } finally {
    await removeTestDirectory(directory);
  }
});

test('reports empty, missing and future-only export folders without reusing cached data', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'rocket-export-test-'));
  try {
    await assert.rejects(
      readLatestLocalExport(join(directory, 'missing'), now),
      /não foi encontrada/,
    );
    await assert.rejects(readLatestLocalExport(directory, now), /Nenhum JSON/);
    await createExport(directory, 'future.json', now + 1000);
    await assert.rejects(readLatestLocalExport(directory, now), /Nenhum JSON/);
  } finally {
    await removeTestDirectory(directory);
  }
});

test('local HTTP service accepts the published site, resists other origins, and exposes only latest exports', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'rocket-export-test-'));
  const server = createLocalExportServer({ directory });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  const headers = {
    Origin: DEFAULT_ALLOWED_ORIGINS[0],
    'X-Rocket-Export-Request': 'latest',
  };
  try {
    await createExport(directory, 'guild.json', now, '{"guild":"Rocket"}');
    let response = await fetch(`${base}/latest-guild-export?at=${now}`, {
      headers,
    });
    assert.equal(response.status, 200);
    assert.equal(
      response.headers.get('access-control-allow-origin'),
      DEFAULT_ALLOWED_ORIGINS[0],
    );
    assert.equal(response.headers.get('cache-control'), 'no-store');
    assert.deepEqual(await response.json(), {
      name: 'guild.json',
      lastModified: now,
      content: '{"guild":"Rocket"}',
    });
    await createExport(directory, 'new.json', now + 1000, 'second');
    response = await fetch(`${base}/latest-guild-export?at=${now + 1000}`, {
      headers,
    });
    assert.equal((await response.json()).name, 'new.json');
    response = await fetch(`${base}/latest-guild-export?at=${now}`, {
      headers: { ...headers, Origin: 'https://untrusted.example' },
    });
    assert.equal(response.status, 403);
    assert.equal(response.headers.get('access-control-allow-origin'), null);
    assert.equal(
      (await fetch(`${base}/latest-guild-export?at=${now}`)).status,
      403,
    );
    assert.equal(
      (
        await fetch(`${base}/latest-guild-export?at=${now}`, {
          headers,
          method: 'OPTIONS',
        })
      ).status,
      204,
    );
    assert.equal(
      (
        await fetch(`${base}/latest-guild-export?at=${now}`, {
          headers,
          method: 'POST',
        })
      ).status,
      405,
    );
    assert.equal((await fetch(`${base}/other`, { headers })).status, 404);
    assert.equal(
      (await fetch(`${base}/latest-guild-export?at=invalid`, { headers }))
        .status,
      400,
    );
    assert.equal(
      (
        await fetch(`${base}/latest-guild-export?at=${now}&path=other`, {
          headers,
        })
      ).status,
      400,
    );
    assert.equal(
      (
        await fetch(`${base}/latest-guild-export?at=${now}`, {
          headers: { Origin: DEFAULT_ALLOWED_ORIGINS[0] },
        })
      ).status,
      400,
    );
    const wrongHostStatus = await new Promise<number | undefined>(
      (resolveRequest, reject) => {
        const outgoing = request(
          `${base}/latest-guild-export?at=${now}`,
          { headers: { ...headers, Host: 'untrusted.example' } },
          (incoming) => {
            incoming.resume();
            incoming.on('end', () => resolveRequest(incoming.statusCode));
          },
        );
        outgoing.on('error', reject);
        outgoing.end();
      },
    );
    assert.equal(wrongHostStatus, 403);
  } finally {
    await new Promise<void>((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    );
    await removeTestDirectory(directory);
  }
});

test('client passes the click cutoff, disables caching and preserves file content and metadata', async (t) => {
  t.mock.method(
    globalThis,
    'fetch',
    async (input: string, init: RequestInit) => {
      assert.equal(new URL(input).searchParams.get('at'), String(now));
      assert.equal(init.cache, 'no-store');
      assert.deepEqual(init.headers, { 'X-Rocket-Export-Request': 'latest' });
      return new Response(
        JSON.stringify({
          name: 'guild.json',
          lastModified: now,
          content: '{"members":[]}',
        }),
      );
    },
  );
  const file = await fetchLatestGuildExport(now);
  assert.equal(file.name, 'guild.json');
  assert.equal(file.lastModified, now);
  assert.equal(await file.text(), '{"members":[]}');
});

test('client surfaces server errors, disconnected helpers and invalid or future responses', async (t) => {
  t.mock.method(
    globalThis,
    'fetch',
    async () =>
      new Response(JSON.stringify({ error: 'Nenhum export' }), { status: 404 }),
  );
  await assert.rejects(fetchLatestGuildExport(now), /Nenhum export/);
  t.mock.method(globalThis, 'fetch', async () => {
    throw new TypeError('Connection refused');
  });
  await assert.rejects(
    fetchLatestGuildExport(now),
    /Inicie-o neste computador/,
  );
  for (const payload of [
    {},
    { name: 'future.json', lastModified: now + 1, content: '{}' },
    { name: 'notes.txt', lastModified: now, content: '{}' },
  ]) {
    t.mock.method(
      globalThis,
      'fetch',
      async () => new Response(JSON.stringify(payload)),
    );
    await assert.rejects(fetchLatestGuildExport(now), /export inválido/);
  }
});
