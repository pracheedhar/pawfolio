import type { RequestHandler } from 'express';
import * as authService from '../services/auth.js';
import * as resources from '../services/resources.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { respond } from '../utils/helpers.js';
import { cookieOptions } from '../middleware/auth.js';
export const authentication = (mode: 'register' | 'login'): RequestHandler =>
  asyncHandler(async (req, res) => {
    const user = await authService[mode](req.body);
    res.cookie('token', authService.tokenFor(user.id), cookieOptions);
    respond(
      res,
      user,
      mode === 'register' ? 'Account created' : 'Logged in',
      mode === 'register' ? 201 : 200,
    );
  });
export const me = asyncHandler(async (req, res) => respond(res, await resources.currentUser(req)));
export const profile = asyncHandler(async (req, res) =>
  respond(res, await resources.updateProfile(req), 'Profile saved'),
);
export const logout: RequestHandler = (_req, res) => {
  res.clearCookie('token', cookieOptions);
  respond(res, null, 'Logged out');
};
export const deleteAccount = asyncHandler(async (req, res) => {
  await resources.deleteAccount(req);
  res.clearCookie('token', cookieOptions);
  respond(res, null, 'Account deleted');
});
export const crud = (
  resource: resources.Resource,
  action: 'list' | 'get' | 'create' | 'update' | 'remove',
) =>
  asyncHandler(async (req, res) => {
    const result = await resources[action](resource, req);
    respond(
      res,
      result ?? null,
      action === 'remove' ? 'Deleted' : 'OK',
      action === 'create' ? 201 : 200,
    );
  });
export const availability = asyncHandler(async (req, res) =>
  respond(res, await resources.availability(req.params.id, String(req.query.date))),
);
export const pay = asyncHandler(async (req, res) =>
  respond(res, await resources.pay(req), 'Demo confirmation completed. No money charged.', 201),
);
export const like = asyncHandler(async (req, res) => respond(res, await resources.toggleLike(req)));
export const readAll = asyncHandler(async (req, res) => {
  await resources.markAllRead(req);
  respond(res, null, 'All notifications read');
});
export const uploadImage = asyncHandler(async (req, res) =>
  respond(res, await resources.saveUpload(req), 'Image uploaded', 201),
);
