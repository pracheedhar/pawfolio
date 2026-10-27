import type { RequestHandler } from 'express';
// Express 4 needs rejected promises forwarded to the central error handler.
export const asyncHandler =
  (handler: RequestHandler): RequestHandler =>
  (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
