FROM node:20-alpine AS builder

WORKDIR /app

# Copy shared package
COPY shared/package*.json ./shared/
COPY shared/src ./shared/src
COPY shared/tsconfig.json ./shared/

# Copy rewards-keeper package
COPY rewards-keeper/package*.json ./rewards-keeper/
COPY rewards-keeper/src ./rewards-keeper/src
COPY rewards-keeper/tsconfig.json ./rewards-keeper/

# Build shared
WORKDIR /app/shared
RUN npm ci && npm run build

# Build rewards-keeper
WORKDIR /app/rewards-keeper
RUN npm ci && npm run build

# Production image
FROM node:20-alpine

WORKDIR /app

# Copy built files
COPY --from=builder /app/shared/dist ./shared/dist
COPY --from=builder /app/shared/package*.json ./shared/
COPY --from=builder /app/rewards-keeper/dist ./dist
COPY --from=builder /app/rewards-keeper/package*.json ./

# Install production dependencies only
RUN npm ci --only=production

USER node

CMD ["node", "dist/index.js"]
