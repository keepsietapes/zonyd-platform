#!/bin/bash
# Script para automatizar backups de PostgreSQL usando pg_dump

# Configuración
BACKUP_DIR="/var/backups/postgresql"
DATE=$(date +%Y-%m-%d_%H-%M-%S)
DB_USER=${DB_USER:-"postgres"}
DB_HOST=${DB_HOST:-"localhost"}
DB_PORT=${DB_PORT:-"5432"}
DB_NAME=${DB_NAME:-"zonyd"}

# Crear directorio si no existe
mkdir -p "$BACKUP_DIR"

# Archivo de salida
OUTPUT_FILE="$BACKUP_DIR/db_backup_$DATE.sql.gz"

echo "Iniciando backup de la base de datos $DB_NAME en $OUTPUT_FILE..."

# Ejecutar pg_dump y comprimir
PGPASSWORD=${DB_PASSWORD} pg_dump -U "$DB_USER" -h "$DB_HOST" -p "$DB_PORT" "$DB_NAME" | gzip > "$OUTPUT_FILE"

if [ $? -eq 0 ]; then
    echo "✅ Backup completado exitosamente."
    # Eliminar backups más antiguos de 7 días
    find "$BACKUP_DIR" -type f -name "*.sql.gz" -mtime +7 -exec rm {} \;
    echo "🧹 Backups antiguos limpiados."
else
    echo "❌ Error al realizar el backup."
    exit 1
fi
