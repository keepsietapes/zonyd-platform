FROM node:20-slim

# Instalar FFmpeg y dependencias de sistema
RUN apt-get update && apt-get install -y ffmpeg python3 make g++ && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./
COPY prisma ./prisma/

# Instalar dependencias
RUN npm install

# Generar cliente Prisma
RUN npx prisma generate

# Copiar el resto del código
COPY . .

# Exponer puerto
EXPOSE 4000

# Comando para iniciar
CMD ["npm", "start"]
