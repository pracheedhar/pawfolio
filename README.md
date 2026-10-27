# Pawfolio 🐾

Pet service discovery, appointment booking, and personal pet photo profiles. The original React design, imagery, Tailwind styling, and page transitions are retained. MongoDB now supplies the catalog, profiles, posts, booking summaries, and notifications.

## Stack and layout

- `client/`: React 19, Vite, React Router, Tailwind CSS, Framer Motion; JavaScript JSX.
- `server/`: strict TypeScript, Express, Mongoose, Zod, JWT cookies, bcrypt, Multer.
- `server/src/{config,models,controllers,services,routes,middleware,utils,types}`: API layers.
- `server/src/data/legacy.ts`: original catalog/profile images used only by the seed.
- `server/test/`: Supertest integration tests using disposable MongoDB.
- `PLAN.md`: initial code analysis, entities, endpoints, and assumptions.

## Quick start without installing MongoDB

Requires Node.js **22.14+** and npm. First run downloads a MongoDB binary for `mongodb-memory-server` (network access required).

```sh
npm install
npm run dev:memory
```

Open http://localhost:5173. This mode seeds automatically and prints generated sample admin/user credentials. It generates an ephemeral JWT secret and uses a disposable database; records disappear when stopped. Do not use for persistent work. No `.env` files are necessary in this mode. Stop both processes with Ctrl+C.

## Persistent local development

Start MongoDB 7+ locally (default port 27017), or use an Atlas development database. From the repository root:

```sh
npm install
cp server/.env.example server/.env
cp client/.env.example client/.env
node -e "console.log(require('node:crypto').randomBytes(48).toString('hex'))"
```

Paste the generated value into `JWT_SECRET` in **server/.env**, and set `MONGO_URI`. Optionally set `SEED_ADMIN_PASSWORD` and `SEED_USER_PASSWORD` to your own passwords (8+ characters). Then:

```sh
npm run seed
npm run dev
```

The seed preserves existing records and passwords. Credentials printed by a repeat seed apply only to newly created accounts. Sample emails default to `admin@pawfolio.example` and `ocean@pawfolio.example`; no fixed passwords are committed. Register creates a regular user. Administrator catalog CRUD is available through the API documentation; there is no new admin dashboard.

- Client: http://localhost:5173
- API: http://localhost:4000/api/v1
- Health: http://localhost:4000/api/health
- Interactive OpenAPI: http://localhost:4000/api/docs/
- OpenAPI document in response envelope: http://localhost:4000/api/openapi.json

The Vite dev server proxies `/api` and `/uploads` when `VITE_API_URL` is omitted. When set, the client sends credentials to that API URL; relative uploaded images resolve against its origin.

## Environment variables

Server examples are in `server/.env.example`; Vite examples are in `client/.env.example`.

| Variable | Purpose |
| --- | --- |
| `PORT` | API port, default 4000 |
| `MONGO_URI` | MongoDB connection string, required |
| `JWT_SECRET` | Random signing secret, minimum 32 characters, required |
| `JWT_EXPIRES_IN` | Token lifetime, e.g. `7d`, `12h`, `30m` |
| `CLIENT_URL` | Exact allowed client origin, default `http://localhost:5173` |
| `NODE_ENV` | `development`, `test`, or `production` |
| `UPLOAD_DIR` | Local image directory, default `uploads` relative to server working directory |
| `UPLOAD_MAX_BYTES` | File size limit, default 5242880 |
| `UPLOAD_PROVIDER` | `local`; other values fail validation until an adapter is implemented |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Reserved adapter configuration; no Cloudinary implementation yet |
| `SEED_ADMIN_EMAIL`, `SEED_USER_EMAIL` | Optional sample account emails |
| `SEED_ADMIN_PASSWORD`, `SEED_USER_PASSWORD` | Optional first-seed passwords; otherwise generated |
| `VITE_API_URL` | Client build-time URL, e.g. `https://api.example.com/api/v1`; default `/api/v1` |

Never commit real `.env` files, production secrets, upload contents, or card data.

## Commands

| Command from root | Action |
| --- | --- |
| `npm install` | Install both npm workspaces |
| `npm run dev` | Start client and API concurrently; requires configured MongoDB/env |
| `npm run dev:memory` | Start both with disposable seeded MongoDB |
| `npm run seed` | Idempotent development seed |
| `npm run lint` | Lint both workspaces |
| `npm run build` | Build client to `client/dist`, API to `server/dist` |
| `npm test` | Client API wrapper tests and server integration tests |
| `npm run format` | Format server source and tests |
| `npm start -w server` | Run compiled API |
| `npm run preview -w client` | Preview built client; set `VITE_API_URL` before building for direct API access |

You can also run `npm install`, `npm run lint`, `npm run build`, and `npm test` from either `client/` or `server/`. The root lockfile is authoritative. Integration tests download/start MongoDB and require permission to open local ports.

## API endpoint table

JSON responses consistently use `{ success, message, data }`, including errors. Lists return `{ items, total, page, limit, pages }`; `page` starts at 1, `limit` is 1–100 (default 20). Requests reject unrecognized fields. Full request properties appear in Swagger.

| Method | Path (under `/api/v1`) | Access / behavior |
| --- | --- | --- |
| POST | `/auth/register`, `/auth/login` | Public, rate limited; sets httpOnly session cookie |
| POST | `/auth/logout` | Clears session cookie |
| GET | `/auth/me`, `/users/me` | Current user |
| PATCH, DELETE | `/users/me` | Edit profile / delete account and owned records |
| GET | `/categories`, `/categories/:id` | Public discovery |
| POST, PATCH, DELETE | `/categories`, `/categories/:id` | Admin catalog management |
| GET | `/services`, `/services/:id` | Public; search, category, pagination |
| POST, PATCH, DELETE | `/services`, `/services/:id` | Admin catalog management; prices in USD cents |
| GET | `/services/:id/availability?date=YYYY-MM-DD` | Available future slots |
| GET, POST | `/posts` | Own posts; caption search/pagination, create |
| GET, PATCH, DELETE | `/posts/:id` | Owner only |
| POST | `/posts/:id/like` | Toggle like on an own profile post |
| GET, POST | `/bookings` | Own bookings; server snapshots service price |
| GET, PATCH, DELETE | `/bookings/:id` | Owner; pending reschedule, cancel, delete pending/cancelled |
| POST | `/bookings/:id/payment` | Owner; development demo confirmation, rejects card fields |
| GET | `/payments`, `/payments/:id` | Own immutable demo receipts |
| GET, POST | `/notifications` | Own notifications |
| GET, PATCH, DELETE | `/notifications/:id` | Owner |
| PATCH | `/notifications/read-all` | Mark own notifications read |
| GET, POST | `/uploads` | Own metadata / multipart `image` upload |
| GET, DELETE | `/uploads/:id` | Own metadata / remove local file |

Catalog ids are stable strings (`v1`, `g1`, `training`); owned record ids are MongoDB ObjectIds. Images accept HTTP(S) URLs or generated `/uploads/...` paths. Uploads allow JPEG/PNG/WebP up to the configured size and verify file signatures. Image URLs are publicly accessible; metadata and deletion require ownership. Booking dates/times use the **API server's timezone**; set `TZ` consistently in deployment. One active booking per service/date/time is enforced by a MongoDB unique partial index. Pending holds do not automatically expire yet.

The profile is a personal gallery, not a public social feed. Follower/following counts come from stored references (initially zero); follow management is not exposed because the original app has no follow flow. Original illustrative reminder messages are seeded as demonstration data. Marketing artwork and copy remain static in the frontend.

**Payment behavior:** the original screen simulated success. The connected screen explicitly confirms demo bookings without collecting card details or charging money. `NODE_ENV=production` disables demo confirmation. Real checkout requires a payment provider and verified webhook implementation.

## Docker

With Docker Engine/Compose installed:

```sh
export JWT_SECRET="$(node -e "console.log(require('node:crypto').randomBytes(48).toString('hex'))")"
docker compose up --build -d
# Seed via the compiled seed script inside the running API image:
docker compose exec server node dist/seed.js
```

Open http://localhost:8080. MongoDB and uploaded images use named volumes. The Compose setup is **local development** (HTTP cookies and demo confirmation); the API container otherwise runs as a non-root user. Production must use HTTPS, `NODE_ENV=production`, an exact HTTPS `CLIENT_URL`, proper secrets, and managed database access. `docker compose down` preserves data; removing volumes erases it.

## Deployment

- **Vercel / Netlify frontend:** build `npm run build -w client` from root; publish `client/dist`; set `VITE_API_URL` at build time. Add an SPA fallback (`/*` → `/index.html`) for React Router deep links. Prefer a same-origin `/api` and `/uploads` reverse proxy, or use frontend/API custom domains on the same site.
- **Render / Railway API:** install at root, run `npm run build -w server`, run with working directory `server` and `node dist/server.js` (or root `npm start -w server`). Configure all required environment values and a persistent upload disk. Listen on supplied `PORT`; point health checks to `/api/health`.
- **MongoDB Atlas:** set `MONGO_URI`, configure an application database user and network access, use TLS. Provision the first production administrator through controlled database administration (the development seed is disabled in production). Build indexes before serving booking traffic. Replica-set transactions would be appropriate when adding real payments.
- Production cookies are `Secure`, `HttpOnly`, `SameSite=Lax`; unrelated frontend/API domains will not support authenticated fetches reliably. Use a same-site domain arrangement or same-origin proxy. Foreign-origin mutation requests are rejected.
- Configure proxy trust explicitly for your hosting topology before relying on per-client rate limits behind a load balancer. The default does not trust arbitrary forwarded headers.

## Verification and remaining work

See `VERIFICATION.md` for the checks actually run in this environment. CI repeats install/lint/build/test; Docker and hosted deployment require their respective runtimes/accounts. Suggested next steps: real payment provider/webhooks, Cloudinary adapter, booking hold expiry/timezone policy, password recovery/email verification, public social/follow features, and browser end-to-end coverage.
