FROM node:20.11.1 AS builder
RUN corepack enable
WORKDIR /app
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --no-frozen-lockfile
COPY . .
RUN pnpm run build
FROM node:20.11.1
WORKDIR /app
RUN corepack enable
COPY --from=builder /app /app
EXPOSE 3000
CMD ["node", "index.js"]