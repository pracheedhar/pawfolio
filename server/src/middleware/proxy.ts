import type { RequestHandler } from 'express';
import { timingSafeEqual } from 'node:crypto';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

export const proxyGuard: RequestHandler = (req, _res, next) => {
  // Render probes health directly. Local development has no Vercel proxy.
  if (!env.PROXY_SECRET || req.path === '/api/health') return next();
  const supplied = Buffer.from(req.get('x-pawfolio-proxy-secret') || '');
  const expected = Buffer.from(env.PROXY_SECRET);
  if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) {
    return next(new ApiError(403, 'Use the configured frontend to access this service'));
  }
  next();
};
