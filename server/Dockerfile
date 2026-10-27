FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
COPY client/package.json client/package.json
COPY server/package.json server/package.json
RUN npm ci
COPY server server
RUN npm run build -w server

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
COPY client/package.json client/package.json
COPY server/package.json server/package.json
RUN npm ci --omit=dev && mkdir -p /app/server/uploads && chown -R node:node /app/server/uploads
COPY --from=build /app/server/dist server/dist
USER node
WORKDIR /app/server
EXPOSE 4000
CMD ["node", "dist/server.js"]
