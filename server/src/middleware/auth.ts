import type { RequestHandler, CookieOptions } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { User } from '../models/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
export const cookieOptions: CookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
};
export const auth = asyncHandler(async (req, _res, next) => {
  let subject: string;
  try {
    const payload = jwt.verify(req.cookies.token ?? '', env.JWT_SECRET);
    if (typeof payload === 'string' || !payload.sub) throw new Error();
    subject = payload.sub;
  } catch {
    throw new ApiError(401, 'Please log in');
  }
  const user = await User.findById(subject);
  if (!user) throw new ApiError(401, 'Please log in');
  req.user = { _id: user._id, role: user.role as 'user' | 'admin' };
  next();
});
export const admin: RequestHandler = (req, _res, next) =>
  req.user?.role === 'admin' ? next() : next(new ApiError(403, 'Administrator access required'));
