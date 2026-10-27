import { z } from 'zod';
import type { Request, RequestHandler } from 'express';

export const validate =
  (schema: z.ZodObject): RequestHandler =>
  (req, _res, next) => {
    const parsed = schema.safeParse({ body: req.body ?? {}, params: req.params, query: req.query });
    if (!parsed.success) return next(parsed.error);
    req.body = parsed.data.body;
    // Route schemas establish the shapes before adapting them to Express's string-based types.
    req.params = parsed.data.params as Request['params'];
    req.query = parsed.data.query as Request['query'];
    next();
  };
export const routeSchema = (
  body: z.ZodObject = z.object({}).strict(),
  params: z.ZodObject = z.object({}).strict(),
  query: z.ZodObject = z.object({}).strict(),
) => z.object({ body, params, query });
