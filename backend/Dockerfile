# Stage 1: Builder (Compilación y dependencias pesadas)
FROM node:20-slim AS builder

# Instalar herramientas de compilación para paquetes nativos
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copiar configuración de dependencias y Prisma
COPY package*.json ./
COPY prisma ./prisma/

# Instalación limpia de dependencias y generación de cliente Prisma
RUN npm ci && npx prisma generate

# Copiar código fuente
COPY . .

# Stage 2: Runner (Entorno de producción ligero)
FROM node:20-slim AS runner

# Instalar SOLO FFmpeg para la ejecución de tareas multimedia
RUN apt-get update && apt-get install -y ffmpeg && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Configurar entorno de producción
ENV NODE_ENV=production

# Copiar binarios y archivos necesarios desde builder de forma quirúrgica
COPY --from=builder --chown=node:node /app/package*.json ./
COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/prisma ./prisma
COPY --from=builder --chown=node:node /app/src ./src

USER node

# Exponer puerto de la API
EXPOSE 4000

# Comando de inicio optimizado
CMD ["npm", "start"]
