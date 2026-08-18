# syntax=docker/dockerfile:1

# ---- Build stage: install deps, generate the Prisma client, compile TypeScript ----
FROM node:22-alpine AS builder

WORKDIR /app

# Native modules (bcrypt) may need to compile from source on musl/Alpine if no
# prebuilt binary matches this platform.
RUN apk add --no-cache python3 make g++ libc6-compat

# Prisma's generate step needs OpenSSL to detect/fetch the right query engine.
RUN apk add --no-cache openssl

# Skip Puppeteer's bundled (glibc-only) Chromium download here -- the
# production stage installs a musl-compatible Chromium via apk instead.
ENV PUPPETEER_SKIP_DOWNLOAD=true
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig.json ./
COPY prisma ./prisma
COPY src ./src

RUN npx prisma generate
RUN npm run build

# Drop devDependencies in place so the production stage can copy a
# ready-to-run node_modules without a second install pass.
RUN npm prune --omit=dev

# ---- Production stage: lean runtime image ----
FROM node:22-alpine AS production

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4000

# openssl: required by the Prisma query engine at runtime.
# chromium + supporting libs: required by Puppeteer (PDF report export).
# Puppeteer's own bundled Chromium is glibc-only and won't run on Alpine's
# musl libc, so we use Alpine's native chromium package instead.
RUN apk add --no-cache \
      openssl \
      chromium \
      nss \
      freetype \
      harfbuzz \
      ca-certificates \
      ttf-freefont \
    && rm -rf /var/cache/apk/*

ENV PUPPETEER_SKIP_DOWNLOAD=true
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 4000

CMD ["node", "dist/index.js"]
