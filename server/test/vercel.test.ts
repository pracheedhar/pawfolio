import { it, expect } from 'vitest';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '../..');
const load = (overrides: Record<string, string | undefined>) =>
  spawnSync(
    process.execPath,
    [
      '--input-type=module',
      '-e',
      "const {config} = await import('./vercel.mjs'); console.log(JSON.stringify(config));",
    ],
    {
      cwd: root,
      env: {
        ...process.env,
        BACKEND_URL: 'https://pawfolio-api.example',
        PROXY_SECRET: 'private-test-proxy-secret-of-at-least-32-characters',
        ...overrides,
      },
      encoding: 'utf8',
    },
  );
it('keeps API/uploads ahead of SPA fallback and injects a private platform-side header', () => {
  const result = load({});
  expect(result.status).toBe(0);
  const config = JSON.parse(result.stdout);
  expect(config.buildCommand).toBe('npm run build -w client');
  expect(config.outputDirectory).toBe('client/dist');
  expect(config.routes[0].dest).toBe('https://pawfolio-api.example/api/$1');
  expect(config.routes[1].dest).toBe('https://pawfolio-api.example/uploads/$1');
  expect(config.routes[2]).toEqual({ handle: 'filesystem' });
  expect(config.routes[3].dest).toBe('/index.html');
  expect(config.routes[0].transforms[0]).toMatchObject({
    op: 'set',
    args: '$PROXY_SECRET',
    env: ['PROXY_SECRET'],
  });
  expect(result.stdout).not.toContain('private-test-proxy-secret-of-at-least-32-characters');
});
it('fails configuration clearly when the Render origin or shared secret is missing/invalid', () => {
  for (const overrides of [
    { BACKEND_URL: '' },
    { BACKEND_URL: 'http://api.example' },
    { BACKEND_URL: 'https://api.example/' },
    { PROXY_SECRET: '' },
  ]) {
    expect(load(overrides).status).not.toBe(0);
  }
});
