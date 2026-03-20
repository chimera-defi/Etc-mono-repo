FROM oven/bun:1 AS base
WORKDIR /app

COPY bun.lock /bun.lock
COPY web/package.json ./
RUN bun install --frozen-lockfile

COPY web ./
COPY fixtures /fixtures
RUN bun run build

ENV NODE_ENV=production
EXPOSE 3000

CMD ["bun", "run", "start"]
