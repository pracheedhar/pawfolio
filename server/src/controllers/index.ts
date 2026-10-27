import type { RequestHandler } from 'express';
import * as authService from '../services/auth.js';
import * as resources from '../services/resources.js';
import { User, Post, Upload, Notification } from '../models/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { respond } from '../utils/helpers.js';
import { cookieOptions } from '../middleware/auth.js';
import { storage } from '../middleware/upload.js';
import { ApiError } from '../utils/ApiError.js';
export const authentication = (mode: 'register' | 'login'): RequestHandler => asyncHandler(async (req, res) => {
  const user = await authService[mode](req.body);
  res.cookie('token', authService.tokenFor(user.id), cookieOptions);
  respond(res, user, mode === 'register' ? 'Account created' : 'Logged in', mode === 'register' ? 201 : 200);
});
export const me = asyncHandler(async (req, res) => respond(res, await User.findById(req.user!._id)));
export const profile = asyncHandler(async (req, res) => respond(res, await User.findByIdAndUpdate(req.user!._id, req.body, { new: true, runValidators: true }), 'Profile saved'));
export const logout: RequestHandler = (_req, res) => { res.clearCookie('token', cookieOptions); respond(res, null, 'Logged out'); };
export const deleteAccount = asyncHandler(async (req, res) => { await resources.deleteAccount(req); res.clearCookie('token', cookieOptions); respond(res, null, 'Account deleted'); });
export const crud = (resource: resources.Resource, action: 'list' | 'get' | 'create' | 'update' | 'remove') => asyncHandler(async (req, res) => {
  const result = await resources[action](resource, req);
  respond(res, result ?? null, action === 'remove' ? 'Deleted' : 'OK', action === 'create' ? 201 : 200);
});
export const availability = asyncHandler(async (req, res) => respond(res, await resources.availability(req.params.id, String(req.query.date))));
export const pay = asyncHandler(async (req, res) => respond(res, await resources.pay(req), 'Demo confirmation completed. No money charged.', 201));
export const like = asyncHandler(async (req, res) => {
  const post = await Post.findOneAndUpdate({ _id: req.params.id, owner: req.user!._id }, [{ $set: { likes: { $cond: [{ $in: [req.user!._id, '$likes'] }, { $setDifference: ['$likes', [req.user!._id]] }, { $setUnion: ['$likes', [req.user!._id]] }] } } }], { new: true });
  if (!post) throw new ApiError(404, 'Post not found');
  respond(res, post);
});
export const readAll = asyncHandler(async (req, res) => { await Notification.updateMany({ owner: req.user!._id }, { read: true }); respond(res, null, 'All notifications read'); });
export const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'Select an image');
  await storage.verify(req.file);
  try {
    const file = await Upload.create({ owner: req.user!._id, filename: req.file.filename, url: `/uploads/${req.file.filename}`, mimeType: req.file.mimetype, size: req.file.size });
    respond(res, file, 'Image uploaded', 201);
  } catch (error) { await storage.remove(req.file.filename); throw error; }
});
