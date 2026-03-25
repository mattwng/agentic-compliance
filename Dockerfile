FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN NODE_OPTIONS="--max-old-space-size=512" npm ci
COPY . .
RUN npx prisma generate
RUN NODE_OPTIONS="--max-old-space-size=512" npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/@libsql ./node_modules/@libsql
COPY --from=builder /app/migrate.js ./
RUN apk add --no-cache openssl
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
CMD ["sh", "-c", "node migrate.js && node server.js"]
