import 'dotenv/config';
import { z } from 'zod';

export const environmentSchema = z
  .object({
    PORT: z.coerce.number().int().min(1).max(65535).default(4000),
    MONGO_URI: z.string().regex(/^mongodb(?:\+srv)?:\/\/\S+$/, 'Use a MongoDB connection string'),
    JWT_SECRET: z.string().min(32),
    JWT_EXPIRES_IN: z
      .string()
      .regex(/^\d+[smhd]$/)
      .default('7d'),
    CLIENT_URL: z.string().url().default('http://localhost:5173'),
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PROXY_SECRET: z.string().min(32).optional(),
    TRUST_PROXY_HOPS: z.coerce.number().int().min(0).max(5).default(0),
    UPLOAD_DIR: z.string().default('uploads'),
    UPLOAD_MAX_BYTES: z.coerce
      .number()
      .int()
      .positive()
      .default(5 * 1024 * 1024),
    UPLOAD_PROVIDER: z.literal('local').default('local'),
  })
  .superRefine((value, context) => {
    const origin = new URL(value.CLIENT_URL);
    if (origin.origin !== value.CLIENT_URL)
      context.addIssue({
        code: 'custom',
        path: ['CLIENT_URL'],
        message: 'Use an origin without a path or trailing slash',
      });
    if (value.NODE_ENV !== 'production') return;
    if (!value.PROXY_SECRET)
      context.addIssue({
        code: 'custom',
        path: ['PROXY_SECRET'],
        message: 'Set the shared Vercel/Render proxy secret for production',
      });
    if (origin.protocol !== 'https:')
      context.addIssue({
        code: 'custom',
        path: ['CLIENT_URL'],
        message: 'Production requires an HTTPS frontend origin',
      });
    if (/replace-with|paste-|your[-_]?(secret|generated)/i.test(value.JWT_SECRET))
      context.addIssue({
        code: 'custom',
        path: ['JWT_SECRET'],
        message: 'Generate a real production signing secret',
      });
  });

export const env = environmentSchema.parse(process.env);
