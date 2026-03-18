FROM node:22-bookworm-slim AS base
WORKDIR /app

COPY web/package.json web/package-lock.json ./
RUN npm ci

COPY web ./
COPY fixtures /fixtures
RUN npm run build

ENV NODE_ENV=production
EXPOSE 3000

CMD ["npm", "run", "start"]
