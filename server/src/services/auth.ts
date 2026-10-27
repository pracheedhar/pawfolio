import bcrypt from 'bcryptjs';
import jwt, { type SignOptions } from 'jsonwebtoken';
import { User } from '../models/index.js';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';
export const register = async (body: { name: string; email: string; password: string }) => User.create({ ...body, password: await bcrypt.hash(body.password, 12) });
export const login = async (body: { email: string; password: string }) => {
  const user = await User.findOne({ email: body.email }).select('+password');
  if (!user || !(await bcrypt.compare(body.password, user.password))) throw new ApiError(401, 'Invalid email or password');
  return user;
};
export const tokenFor = (id: string) => jwt.sign({}, env.JWT_SECRET, { subject: id, expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'] });
