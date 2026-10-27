import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { randomBytes } from 'node:crypto';
import { connectDb } from './config/db.js';
import { env } from './config/env.js';
import { User, Category, Service, Post, Notification, Booking, Payment, Upload } from './models/index.js';
import { discoverCategories, vetServices, trainingServices, groomingServices, profilePosts } from './data/legacy.js';

if (env.NODE_ENV === 'production') throw new Error('Seed is disabled in production');
await connectDb();
try {
  for (const model of [User, Category, Service, Post, Notification, Booking, Payment, Upload]) await model.init();
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || randomBytes(18).toString('base64url');
  const userPassword = process.env.SEED_USER_PASSWORD || randomBytes(18).toString('base64url');
  const upsertUser = async (email: string, name: string, password: string, role: 'user' | 'admin') => User.findOneAndUpdate({ email }, { $setOnInsert: { name, email, password: await bcrypt.hash(password, 12), role, avatar: 'https://i1-e.pinimg.com/1200x/2b/6f/87/2b6f8700f08024520fff07d1e2ddd3a2.jpg', bio: 'Dog lover | Coffee addict | Exploring the world one bark at a time. 🌍🐶' } }, { upsert: true, new: true });
  await upsertUser(process.env.SEED_ADMIN_EMAIL || 'admin@pawfolio.example', 'Pawfolio Admin', adminPassword, 'admin');
  const ocean = await upsertUser(process.env.SEED_USER_EMAIL || 'ocean@pawfolio.example', 'Ocean', userPassword, 'user');
  for (const { id, ...category } of discoverCategories) await Category.updateOne({ _id: id }, { $setOnInsert: category }, { upsert: true });
  for (const [category, services] of [['veterinarian', vetServices], ['training', trainingServices], ['grooming', groomingServices]] as const) {
    for (const { id, ...service } of services) await Service.updateOne({ _id: id }, { $setOnInsert: { ...service, category, price: 8500 } }, { upsert: true });
  }
  for (const post of profilePosts) await Post.updateOne({ owner: ocean._id, image: post.image }, { $setOnInsert: { image: post.image, caption: '', likes: [] } }, { upsert: true });
  for (const [title, desc] of [
    ['Vet Appointment', 'Dr. Smith scheduled for Max — Tomorrow 10:00 AM'],
    ['Grooming Session', "Bella's grooming confirmed at PawSpa — Fri 2:00 PM"],
    ['Vet Follow-up', 'Vaccination booster due for Max next week'],
    ['Training Class', 'Agility training with Coach Alex — Sat 9:00 AM'],
    ['Medic Reminder', 'Flea & tick medicine due for Bella this Sunday'],
  ]) await Notification.updateOne({ owner: ocean._id, title }, { $setOnInsert: { desc, read: false } }, { upsert: true });
  console.log('Seed complete (existing records/passwords preserved). On first seed, sample credentials:');
  console.log(`Admin: ${process.env.SEED_ADMIN_EMAIL || 'admin@pawfolio.example'} / ${adminPassword}`);
  console.log(`User: ${process.env.SEED_USER_EMAIL || 'ocean@pawfolio.example'} / ${userPassword}`);
} finally { await mongoose.disconnect(); }
