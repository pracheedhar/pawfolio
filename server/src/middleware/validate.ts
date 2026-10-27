import { z } from 'zod';
import type { RequestHandler } from 'express';

export const validate = (schema: z.ZodObject): RequestHandler => (req, _res, next) => {
  const parsed = schema.safeParse({ body: req.body ?? {}, params: req.params, query: req.query });
  if (!parsed.success) return next(parsed.error);
  req.body = parsed.data.body;
  req.params = parsed.data.params;
  req.query = parsed.data.query;
  next();
};
export const routeSchema = (body: z.ZodObject = z.object({}).strict(), params: z.ZodObject = z.object({}).strict(), query: z.ZodObject = z.object({}).strict()) => z.object({ body, params, query });
