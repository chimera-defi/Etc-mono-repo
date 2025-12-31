FROM node:20-alpine AS builder

WORKDIR /app

# Copy shared package
COPY shared/package*.json ./shared/
COPY shared/src ./shared/src
COPY shared/tsconfig.json ./shared/

# Copy withdrawal-keeper package
COPY withdrawal-keeper/package*.json ./withdrawal-keeper/
COPY withdrawal-keeper/src ./withdrawal-keeper/src
COPY withdrawal-keeper/tsconfig.json ./withdrawal-keeper/

# Build shared
WORKDIR /app/shared
RUN npm ci && npm run build

# Build withdrawal-keeper
WORKDIR /app/withdrawal-keeper
RUN npm ci && npm run build

# Production image
FROM node:20-alpine

WORKDIR /app

# Copy built files
COPY --from=builder /app/shared/dist ./shared/dist
COPY --from=builder /app/shared/package*.json ./shared/
COPY --from=builder /app/withdrawal-keeper/dist ./dist
COPY --from=builder /app/withdrawal-keeper/package*.json ./

# Install production dependencies only
RUN npm ci --only=production

USER node

CMD ["node", "dist/index.js"]
