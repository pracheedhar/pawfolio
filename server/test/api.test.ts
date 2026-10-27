import { beforeAll, afterAll, describe, it, expect } from 'vitest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';
import type { Express } from 'express';

let mongo: MongoMemoryServer;
let app: Express;
beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  process.env.MONGO_URI = mongo.getUri();
  process.env.JWT_SECRET = 'test-only-secret-with-at-least-32-characters';
  process.env.NODE_ENV = 'test';
  process.env.UPLOAD_DIR = '/tmp/pawfolio-test-uploads';
  app = (await import('../src/app.js')).app;
  await mongoose.connect(process.env.MONGO_URI);
  const { User, Post, Booking, Category, Service, Payment } = await import('../src/models/index.js');
  await Promise.all([User.init(), Post.init(), Booking.init(), Payment.init()]);
  await Category.create({ _id: 'veterinarian', title: 'Veterinarian', image: 'https://example.com/vet.jpg', path: '/vets' });
  await Service.create({ _id: 'v1', name: 'VetCare', category: 'veterinarian', image: 'https://example.com/vet.jpg', price: 8500 });
}, 120000);
afterAll(async () => { await mongoose.disconnect(); await mongo?.stop(); });
const credentials = { name: 'Test Owner', email: 'owner@example.com', password: 'test-password-123' };
describe('authentication', () => {
  it('validates registration, rejects role injection and duplicates, hashes passwords, and manages cookie auth', async () => {
    await request(app).post('/api/v1/auth/register').send({ ...credentials, role: 'admin' }).expect(400);
    const agent = request.agent(app);
    const registration = await agent.post('/api/v1/auth/register').send(credentials).expect(201);
    expect(registration.body.data.password).toBeUndefined();
    expect(registration.headers['set-cookie'][0]).toContain('HttpOnly');
    expect(registration.headers['set-cookie'][0]).toContain('SameSite=Lax');
    await request(app).post('/api/v1/auth/register').send(credentials).expect(409);
    const { User } = await import('../src/models/index.js');
    const user = await User.findOne({ email: credentials.email }).select('+password');
    expect(user!.password).not.toBe(credentials.password);
    await agent.get('/api/v1/auth/me').expect(200);
    await agent.post('/api/v1/auth/logout').send({}).expect(200);
    await agent.get('/api/v1/auth/me').expect(401);
    await agent.post('/api/v1/auth/login').send({ email: credentials.email, password: 'bad-password' }).expect(401);
    const login = await agent.post('/api/v1/auth/login').send(credentials).expect(400);
    expect(login.body.success).toBe(false); // extra name is rejected
    await agent.post('/api/v1/auth/login').send({ email: credentials.email, password: credentials.password }).expect(200);
  });
  it('rejects foreign origins', async () => {
    await request(app).post('/api/v1/auth/logout').set('Origin', 'https://evil.example').send({}).expect(403);
  });
});
describe('posts CRUD and ownership', () => {
  it('creates, reads, edits, likes and deletes own posts while isolating another user', async () => {
    const owner = request.agent(app), other = request.agent(app);
    await owner.post('/api/v1/auth/login').send({ email: credentials.email, password: credentials.password }).expect(200);
    await other.post('/api/v1/auth/register').send({ ...credentials, email: 'other@example.com' }).expect(201);
    await request(app).post('/api/v1/posts').send({ image: 'https://example.com/dog.jpg' }).expect(401);
    const created = await owner.post('/api/v1/posts').send({ image: 'https://example.com/dog.jpg', caption: 'Hello' }).expect(201);
    const id = created.body.data.id;
    await other.get(`/api/v1/posts/${id}`).expect(404);
    await other.patch(`/api/v1/posts/${id}`).send({ caption: 'Stolen' }).expect(404);
    await other.delete(`/api/v1/posts/${id}`).expect(404);
    const list = await owner.get('/api/v1/posts?search=Hello&limit=1').expect(200);
    expect(list.body.data.total).toBe(1);
    await owner.patch(`/api/v1/posts/${id}`).send({ caption: 'Updated' }).expect(200);
    const liked = await owner.post(`/api/v1/posts/${id}/like`).send({}).expect(200);
    expect(liked.body.data.likes).toHaveLength(1);
    await owner.get('/api/v1/posts/not-an-id').expect(400);
    await owner.delete(`/api/v1/posts/${id}`).expect(200);
    await owner.get(`/api/v1/posts/${id}`).expect(404);
  });
});
describe('booking and catalog', () => {
  it('uses server prices, prevents concurrent conflicts, confirms demo payments and enforces admin access', async () => {
    const owner = request.agent(app);
    await owner.post('/api/v1/auth/login').send({ email: credentials.email, password: credentials.password });
    await owner.post('/api/v1/services').send({ id: 'x', name: 'Service', category: 'veterinarian', image: 'https://example.com/a.jpg', price: 1 }).expect(403);
    const date = new Date(Date.now() + 86400000 * 2).toISOString().slice(0,10);
    const body = { service: 'v1', ownerName: 'Test Owner', phoneNumber: '+1 555 1234567', email: credentials.email, date, time: '10:00 AM' };
    await owner.post('/api/v1/bookings').send({ ...body, price: 1 }).expect(400);
    const results = await Promise.all([owner.post('/api/v1/bookings').send(body), owner.post('/api/v1/bookings').send(body)]);
    expect(results.map(r => r.status).sort()).toEqual([201,409]);
    const booking = results.find(r => r.status === 201)!.body.data;
    expect(booking.price).toBe(8500);
    const available = await owner.get(`/api/v1/services/v1/availability?date=${date}`).expect(200);
    expect(available.body.data).not.toContain('10:00 AM');
    await owner.post(`/api/v1/bookings/${booking.id}/payment`).send({ cardNumber: '1234' }).expect(400);
    await owner.post(`/api/v1/bookings/${booking.id}/payment`).send({}).expect(201);
    await owner.post(`/api/v1/bookings/${booking.id}/payment`).send({}).expect(409);
    await owner.delete(`/api/v1/bookings/${booking.id}`).expect(409);
    await owner.patch(`/api/v1/bookings/${booking.id}`).send({ status: 'cancelled' }).expect(200);
    await owner.delete(`/api/v1/bookings/${booking.id}`).expect(200);
  });
  it('has working health and OpenAPI endpoints', async () => {
    const health = await request(app).get('/api/health').expect(200);
    expect(health.body.data.database).toBe('connected');
    const docs = await request(app).get('/api/openapi.json').expect(200);
    expect(docs.body.data.openapi).toBe('3.0.3');
    await request(app).get('/api/docs/').expect(200);
  });
});
