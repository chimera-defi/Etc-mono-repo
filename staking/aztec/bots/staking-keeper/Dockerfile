FROM node:20-alpine AS builder

WORKDIR /app

# Copy shared package
COPY shared/package*.json ./shared/
COPY shared/src ./shared/src
COPY shared/tsconfig.json ./shared/

# Copy staking-keeper package
COPY staking-keeper/package*.json ./staking-keeper/
COPY staking-keeper/src ./staking-keeper/src
COPY staking-keeper/tsconfig.json ./staking-keeper/

# Build shared
WORKDIR /app/shared
RUN npm ci && npm run build

# Build staking-keeper
WORKDIR /app/staking-keeper
RUN npm ci && npm run build

# Production image
FROM node:20-alpine

WORKDIR /app

# Copy built files
COPY --from=builder /app/shared/dist ./shared/dist
COPY --from=builder /app/shared/package*.json ./shared/
COPY --from=builder /app/staking-keeper/dist ./dist
COPY --from=builder /app/staking-keeper/package*.json ./

# Install production dependencies only
RUN npm ci --only=production

USER node

CMD ["node", "dist/index.js"]
