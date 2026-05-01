# syntax=docker/dockerfile:1.7
ARG NODE_VERSION=22-alpine

# ──────────────────────────────────────────────────────────────────
# Stage 1 — build: install all deps and compile Nuxt + Nitro
# ──────────────────────────────────────────────────────────────────
FROM node:${NODE_VERSION} AS build

# better-sqlite3 needs python + a C++ toolchain to compile native bindings
RUN apk add --no-cache python3 make g++ libc6-compat

WORKDIR /app

COPY package.json package-lock.json ./
# npm install (not npm ci): lockfile may have minor drift across host/container
# OS resolution; install lets npm reconcile against package.json. Builds remain
# reproducible enough because the lockfile is still committed and used as a hint.
RUN npm install --no-audit --no-fund --prefer-offline --legacy-peer-deps

COPY . .

ENV NODE_ENV=production
RUN npm run build

# ──────────────────────────────────────────────────────────────────
# Stage 2 — runner: minimal image, copy built output + native deps
# ──────────────────────────────────────────────────────────────────
FROM node:${NODE_VERSION} AS runner

# Curl is only used by Docker HEALTHCHECK
RUN apk add --no-cache curl libc6-compat

WORKDIR /app

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000
ENV NITRO_HOST=0.0.0.0
ENV NITRO_PORT=3000

COPY --from=build /app/.output ./.output
COPY --from=build /app/migrations ./migrations
COPY --from=build /app/package.json ./package.json

# SQLite data dir — mounted as a docker volume in production
RUN mkdir -p /app/data && chown -R node:node /app

USER node

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD curl -fsS http://localhost:3000/api/health || exit 1

CMD ["node", ".output/server/index.mjs"]
