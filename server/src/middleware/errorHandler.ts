import type { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { MulterError } from 'multer';
import mongoose from 'mongoose';
import { ApiError } from '../utils/ApiError.js';
export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  let status = error instanceof ApiError ? error.status : 500;
  let message = status === 500 ? 'An unexpected error occurred' : error.message;
  if (error instanceof ZodError) {
    status = 400;
    message = error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
  }
  if (
    error instanceof mongoose.Error.ValidationError ||
    error instanceof mongoose.Error.CastError ||
    error instanceof SyntaxError
  ) {
    status = 400;
    message = 'Invalid request';
  }
  if (error instanceof MulterError) {
    status = 400;
    message = error.message;
  }
  if (error instanceof mongoose.Error.VersionError) {
    status = 409;
    message = 'Record changed; refresh and try again';
  }
  if (error?.status === 413) {
    status = 413;
    message = 'Request body too large';
  }
  if (error?.code === 11000) {
    status = 409;
    message = 'A record already exists or that appointment slot is unavailable';
  }
  if (status === 500) console.error(error);
  res.status(status).json({ success: false, message, data: null });
};
