#!/bin/bash

echo "🚀 Iniciando despliegue de Zonyd OS..."

# 1. Pull de los últimos cambios (si usas git)
# git pull origin main

# 2. Reconstruir y levantar contenedores
echo "📦 Reconstruyendo imágenes y levantando servicios..."
docker-compose down
docker-compose up -d --build

# 3. Limpiar imágenes huérfanas para ahorrar espacio
echo "🧹 Limpiando caché de Docker..."
docker image prune -f

# 4. Verificar salud
echo "🔍 Verificando estado del sistema..."
sleep 5
curl -s http://localhost/health | grep "healthy"

if [ $? -eq 0 ]; then
    echo "✅ Despliegue completado con éxito."
else
    echo "❌ Error: El sistema no parece saludable después del despliegue."
fi
