import mongoose from 'mongoose';
import { env } from './env.js';
import * as models from '../models/index.js';

export async function connectDb() {
  await mongoose.connect(env.MONGO_URI);
  // Slot uniqueness must be enforced before the API accepts the first booking.
  await Promise.all(Object.values(models).map((model) => model.init()));
}
