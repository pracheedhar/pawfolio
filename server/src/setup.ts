import mongoose from 'mongoose';
import { env } from './config/env.js';
import { connectDb } from './config/db.js';
import { administratorSchema, setupProduction } from './services/productionSetup.js';

if (env.NODE_ENV !== 'production')
  throw new Error('Use this command only on your production service');
const admin = administratorSchema.parse(process.env);
try {
  await connectDb();
  const result = await setupProduction(admin);
  console.log(
    `Production setup complete. Administrator ${result.administratorCreated ? 'created' : 'preserved'}; catalog initialized. No demo users, posts, or reminders added.`,
  );
} finally {
  await mongoose.disconnect();
}
