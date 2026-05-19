FROM node:20-slim AS builder
WORKDIR /app
RUN npm i -g pnpm
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/api/package.json apps/api/
RUN pnpm install --frozen-lockfile
COPY apps/api apps/api
RUN cd apps/api && npx prisma generate && npm run build

FROM node:20-slim
WORKDIR /app
RUN npm i -g pnpm
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/prisma ./prisma
COPY apps/api/package.json .
ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "dist/main.js"]
