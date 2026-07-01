FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npx prisma generate
RUN npm run build

# 生产阶段
FROM node:20-alpine

# wget 用于健康检查
RUN apk add --no-cache wget

WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/bootstrap.js ./

EXPOSE 7001

CMD ["node", "bootstrap.js"]
