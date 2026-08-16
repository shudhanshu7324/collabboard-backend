FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

FROM node:20-alpine
WORKDIR /app
RUN apk add --no-cache openssl
COPY --from=deps /app/node_modules ./node_modules
COPY package.json package-lock.json ./
COPY prisma ./prisma
COPY prisma.config.ts ./
COPY src ./src
RUN DATABASE_URL="postgresql://collabboard:password@localhost:5432/collabboard_dev" npx prisma generate
EXPOSE 3000
CMD ["node", "src/server.js"]
