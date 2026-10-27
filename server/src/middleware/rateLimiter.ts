import rateLimit from 'express-rate-limit';
const message = { success: false, message: 'Too many requests; please try again later', data: null };
export const rateLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 500, standardHeaders: 'draft-7', legacyHeaders: false, message });
export const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, message });
