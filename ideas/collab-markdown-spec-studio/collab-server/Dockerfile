FROM node:22-bookworm-slim
WORKDIR /app

COPY collab-server/package.json collab-server/package-lock.json ./
RUN npm ci --omit=dev

COPY collab-server/src ./src
COPY lib ../lib

ENV NODE_ENV=production
EXPOSE 4321 4322

CMD ["npm", "run", "start"]
