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
  const { User, Post, Booking, Category, Service, Payment } =
    await import('../src/models/index.js');
  await Promise.all([User.init(), Post.init(), Booking.init(), Payment.init()]);
  await Category.create({
    _id: 'veterinarian',
    title: 'Veterinarian',
    image: 'https://example.com/vet.jpg',
    path: '/vets',
  });
  await Service.create({
    _id: 'v1',
    name: 'VetCare',
    category: 'veterinarian',
    image: 'https://example.com/vet.jpg',
    price: 8500,
  });
}, 120000);
afterAll(async () => {
  await mongoose.disconnect();
  await mongo?.stop();
});
const credentials = {
  name: 'Test Owner',
  email: 'owner@example.com',
  password: 'test-password-123',
};
describe('authentication', () => {
  it('validates registration, rejects role injection and duplicates, hashes passwords, and manages cookie auth', async () => {
    await request(app)
      .post('/api/v1/auth/register')
      .send({ ...credentials, role: 'admin' })
      .expect(400);
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
    await agent
      .post('/api/v1/auth/login')
      .send({ email: credentials.email, password: 'bad-password' })
      .expect(401);
    const login = await agent.post('/api/v1/auth/login').send(credentials).expect(400);
    expect(login.body.success).toBe(false); // extra name is rejected
    await agent
      .post('/api/v1/auth/login')
      .send({ email: credentials.email, password: credentials.password })
      .expect(200);
  });
  it('rejects foreign origins', async () => {
    await request(app)
      .post('/api/v1/auth/logout')
      .set('Origin', 'https://evil.example')
      .send({})
      .expect(403);
  });
});
describe('posts CRUD and ownership', () => {
  it('creates, reads, edits, likes and deletes own posts while isolating another user', async () => {
    const owner = request.agent(app),
      other = request.agent(app);
    await owner
      .post('/api/v1/auth/login')
      .send({ email: credentials.email, password: credentials.password })
      .expect(200);
    await other
      .post('/api/v1/auth/register')
      .send({ ...credentials, email: 'other@example.com' })
      .expect(201);
    await request(app)
      .post('/api/v1/posts')
      .send({ image: 'https://example.com/dog.jpg' })
      .expect(401);
    const created = await owner
      .post('/api/v1/posts')
      .send({ image: 'https://example.com/dog.jpg', caption: 'Hello' })
      .expect(201);
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
    await owner
      .post('/api/v1/auth/login')
      .send({ email: credentials.email, password: credentials.password });
    await owner
      .post('/api/v1/services')
      .send({
        id: 'x',
        name: 'Service',
        category: 'veterinarian',
        image: 'https://example.com/a.jpg',
        price: 1,
      })
      .expect(403);
    const date = new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10);
    const body = {
      service: 'v1',
      ownerName: 'Test Owner',
      phoneNumber: '+1 555 1234567',
      email: credentials.email,
      date,
      time: '10:00 AM',
    };
    await owner
      .post('/api/v1/bookings')
      .send({ ...body, price: 1 })
      .expect(400);
    const results = await Promise.all([
      owner.post('/api/v1/bookings').send(body),
      owner.post('/api/v1/bookings').send(body),
    ]);
    expect(results.map((r) => r.status).sort()).toEqual([201, 409]);
    const booking = results.find((r) => r.status === 201)!.body.data;
    expect(booking.price).toBe(8500);
    const available = await owner.get(`/api/v1/services/v1/availability?date=${date}`).expect(200);
    expect(available.body.data).not.toContain('10:00 AM');
    await owner
      .post(`/api/v1/bookings/${booking.id}/payment`)
      .send({ cardNumber: '1234' })
      .expect(400);
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

describe('uploads, notifications and profile validation', () => {
  it('validates images, rejects extra multipart fields and isolates upload deletion', async () => {
    const owner = request.agent(app),
      other = request.agent(app);
    await owner
      .post('/api/v1/auth/login')
      .send({ email: credentials.email, password: credentials.password })
      .expect(200);
    await other
      .post('/api/v1/auth/login')
      .send({ email: 'other@example.com', password: credentials.password })
      .expect(200);
    await owner
      .post('/api/v1/uploads')
      .attach('image', Buffer.from('<script>bad</script>'), {
        filename: 'fake.png',
        contentType: 'image/png',
      })
      .expect(400);
    const png = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aBZkAAAAASUVORK5CYII=',
      'base64',
    );
    await owner
      .post('/api/v1/uploads')
      .field('owner', 'someone-else')
      .attach('image', png, { filename: 'pet.png', contentType: 'image/png' })
      .expect(400);
    const uploaded = await owner
      .post('/api/v1/uploads')
      .attach('image', png, { filename: 'pet.png', contentType: 'image/png' })
      .expect(201);
    expect(uploaded.body.data.url).toMatch(/^\/uploads\/[\w-]+\.png$/);
    await request(app).get(uploaded.body.data.url).expect(200);
    await other.delete(`/api/v1/uploads/${uploaded.body.data.id}`).expect(404);
    await owner.delete(`/api/v1/uploads/${uploaded.body.data.id}`).expect(200);
    await request(app).get(uploaded.body.data.url).expect(404);
  });
  it('updates own profile, rejects privilege escalation and persists notification read status', async () => {
    const owner = request.agent(app);
    await owner
      .post('/api/v1/auth/login')
      .send({ email: credentials.email, password: credentials.password })
      .expect(200);
    await owner.patch('/api/v1/users/me').send({ role: 'admin' }).expect(400);
    await owner
      .patch('/api/v1/users/me')
      .send({ name: 'Updated Owner', bio: 'Pet lover', avatar: '' })
      .expect(200);
    expect((await owner.get('/api/v1/auth/me')).body.data.name).toBe('Updated Owner');
    await owner
      .post('/api/v1/notifications')
      .send({ title: 'Reminder', desc: 'A test reminder' })
      .expect(201);
    await owner.patch('/api/v1/notifications/read-all').send({}).expect(200);
    const notifications = await owner.get('/api/v1/notifications').expect(200);
    expect(notifications.body.data.items.every((item: { read: boolean }) => item.read)).toBe(true);
  });
  it('lets an admin manage the catalog and rejects nonexistent category references', async () => {
    const { User } = await import('../src/models/index.js');
    await User.updateOne({ email: 'other@example.com' }, { role: 'admin' });
    const admin = request.agent(app);
    await admin
      .post('/api/v1/auth/login')
      .send({ email: 'other@example.com', password: credentials.password })
      .expect(200);
    await admin
      .post('/api/v1/categories')
      .send({
        id: 'test-category',
        title: 'Test category',
        image: 'https://example.com/pet.jpg',
        path: '/vets',
      })
      .expect(201);
    await admin
      .post('/api/v1/services')
      .send({
        id: 'test-service',
        name: 'Test service',
        category: 'missing-category',
        image: 'https://example.com/pet.jpg',
        price: 1500,
      })
      .expect(400);
    await admin
      .post('/api/v1/services')
      .send({
        id: 'test-service',
        name: 'Test service',
        category: 'test-category',
        image: 'https://example.com/pet.jpg',
        price: 1500,
      })
      .expect(201);
    await admin.patch('/api/v1/services/test-service').send({ price: 2000 }).expect(200);
    await admin.delete('/api/v1/categories/test-category').expect(409);
    await admin.delete('/api/v1/services/test-service').expect(200);
    await admin.delete('/api/v1/categories/test-category').expect(200);
  });
});

it('blocks demo confirmations in production', async () => {
  const { env } = await import('../src/config/env.js');
  const agent = request.agent(app);
  await agent
    .post('/api/v1/auth/login')
    .send({ email: credentials.email, password: credentials.password })
    .expect(200);
  const original = env.NODE_ENV;
  env.NODE_ENV = 'production';
  try {
    await agent.post('/api/v1/bookings/000000000000000000000001/payment').send({}).expect(403);
  } finally {
    env.NODE_ENV = original;
  }
});

it('initializes a production administrator and catalog without demo accounts and preserves edits', async () => {
  const { setupProduction } = await import('../src/services/productionSetup.js');
  const { User, Category, Service, Post } = await import('../src/models/index.js');
  const input = {
    ADMIN_EMAIL: 'real-admin@example.com',
    ADMIN_PASSWORD: 'production-setup-test-password',
  };
  const usersBefore = await User.countDocuments();
  const postsBefore = await Post.countDocuments();
  expect((await setupProduction(input)).administratorCreated).toBe(true);
  const administrator = await User.findOne({ email: input.ADMIN_EMAIL }).select('+password');
  expect(administrator!.role).toBe('admin');
  expect(administrator!.password).not.toBe(input.ADMIN_PASSWORD);
  await Service.updateOne({ _id: 'v1' }, { price: 12345 });
  expect(
    (await setupProduction({ ...input, ADMIN_PASSWORD: 'different-password-preserved' }))
      .administratorCreated,
  ).toBe(false);
  expect((await User.findById(administrator!._id).select('+password'))!.password).toBe(
    administrator!.password,
  );
  expect(await User.countDocuments()).toBe(usersBefore + 1);
  expect(await Post.countDocuments()).toBe(postsBefore);
  expect(await Category.countDocuments()).toBe(3);
  expect(await Service.countDocuments()).toBe(12);
  expect((await Service.findById('v1'))!.price).toBe(12345);
  await expect(setupProduction({ ...input, ADMIN_EMAIL: credentials.email })).rejects.toMatchObject(
    { status: 409 },
  );
});

it('rejects insecure production environment settings and malformed database URLs', async () => {
  const { environmentSchema } = await import('../src/config/env.js');
  const valid = {
    MONGO_URI: 'mongodb://127.0.0.1/pawfolio',
    JWT_SECRET: 'test-only-generated-production-key-with-32-characters',
    NODE_ENV: 'production',
    CLIENT_URL: 'https://pawfolio.example',
    PROXY_SECRET: 'test-only-proxy-secret-with-32-characters',
  };
  expect(environmentSchema.safeParse(valid).success).toBe(true);
  expect(
    environmentSchema.safeParse({ ...valid, CLIENT_URL: 'http://localhost:5173' }).success,
  ).toBe(false);
  expect(
    environmentSchema.safeParse({
      ...valid,
      JWT_SECRET: 'replace-with-a-random-secret-at-least-32-characters',
    }).success,
  ).toBe(false);
  expect(
    environmentSchema.safeParse({ ...valid, MONGO_URI: 'MONGO_URI=mongodb://localhost/pawfolio' })
      .success,
  ).toBe(false);
  expect(environmentSchema.safeParse({ ...valid, TRUST_PROXY_HOPS: 'true' }).success).toBe(false);
});

it('requires the configured proxy secret while leaving Render health probes public', async () => {
  const { env } = await import('../src/config/env.js');
  const original = env.PROXY_SECRET;
  env.PROXY_SECRET = 'proxy-test-secret-with-at-least-32-characters';
  try {
    await request(app).get('/api/health').expect(200);
    await request(app).get('/api/v1/services').expect(403);
    await request(app)
      .get('/api/v1/services')
      .set('x-pawfolio-proxy-secret', 'wrong-secret')
      .expect(403);
    await request(app)
      .get('/api/v1/services')
      .set('x-pawfolio-proxy-secret', env.PROXY_SECRET)
      .expect(200);
    await request(app).get('/uploads/missing.png').expect(403);
  } finally {
    env.PROXY_SECRET = original;
  }
});
