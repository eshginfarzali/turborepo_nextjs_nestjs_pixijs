# syntax=docker/dockerfile:1
# Build from the repo root: docker build -f apps/api/Dockerfile .
FROM node:22-alpine AS base
RUN corepack enable
WORKDIR /app

# Keep only @repo/api and the workspace packages it depends on.
FROM base AS pruner
COPY . .
RUN npx --yes turbo@2.11.10 prune @repo/api --docker

FROM base AS builder
COPY --from=pruner /app/out/json/ .
RUN pnpm install --frozen-lockfile
COPY --from=pruner /app/out/full/ .
RUN pnpm turbo run build --filter=@repo/api \
 && pnpm --filter=@repo/api deploy --legacy --prod /prod/api

FROM node:22-alpine AS runner
ENV NODE_ENV=production
WORKDIR /app
COPY --from=builder --chown=node:node /prod/api .
USER node
EXPOSE 3001
HEALTHCHECK --interval=10s --timeout=3s --retries=5 \
  CMD wget -qO- http://127.0.0.1:${PORT:-3001}/health || exit 1
CMD ["node", "dist/main.js"]
