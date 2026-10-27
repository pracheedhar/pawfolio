import type { Request } from 'express';
import type { Model, FilterQuery } from 'mongoose';
import { User, Category, Service, Post, Booking, Notification, Upload, Payment } from '../models/index.js';
import { ApiError } from '../utils/ApiError.js';
import { storage } from '../middleware/upload.js';
import { env } from '../config/env.js';

// These heterogeneous models share CRUD behavior; model boundaries remain validated by route schemas.
export const models = { categories: Category, services: Service, posts: Post, bookings: Booking, notifications: Notification, uploads: Upload, payments: Payment };
export type Resource = keyof typeof models;
type RecordData = { _id: unknown; owner?: unknown; [key: string]: unknown };
const modelFor = (resource: Resource) => models[resource] as unknown as Model<RecordData>;
const owned = (resource: Resource) => !['categories', 'services'].includes(resource);
export const scope = (resource: Resource, req: Request): FilterQuery<RecordData> => owned(resource) ? { owner: req.user!._id } : {};
export const get = async (resource: Resource, req: Request) => {
  const item = await modelFor(resource).findOne({ _id: req.params.id, ...scope(resource, req) });
  if (!item) throw new ApiError(404, 'Record not found');
  return item;
};
export const list = async (resource: Resource, req: Request) => {
  const filter = scope(resource, req);
  if (resource === 'services' && req.query.category) filter.category = req.query.category;
  if (req.query.search && ['services', 'posts'].includes(resource)) filter[resource === 'services' ? 'name' : 'caption'] = { $regex: String(req.query.search).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' };
  const page = Number(req.query.page ?? 1), limit = Number(req.query.limit ?? 20);
  const [items, total] = await Promise.all([modelFor(resource).find(filter).sort({ createdAt: -1, _id: 1 }).skip((page - 1) * limit).limit(limit), modelFor(resource).countDocuments(filter)]);
  return { items, total, page, limit, pages: Math.ceil(total / limit) };
};
export const slots = Array.from({ length: 12 }, (_, i) => `${(i + 8) % 12 || 12}:00 ${i + 8 < 12 ? 'AM' : 'PM'}`);
export const isFutureSlot = (date: string, time: string) => {
  const match = /^(\d+):00 (AM|PM)$/.exec(time)!;
  const hour = Number(match[1]) % 12 + (match[2] === 'PM' ? 12 : 0);
  return new Date(`${date}T${String(hour).padStart(2, '0')}:00:00`).getTime() > Date.now();
};
export const availability = async (id: string, date: string) => {
  if (!await Service.exists({ _id: id })) throw new ApiError(404, 'Service not found');
  const taken = await Booking.find({ service: id, date, status: { $ne: 'cancelled' } });
  return slots.filter(time => isFutureSlot(date, time) && !taken.some(booking => booking.time === time));
};
export const create = async (resource: Resource, req: Request) => {
  const body = { ...req.body };
  if (owned(resource)) body.owner = req.user!._id;
  if (resource === 'categories' || resource === 'services') { body._id = body.id; delete body.id; }
  if (resource === 'services' && !await Category.exists({ _id: body.category })) throw new ApiError(400, 'Category not found');
  if (resource === 'bookings') {
    const service = await Service.findById(body.service);
    if (!service) throw new ApiError(404, 'Service not found');
    if (!isFutureSlot(body.date, body.time)) throw new ApiError(400, 'Choose a future appointment');
    body.price = service.price;
  }
  const item = await modelFor(resource).create(body);
  if (resource === 'bookings') await Notification.create({ owner: req.user!._id, title: 'Booking reserved', desc: `${body.date} at ${body.time}. Complete demo confirmation to confirm.` });
  return item;
};
export const update = async (resource: Resource, req: Request) => {
  const item = await get(resource, req);
  if (resource === 'services' && req.body.category && !await Category.exists({ _id: req.body.category })) throw new ApiError(400, 'Category not found');
  if (resource === 'bookings') {
    if (item.status !== 'pending' && req.body.status !== 'cancelled') throw new ApiError(409, 'Only pending bookings can be rescheduled');
    if (req.body.date || req.body.time) {
      if (item.status !== 'pending') throw new ApiError(409, 'Only pending bookings can be rescheduled');
      if (!isFutureSlot(req.body.date ?? String(item.date), req.body.time ?? String(item.time))) throw new ApiError(400, 'Choose a future appointment');
    }
  }
  Object.assign(item, req.body);
  return item.save();
};
export const remove = async (resource: Resource, req: Request) => {
  const item = await get(resource, req);
  if (resource === 'categories' && await Service.exists({ category: req.params.id })) throw new ApiError(409, 'Remove category services first');
  if (resource === 'services' && await Booking.exists({ service: req.params.id })) throw new ApiError(409, 'Service has booking history');
  if (resource === 'bookings') {
    if (item.status === 'confirmed') throw new ApiError(409, 'Cancel a confirmed booking before deleting it');
    await Payment.deleteMany({ booking: item._id });
  }
  if (resource === 'uploads') await storage.remove(String(item.filename));
  await item.deleteOne();
};
export const pay = async (req: Request) => {
  if (env.NODE_ENV === 'production') throw new ApiError(403, 'Demo payments are unavailable in production; configure a payment provider');
  const booking = await Booking.findOneAndUpdate({ _id: req.params.id, owner: req.user!._id, status: 'pending' }, { status: 'confirmed' }, { new: true });
  if (!booking) throw new ApiError(409, 'Booking is unavailable or already confirmed');
  const payment = await Payment.create({ owner: req.user!._id, booking: booking._id, amount: booking.price });
  await Notification.create({ owner: req.user!._id, title: 'Booking confirmed (demo)', desc: `${booking.date} at ${booking.time}. No money was charged.` });
  return payment;
};
export const deleteAccount = async (req: Request) => {
  const owner = req.user!._id;
  const files = await Upload.find({ owner });
  await Promise.all(files.map(file => storage.remove(file.filename)));
  await Promise.all([Post.deleteMany({ owner }), Booking.deleteMany({ owner }), Notification.deleteMany({ owner }), Upload.deleteMany({ owner }), Payment.deleteMany({ owner }), User.updateMany({}, { $pull: { followers: owner, following: owner } }), Post.updateMany({}, { $pull: { likes: owner } })]);
  await User.deleteOne({ _id: owner });
};
