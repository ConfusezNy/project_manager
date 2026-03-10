# ---- Build Stage ----
FROM node:22-alpine AS builder
WORKDIR /app

# Accept build args
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Copy package files first (better caching)
COPY package*.json ./
RUN npm ci

# Copy all source files
COPY . .

# Ensure public dir exists (may not exist in all projects)
RUN mkdir -p public

# Build Next.js (production)
RUN npm run build

# ---- Production Stage ----
FROM node:22-alpine
WORKDIR /app

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000

CMD ["node", "server.js"]