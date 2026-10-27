import multer from 'multer';
import { randomUUID } from 'node:crypto';
import { mkdir, unlink, readFile } from 'node:fs/promises';
import path from 'node:path';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

const extensions: Record<string, string> = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp' };
// Storage is isolated here so a remote provider can replace disk storage later.
export const storage = {
  async remove(filename: string) { await unlink(path.join(env.UPLOAD_DIR, path.basename(filename))).catch((error: NodeJS.ErrnoException) => { if (error.code !== 'ENOENT') throw error; }); },
  async verify(file: Express.Multer.File) {
    const bytes = await readFile(file.path);
    const valid = file.mimetype === 'image/png' ? bytes.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10])) : file.mimetype === 'image/jpeg' ? bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255 : bytes.subarray(0,4).toString() === 'RIFF' && bytes.subarray(8,12).toString() === 'WEBP';
    if (!valid) { await storage.remove(file.filename); throw new ApiError(400, 'Invalid image content'); }
  },
};
export const upload = multer({
  storage: multer.diskStorage({ destination: (_req, _file, cb) => { mkdir(env.UPLOAD_DIR, { recursive: true }).then(() => cb(null, env.UPLOAD_DIR), error => cb(error, '')); }, filename: (_req, file, cb) => cb(null, randomUUID() + extensions[file.mimetype]) }),
  limits: { fileSize: env.UPLOAD_MAX_BYTES, files: 1 },
  fileFilter: (_req, file, cb) => extensions[file.mimetype] ? cb(null, true) : cb(new ApiError(400, 'Upload a JPEG, PNG, or WebP image')),
});
