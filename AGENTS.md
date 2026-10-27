# Contributor instructions
- `client/`: original React/Vite/Tailwind UI; preserve visual design. `server/`: Express/Mongoose API.
- Install: `npm install` at root (npm workspaces). Dev: `npm run dev`. Build/lint/test: `npm run build`, `npm run lint`, `npm test`. Seed: `npm run seed`.
- Server TypeScript is strict. Keep route → controller → service → model layering; validate body, params, query with Zod on every API route.
- JSON API responses use `{ success, message, data }`; errors use meaningful HTTP status codes.
- Check ownership in services; catalog mutations require admin. Never trust client prices/roles/owner ids.
- Never commit secrets, real `.env` files, upload contents, or card details. Examples must contain placeholders only.
- Run relevant tests and build before committing. Explain non-obvious TypeScript patterns concisely.
