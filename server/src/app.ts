import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import mongoose from 'mongoose';
import { env } from './config/env.js';
import { router } from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { rateLimiter } from './middleware/rateLimiter.js';
import { validate, routeSchema } from './middleware/validate.js';
import { ApiError } from './utils/ApiError.js';
import { respond } from './utils/helpers.js';
import { openapi } from './config/openapi.js';

export const app = express();
app.disable('x-powered-by');
app.use(
  helmet(),
  cors({ origin: env.CLIENT_URL, credentials: true }),
  compression(),
  cookieParser(),
  express.json({ limit: '100kb' }),
);
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
// Cookie-authenticated mutations must originate from the configured frontend.
app.use((req, _res, next) => {
  if (
    !['GET', 'HEAD', 'OPTIONS'].includes(req.method) &&
    req.headers.origin &&
    req.headers.origin !== env.CLIENT_URL
  )
    return next(new ApiError(403, 'Origin not allowed'));
  if (
    !['GET', 'HEAD', 'OPTIONS'].includes(req.method) &&
    req.headers['sec-fetch-site'] === 'cross-site'
  )
    return next(new ApiError(403, 'Cross-site mutation not allowed'));
  next();
});
app.get('/api/health', validate(routeSchema()), (_req, res) =>
  respond(
    res,
    { database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' },
    'Healthy',
    mongoose.connection.readyState === 1 ? 200 : 503,
  ),
);
app.get('/api/openapi.json', validate(routeSchema()), (_req, res) => respond(res, openapi));
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openapi));
app.use(
  '/uploads',
  express.static(env.UPLOAD_DIR, {
    dotfiles: 'deny',
    setHeaders: (res) => {
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
      res.setHeader('X-Content-Type-Options', 'nosniff');
    },
  }),
);
app.use('/api/v1', rateLimiter, router);
app.use((_req, _res, next) => next(new ApiError(404, 'Route not found')));
app.use(errorHandler);
