import { app } from './app.js';
import { connectDb } from './config/db.js';
import { env } from './config/env.js';
import mongoose from 'mongoose';
await connectDb();
const server = app.listen(env.PORT, () => console.log(`Pawfolio API listening on ${env.PORT}`));
for (const signal of ['SIGTERM', 'SIGINT'])
  process.on(signal, () => {
    server.close(() => {
      mongoose.disconnect().finally(() => process.exit(0));
    });
  });
