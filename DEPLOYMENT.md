# Deploy Pawfolio: Vercel frontend + Render API + MongoDB Atlas

Local development remains `npm run dev`. Production uses Vercel to serve the React website and forward `/api/*` and `/uploads/*` to Render. Browser requests stay on the Vercel domain, so the existing Secure/HttpOnly/SameSite=Lax login cookies work.

## 1. Create the frontend project in Vercel

Import `pracheedhar/pawfolio`. Keep **Root Directory at the repository root**, not `client`. Choose Node.js 22.x and set `VITE_API_URL=/api/v1` for Production.

The root `vercel.mjs` supplies the install command (`npm ci --include=dev`), build command (`npm run build -w client`), output folder (`client/dist`), asset handling, SPA fallback, and backend forwarding. It uses Vercel's native programmatic configuration and requires two additional **private** Vercel settings before the first successful deploy:

- `BACKEND_URL`: exact HTTPS Render service origin, with no trailing slash. Example format: `https://your-service.onrender.com`.
- `PROXY_SECRET`: the same value generated/configured on Render (step 2).

Creating the project may initially fail the build until those settings are available. That is intentional: configuration fails clearly instead of publishing a site with broken API requests. Note the project's stable **production domain**, e.g. `https://your-project.vercel.app`; it will be the backend's `CLIENT_URL`. Avoid deployment-specific preview domains for the production setting.

## 2. Deploy the backend on Render

Push these deployment changes to GitHub. In Render, choose **New → Blueprint** and select the repository. Review resources/cost before creating them: `render.yaml` uses a **paid Starter Node service and a 1 GB persistent disk** so uploaded photos survive redeployments. No hosting service has been created by these file changes.

The Blueprint sets:

- Build: `npm ci --include=dev && npm run build -w server`
- Start: `npm start -w server`
- Health: `/api/health`
- `NODE_ENV=production`, `TRUST_PROXY_HOPS=2` for Vercel → Render.
- `UPLOAD_DIR=/var/data/pawfolio/uploads`, on the persistent disk.
- `TZ=Asia/Kolkata`, `JWT_EXPIRES_IN=7d`.
- Generated private `JWT_SECRET` and `PROXY_SECRET` values.

It prompts for:

- `MONGO_URI`: your Atlas production URI. Prefer a separate database such as `pawfolio_production` to avoid publishing development/demo records.
- `CLIENT_URL`: the Vercel production HTTPS origin from step 1, with **no trailing slash**.

Add Render's outbound IP ranges to the Atlas access list. Use an Atlas application user with read/write access to the chosen database. Rotate any database password exposed in screenshots before public deployment. Do not upload or commit `server/.env`.

Once Render is running, copy its HTTPS origin and private `PROXY_SECRET` into the corresponding Vercel settings from step 1, then redeploy Vercel. Never prefix the secret with `VITE_`; it belongs only in server/platform configuration.

Render's public health URL should return 200. Other direct Render URLs deliberately return 403: Vercel injects a shared secret on forwarded requests. This prevents arbitrary direct callers from spoofing forwarded client addresses, while allowing the configured proxy-hop count to preserve per-visitor rate limiting. Review proxy-hop settings if adding another CDN/proxy.

## 3. Initialize the production database once

Temporarily add these private environment values on Render:

- `ADMIN_EMAIL`: a dedicated administrator email.
- `ADMIN_NAME`: your name (optional).
- `ADMIN_PASSWORD`: a unique password of at least 12 characters (at most 72 UTF-8 bytes).

After those settings are deployed, open the Render service's **Shell** and run from the repository root:

```sh
npm run setup:production
```

This creates the administrator, required database indexes, 3 categories and 12 initial listings. No demo users, posts, or reminders are created. Repeat runs preserve existing administrator passwords and catalog edits. An ordinary account is never silently promoted; use a dedicated administrator email.

Remove `ADMIN_PASSWORD` from Render's settings after success and redeploy. Do not use the development `npm run seed` command on production. The initial providers/prices/images are examples: replace them with actual offerings before accepting real customer bookings.

## 4. Verify through the Vercel website

- `/api/health` returns 200 and `database: connected`.
- `/discover` displays the catalog; refresh `/profile` and `/booking/v1` to verify SPA fallback.
- Signup, login, logout, and page refreshes behave correctly.
- Upload a pet photo, redeploy Render, and verify the photo is retained.
- API/upload requests are forwarded to Render, never answered by the SPA fallback.
- Use only the stable Vercel production domain unless separately configuring preview origins/databases.

**Payments:** production still rejects demo confirmation. No real payment provider is implemented. Browsing, accounts, gallery, and pending booking requests can be deployed, but do not advertise working paid checkout until provider/webhook integration exists.

## Local checks

```sh
npm run lint
npm run build
npm test
```

Automated tests use temporary MongoDB and do not modify your Atlas data. Hosting creation, billing approval, network access, and the final public end-to-end check remain owner actions in the hosting dashboards.

References: [Vercel programmatic configuration](https://vercel.com/docs/project-configuration/vercel-ts), [Render Blueprints](https://render.com/docs/blueprint-spec), [persistent disks](https://render.com/docs/disks), [outbound IPs](https://render.com/docs/outbound-ip-addresses).
