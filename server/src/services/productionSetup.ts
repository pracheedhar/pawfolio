import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { User } from '../models/index.js';
import { initializeCatalog } from './catalog.js';
import { ApiError } from '../utils/ApiError.js';

export const administratorSchema = z.object({
  ADMIN_EMAIL: z
    .string()
    .email()
    .transform((value) => value.toLowerCase()),
  ADMIN_NAME: z.string().trim().min(2).max(80).default('Pawfolio Admin'),
  ADMIN_PASSWORD: z
    .string()
    .min(12)
    .max(72)
    .refine((value) => Buffer.byteLength(value, 'utf8') <= 72, 'Use at most 72 UTF-8 bytes'),
});

export async function setupProduction(input: z.input<typeof administratorSchema>) {
  const admin = administratorSchema.parse(input);
  const existing = await User.findOne({ email: admin.ADMIN_EMAIL });
  if (existing && existing.role !== 'admin')
    throw new ApiError(
      409,
      'That email belongs to a regular user; choose a dedicated administrator email',
    );
  if (!existing) {
    await User.create({
      name: admin.ADMIN_NAME,
      email: admin.ADMIN_EMAIL,
      password: await bcrypt.hash(admin.ADMIN_PASSWORD, 12),
      role: 'admin',
    });
  }
  await initializeCatalog();
  return { administratorCreated: !existing };
}
