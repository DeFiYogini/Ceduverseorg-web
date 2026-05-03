# syntax=docker/dockerfile:1.6

# ---------- Stage 1: build everything (incl. native modules) ----------
FROM node:20-slim AS builder

RUN apt-get update && apt-get install -y --no-install-recommends \
      python3 make g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install all deps (incl. dev) for build step
COPY package.json package-lock.json* ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

# Drop dev deps so the runner stage gets a slim node_modules
RUN npm prune --omit=dev

# ---------- Stage 2: runtime image ----------
FROM node:20-slim AS runner

ENV NODE_ENV=production
WORKDIR /app

# Copy only what's needed to run the bundled server
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Runtime mutable dirs (uploads, on-disk audio cache fallback)
RUN mkdir -p uploads audio-cache && chown -R node:node /app

USER node

EXPOSE 3000

CMD ["node", "dist/index.cjs"]
