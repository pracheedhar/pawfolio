# Pawfolio full-stack plan

## Repository analysis
React 19 + Vite, JavaScript JSX, Tailwind, Framer Motion, React Router. AppContext contains a mock Ocean user and unused cart. Pages: Home, About, Discover, three service listing pages, BookingDetails, Payment, ProfileFeed. No existing backend, auth, localStorage, contact form, or upload implementation. Static artwork and marketing copy stay in the client.

## Data and actions
- User: name, email (unique), password hash, avatar, bio, role, timestamps. Register/login/logout/me and update own profile. Followers/following become real user references rather than fabricated counts.
- Category: stable slug id, title, image, path, timestamps. Public discovery; administrator CRUD.
- Service: stable slug id, name, image, category reference, price in cents, timestamps. Public search/category filter/pagination; administrator CRUD.
- Post: owner reference, image, caption, likes (user references), timestamps. Own profile grid; owner CRUD and authenticated like toggle.
- Booking: owner reference, service reference, ownerName, phoneNumber, email, date (YYYY-MM-DD), time, price snapshot, pending/confirmed/cancelled status, timestamps. Owner CRUD, slot availability and conflict prevention.
- Notification: owner reference, title, desc, read, timestamps. Owner CRUD and mark all read. Booking actions generate notifications.
- Upload: owner reference, generated filename, URL, MIME type, size, timestamps. Image upload/list/detail/delete with ownership.
- Payment: booking reference, owner reference, amount, demo status, timestamps. Explicit demo confirmation only; no card storage or real financial transaction.

## API
All API JSON responses: { success, message, data }. GET /api/health; GET /api/docs and /api/openapi.json.
/api/v1/auth: POST register/login/logout, GET me.
/api/v1/users/me: GET/PATCH/DELETE.
/api/v1/categories and /services: GET/POST, GET/PATCH/DELETE /:id.
/api/v1/posts: GET/POST, GET/PATCH/DELETE /:id, POST /:id/like.
/api/v1/bookings: GET/POST, GET/PATCH/DELETE /:id; GET /services/:id/availability?date=.
/api/v1/notifications: GET/POST, PATCH /read-all, GET/PATCH/DELETE /:id.
/api/v1/uploads: GET/POST, GET/DELETE /:id.
/api/v1/payments: GET, GET /:id, POST /bookings/:id/payment (demo only).
Collections support bounded pagination; services and posts support search and filters.

## Delivery phases
1. Plan and monorepo: move frontend into client; root scripts and contributor instructions.
2. Strict TypeScript Express server: security, validation, auth, models/services/controllers, seed, OpenAPI, integration tests.
3. Wire frontend data/actions, auth, validation, upload, loading/errors/toasts, preserve styling.
4. Docker, CI, docs; install/lint/build/test/health checks; focused commits per phase.

## Assumptions
- Retain JavaScript frontend to avoid unrelated rewrites; server uses strict TypeScript.
- Existing catalog ids and images are retained in seed; database data replaces all mock imports.
- No live payment provider: demo confirmation is disabled in production; never process card information.
- Booking calendar uses real current/future dates and server-provided slots, replacing invalid June 31 calendar.
- Catalog is administrator managed; posts/bookings/uploads/profiles/notifications are owner managed.
- Social counts are derived from references; no fabricated follower history is seeded.
- Local uploads for development, storage adapter boundary for future Cloudinary integration.
