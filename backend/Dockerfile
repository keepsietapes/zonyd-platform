FROM node:20-slim

# Instalar FFmpeg y dependencias de sistema
RUN apt-get update && apt-get install -y ffmpeg python3 make g++ && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copiar archivos de dependencias PRIMERO (Docker cachea esta capa)
COPY package*.json ./
COPY prisma ./prisma/

# Instalar dependencias (se cachea si package.json no cambió)
# Instalamos TODO primero para poder generar Prisma, luego limpiamos o simplemente usamos ci
RUN npm ci && npx prisma generate && npm prune --production

# Copiar el resto del código (solo esta capa se reconstruye en cada deploy)
COPY . .

# Exponer puerto
EXPOSE 4000

# Comando para iniciar
CMD ["npm", "start"]
