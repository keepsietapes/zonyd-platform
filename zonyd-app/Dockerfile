# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app

# Copiar dependencias PRIMERO (Docker cachea esta capa)
COPY package*.json ./
RUN npm ci

# Copiar código fuente (solo esta capa se reconstruye)
COPY . .

# Pasar variables de entorno para el build de Next.js
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
RUN npm run build

# Stage 2: Production (imagen mínima)
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copiar archivos necesarios desde el builder
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000

CMD ["npm", "start"]
