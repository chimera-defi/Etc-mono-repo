FROM oven/bun:1
WORKDIR /app

COPY bun.lock /bun.lock
COPY collab-server/package.json ./
RUN bun install --frozen-lockfile --production

COPY collab-server/src ./src
COPY lib ../lib

ENV NODE_ENV=production
EXPOSE 4321 4322

CMD ["bun", "run", "start"]
