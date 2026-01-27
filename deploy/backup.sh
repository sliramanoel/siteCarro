#!/bin/bash

#===============================================================================
# Script de Backup - AJ Leilões
#===============================================================================

BACKUP_DIR="/var/backups/ajleiloes"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="ajleiloes_db"

# Criar diretório de backup
mkdir -p $BACKUP_DIR

echo "Iniciando backup..."

# Backup do MongoDB
mongodump --db=$DB_NAME --out=$BACKUP_DIR/mongo_$DATE
echo "✓ MongoDB exportado"

# Backup dos arquivos de configuração
tar -czf $BACKUP_DIR/config_$DATE.tar.gz \
    /var/www/ajleiloes/backend/.env \
    /var/www/ajleiloes/frontend/.env \
    /etc/nginx/sites-available/ajleiloes \
    2>/dev/null
echo "✓ Configurações salvas"

# Backup das imagens (se houver locais)
if [ -d "/var/www/ajleiloes/backend/uploads" ]; then
    tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz /var/www/ajleiloes/backend/uploads
    echo "✓ Uploads salvos"
fi

# Remover backups antigos (manter últimos 7 dias)
find $BACKUP_DIR -type f -mtime +7 -delete
find $BACKUP_DIR -type d -empty -delete

echo ""
echo "Backup concluído em: $BACKUP_DIR"
echo "Arquivos criados:"
ls -lh $BACKUP_DIR/*$DATE* 2>/dev/null
