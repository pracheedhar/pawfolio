import { Router, type RequestHandler } from 'express';
import { z } from 'zod';
import * as c from '../controllers/index.js';
import { auth, admin } from '../middleware/auth.js';
import { validate, routeSchema } from '../middleware/validate.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import { upload } from '../middleware/upload.js';
import { slots, type Resource } from '../services/resources.js';

export const router = Router();
const empty = z.object({}).strict();
const id = z.string().regex(/^[a-f\d]{24}$/i);
const slug = z.string().regex(/^[a-z0-9-]{1,80}$/);
const image = z
  .string()
  .max(2048)
  .refine(
    (value) => /^https?:\/\//.test(value) || /^\/uploads\/[a-zA-Z0-9.-]+$/.test(value),
    'Use an image URL',
  );
const email = z
  .string()
  .email()
  .max(254)
  .transform((value) => value.toLowerCase());
const password = z
  .string()
  .min(8)
  .max(72)
  .refine(
    (value) => Buffer.byteLength(value, 'utf8') <= 72,
    'Password must be at most 72 UTF-8 bytes',
  );
const name = z.string().trim().min(2).max(80);
const date = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine(
    (value) =>
      !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value,
    'Invalid date',
  );
const time = z.string().refine((value) => slots.includes(value), 'Invalid time slot');
const pagination = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    search: z.string().max(100).optional(),
    category: slug.optional(),
  })
  .strict();
const params = (schema = id) => z.object({ id: schema }).strict();
const v = (body: z.ZodObject = empty, p: z.ZodObject = empty, q: z.ZodObject = empty) =>
  validate(routeSchema(body, p, q));
router.post(
  '/auth/register',
  authLimiter,
  v(z.object({ name, email, password }).strict()),
  c.authentication('register'),
);
router.post(
  '/auth/login',
  authLimiter,
  v(z.object({ email, password }).strict()),
  c.authentication('login'),
);
router.post('/auth/logout', v(), c.logout);
router.get('/auth/me', auth, v(), c.me);
router.get('/users/me', auth, v(), c.me);
router.patch(
  '/users/me',
  auth,
  v(
    z
      .object({
        name: name.optional(),
        avatar: image.or(z.literal('')).optional(),
        bio: z.string().max(500).optional(),
      })
      .strict(),
  ),
  c.profile,
);
router.delete('/users/me', auth, v(), c.deleteAccount);
router.get(
  '/services/:id/availability',
  v(empty, params(slug), z.object({ date }).strict()),
  c.availability,
);
router.post('/bookings/:id/payment', auth, v(empty, params()), c.pay);
router.post('/posts/:id/like', auth, v(empty, params()), c.like);
router.patch('/notifications/read-all', auth, v(), c.readAll);
const schemas = {
  categories: z
    .object({ id: slug, title: name, image, path: z.enum(['/grooming', '/vets', '/training']) })
    .strict(),
  services: z
    .object({ id: slug, name, image, category: slug, price: z.number().int().min(0).max(10000000) })
    .strict(),
  posts: z.object({ image, caption: z.string().max(2000).default('') }).strict(),
  bookings: z
    .object({
      service: slug,
      ownerName: name,
      phoneNumber: z.string().regex(/^[+\d ()-]{7,20}$/),
      email,
      date,
      time,
    })
    .strict(),
  notifications: z
    .object({ title: name, desc: z.string().min(1).max(1000), read: z.boolean().default(false) })
    .strict(),
};
for (const resource of Object.keys(schemas) as (keyof typeof schemas)[]) {
  const catalog = ['categories', 'services'].includes(resource);
  const read: RequestHandler[] = catalog ? [] : [auth];
  const write = catalog ? [auth, admin] : [auth];
  const resourceParams = params(catalog ? slug : id);
  router.get(`/${resource}`, ...read, v(empty, empty, pagination), c.crud(resource, 'list'));
  router.get(`/${resource}/:id`, ...read, v(empty, resourceParams), c.crud(resource, 'get'));
  router.post(`/${resource}`, ...write, v(schemas[resource]), c.crud(resource, 'create'));
  const patch =
    resource === 'bookings'
      ? schemas.bookings
          .omit({ service: true })
          .partial()
          .extend({ status: z.literal('cancelled').optional() })
      : (schemas[resource] as z.ZodObject).partial().omit(catalog ? { id: true } : {});
  router.patch(`/${resource}/:id`, ...write, v(patch, resourceParams), c.crud(resource, 'update'));
  router.delete(`/${resource}/:id`, ...write, v(empty, resourceParams), c.crud(resource, 'remove'));
}
for (const resource of ['uploads', 'payments'] as Resource[]) {
  router.get(`/${resource}`, auth, v(empty, empty, pagination), c.crud(resource, 'list'));
  router.get(`/${resource}/:id`, auth, v(empty, params()), c.crud(resource, 'get'));
}
router.post('/uploads', auth, v(), upload.single('image'), c.uploadImage);
router.delete('/uploads/:id', auth, v(empty, params()), c.crud('uploads', 'remove'));
