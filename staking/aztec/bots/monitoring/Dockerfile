FROM node:20-alpine AS builder

WORKDIR /app

# Copy shared package
COPY shared/package*.json ./shared/
COPY shared/src ./shared/src
COPY shared/tsconfig.json ./shared/

# Copy monitoring package
COPY monitoring/package*.json ./monitoring/
COPY monitoring/src ./monitoring/src
COPY monitoring/tsconfig.json ./monitoring/

# Build shared
WORKDIR /app/shared
RUN npm ci && npm run build

# Build monitoring
WORKDIR /app/monitoring
RUN npm ci && npm run build

# Production image
FROM node:20-alpine

WORKDIR /app

# Copy built files
COPY --from=builder /app/shared/dist ./shared/dist
COPY --from=builder /app/shared/package*.json ./shared/
COPY --from=builder /app/monitoring/dist ./dist
COPY --from=builder /app/monitoring/package*.json ./

# Install production dependencies only
RUN npm ci --only=production

USER node

CMD ["node", "dist/index.js"]
