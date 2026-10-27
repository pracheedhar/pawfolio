import { MongoMemoryServer } from 'mongodb-memory-server';
import { randomBytes } from 'node:crypto';
import { spawn } from 'node:child_process';

// Disposable development database: useful when MongoDB is not installed locally.
const mongo = await MongoMemoryServer.create();
const childEnv = {
  ...process.env,
  NODE_ENV: 'development',
  MONGO_URI: mongo.getUri(),
  JWT_SECRET: randomBytes(48).toString('hex'),
};
const run = (args: string[]) =>
  spawn(process.execPath, ['--import', 'tsx', ...args], { env: childEnv, stdio: 'inherit' });
const seed = run(['src/seed.ts']);
const seeded = await new Promise((resolve) => seed.on('exit', resolve));
if (seeded !== 0) {
  await mongo.stop();
  process.exit(1);
}
const server = run(['src/server.ts']);
const cleanup = async () => {
  server.kill('SIGTERM');
  await mongo.stop();
};
for (const signal of ['SIGINT', 'SIGTERM'])
  process.once(signal, () => {
    cleanup().finally(() => process.exit(0));
  });
server.once('exit', () => {
  mongo.stop().finally(() => process.exit(0));
});
