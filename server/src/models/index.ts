import { Schema, model, type InferSchemaType } from 'mongoose';

const options = { timestamps: true, toJSON: { virtuals: true, transform: (_doc: unknown, ret: Record<string, unknown>) => { delete ret.__v; delete ret.password; return ret; } } };
const ref = (name: string) => ({ type: Schema.Types.ObjectId, ref: name, required: true, index: true });
const userSchema = new Schema({
  name: { type: String, required: true, trim: true, maxlength: 80 },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, select: false },
  avatar: { type: String, default: '' }, bio: { type: String, default: '', maxlength: 500 },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  followers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  following: [{ type: Schema.Types.ObjectId, ref: 'User' }],
}, options);
export type IUser = InferSchemaType<typeof userSchema>;
export const User = model('User', userSchema);
const categorySchema = new Schema({ _id: String, title: { type: String, required: true }, image: { type: String, required: true }, path: { type: String, required: true } }, options);
export type ICategory = InferSchemaType<typeof categorySchema>;
export const Category = model('Category', categorySchema);
const serviceSchema = new Schema({ _id: String, name: { type: String, required: true, index: true }, image: { type: String, required: true }, category: { type: String, ref: 'Category', required: true, index: true }, price: { type: Number, min: 0, required: true } }, options);
export type IService = InferSchemaType<typeof serviceSchema>;
export const Service = model('Service', serviceSchema);
const postSchema = new Schema({ owner: ref('User'), image: { type: String, required: true }, caption: { type: String, default: '', maxlength: 2000 }, likes: [{ type: Schema.Types.ObjectId, ref: 'User' }] }, options);
export type IPost = InferSchemaType<typeof postSchema>;
export const Post = model('Post', postSchema);
const bookingSchema = new Schema({ owner: ref('User'), service: { type: String, ref: 'Service', required: true }, ownerName: { type: String, required: true }, phoneNumber: { type: String, required: true }, email: { type: String, required: true }, date: { type: String, required: true }, time: { type: String, required: true }, price: { type: Number, required: true, min: 0 }, status: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'pending' } }, options);
// A database constraint protects against concurrent requests reserving the same slot.
bookingSchema.index({ service: 1, date: 1, time: 1 }, { unique: true, partialFilterExpression: { status: { $in: ['pending', 'confirmed'] } } });
export type IBooking = InferSchemaType<typeof bookingSchema>;
export const Booking = model('Booking', bookingSchema);
const notificationSchema = new Schema({ owner: ref('User'), title: { type: String, required: true }, desc: { type: String, required: true }, read: { type: Boolean, default: false } }, options);
export type INotification = InferSchemaType<typeof notificationSchema>;
export const Notification = model('Notification', notificationSchema);
const uploadSchema = new Schema({ owner: ref('User'), filename: { type: String, required: true }, url: { type: String, required: true }, mimeType: { type: String, required: true }, size: { type: Number, required: true } }, options);
export type IUpload = InferSchemaType<typeof uploadSchema>;
export const Upload = model('Upload', uploadSchema);
const paymentSchema = new Schema({ owner: ref('User'), booking: { ...ref('Booking'), unique: true }, amount: { type: Number, required: true }, status: { type: String, enum: ['demo-confirmed'], default: 'demo-confirmed' } }, options);
export type IPayment = InferSchemaType<typeof paymentSchema>;
export const Payment = model('Payment', paymentSchema);
