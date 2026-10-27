import type { Response } from 'express';
export const respond = (res: Response, data: unknown = null, message = 'OK', status = 200) =>
  res.status(status).json({ success: true, message, data });
