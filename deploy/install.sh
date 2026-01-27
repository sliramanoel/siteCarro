#!/bin/bash

#===============================================================================
# Script de Instalação Automática - AJ Leilões
# Compatível com: Ubuntu 20.04/22.04, Debian 11/12
#===============================================================================

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configurações (EDITE ESTAS VARIÁVEIS)
DOMAIN=""                           # Seu domínio (ex: ajleiloes.com.br) - deixe vazio para usar IP
APP_DIR="/var/www/ajleiloes"
DB_NAME="ajleiloes_db"
ADMIN_USER="admin"
ADMIN_PASS="admin123"               # MUDE ESTA SENHA!

# Função para imprimir mensagens
print_status() {
    echo -e "${BLUE}[*]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

# Verificar se está rodando como root
if [ "$EUID" -ne 0 ]; then
    print_error "Este script precisa ser executado como root (sudo)"
    exit 1
fi

# Banner
echo ""
echo "=========================================="
echo "   AJ Leilões - Instalação Automática"
echo "=========================================="
echo ""

# Perguntar domínio
read -p "Digite seu domínio (ou pressione Enter para usar IP): " DOMAIN
if [ -z "$DOMAIN" ]; then
    DOMAIN=$(curl -s ifconfig.me)
    print_warning "Usando IP: $DOMAIN"
fi

# Perguntar senha do admin
read -s -p "Digite a senha para o painel admin (mínimo 6 caracteres): " ADMIN_PASS
echo ""
if [ ${#ADMIN_PASS} -lt 6 ]; then
    print_error "Senha muito curta. Use pelo menos 6 caracteres."
    exit 1
fi

print_status "Iniciando instalação..."

#===============================================================================
# 1. Atualizar sistema
#===============================================================================
print_status "Atualizando sistema..."
apt-get update -qq
apt-get upgrade -y -qq
print_success "Sistema atualizado"

#===============================================================================
# 2. Instalar dependências básicas
#===============================================================================
print_status "Instalando dependências básicas..."
apt-get install -y -qq \
    curl \
    wget \
    git \
    build-essential \
    software-properties-common \
    gnupg \
    ca-certificates \
    lsb-release \
    unzip
print_success "Dependências básicas instaladas"

#===============================================================================
# 3. Instalar Node.js 20.x
#===============================================================================
print_status "Instalando Node.js 20.x..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y -qq nodejs
npm install -g yarn pm2
print_success "Node.js $(node -v) instalado"

#===============================================================================
# 4. Instalar Python 3.11+
#===============================================================================
print_status "Instalando Python..."
apt-get install -y -qq python3 python3-pip python3-venv
print_success "Python $(python3 --version) instalado"

#===============================================================================
# 5. Instalar MongoDB
#===============================================================================
print_status "Instalando MongoDB..."
curl -fsSL https://pgp.mongodb.com/server-7.0.asc | gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu $(lsb_release -cs)/mongodb-org/7.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-7.0.list
apt-get update -qq
apt-get install -y -qq mongodb-org
systemctl start mongod
systemctl enable mongod
print_success "MongoDB instalado e rodando"

#===============================================================================
# 6. Instalar Nginx
#===============================================================================
print_status "Instalando Nginx..."
apt-get install -y -qq nginx
systemctl enable nginx
print_success "Nginx instalado"

#===============================================================================
# 7. Criar diretório da aplicação
#===============================================================================
print_status "Criando estrutura de diretórios..."
mkdir -p $APP_DIR/{frontend,backend}
print_success "Diretórios criados em $APP_DIR"

#===============================================================================
# 8. Copiar arquivos (assumindo que estão no diretório atual)
#===============================================================================
print_status "Copiando arquivos da aplicação..."

# Se o script está sendo executado de dentro do projeto
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

if [ -d "$PROJECT_DIR/frontend" ] && [ -d "$PROJECT_DIR/backend" ]; then
    cp -r "$PROJECT_DIR/frontend/"* "$APP_DIR/frontend/"
    cp -r "$PROJECT_DIR/backend/"* "$APP_DIR/backend/"
    print_success "Arquivos copiados"
else
    print_warning "Arquivos do projeto não encontrados. Copie manualmente para $APP_DIR"
fi

#===============================================================================
# 9. Configurar Backend
#===============================================================================
print_status "Configurando Backend..."

cd $APP_DIR/backend

# Criar ambiente virtual
python3 -m venv venv
source venv/bin/activate

# Instalar dependências
pip install --upgrade pip -q
pip install -r requirements.txt -q

# Criar arquivo .env
cat > .env << EOF
MONGO_URL="mongodb://localhost:27017"
DB_NAME="$DB_NAME"
CORS_ORIGINS="*"
WHATSAPP_LOJA=""
IMGUR_CLIENT_ID=""
EOF

deactivate
print_success "Backend configurado"

#===============================================================================
# 10. Configurar Frontend
#===============================================================================
print_status "Configurando Frontend..."

cd $APP_DIR/frontend

# Criar arquivo .env
if [ "$DOMAIN" = "$(curl -s ifconfig.me)" ]; then
    # Usando IP
    cat > .env << EOF
REACT_APP_BACKEND_URL=http://$DOMAIN
EOF
else
    # Usando domínio
    cat > .env << EOF
REACT_APP_BACKEND_URL=https://$DOMAIN
EOF
fi

# Instalar dependências e fazer build
yarn install --silent
yarn build

print_success "Frontend configurado e build concluído"

#===============================================================================
# 11. Configurar PM2 para Backend
#===============================================================================
print_status "Configurando PM2 para gerenciar o backend..."

cat > $APP_DIR/ecosystem.config.js << EOF
module.exports = {
  apps: [
    {
      name: 'ajleiloes-backend',
      cwd: '$APP_DIR/backend',
      script: 'venv/bin/uvicorn',
      args: 'server:app --host 0.0.0.0 --port 8001',
      interpreter: 'none',
      env: {
        NODE_ENV: 'production',
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
    },
  ],
};
EOF

pm2 start $APP_DIR/ecosystem.config.js
pm2 save
pm2 startup systemd -u root --hp /root
print_success "PM2 configurado"

#===============================================================================
# 12. Configurar Nginx
#===============================================================================
print_status "Configurando Nginx..."

cat > /etc/nginx/sites-available/ajleiloes << EOF
server {
    listen 80;
    server_name $DOMAIN;

    # Frontend (arquivos estáticos)
    location / {
        root $APP_DIR/frontend/build;
        index index.html;
        try_files \$uri \$uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://127.0.0.1:8001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 90;
    }

    # Upload de arquivos (se necessário)
    client_max_body_size 50M;
}
EOF

# Ativar site
ln -sf /etc/nginx/sites-available/ajleiloes /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Testar e reiniciar Nginx
nginx -t
systemctl restart nginx
print_success "Nginx configurado"

#===============================================================================
# 13. Configurar Firewall (UFW)
#===============================================================================
print_status "Configurando Firewall..."
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw --force enable
print_success "Firewall configurado"

#===============================================================================
# 14. Instalar SSL com Let's Encrypt (se tiver domínio)
#===============================================================================
if [ "$DOMAIN" != "$(curl -s ifconfig.me)" ]; then
    print_status "Instalando certificado SSL..."
    apt-get install -y -qq certbot python3-certbot-nginx
    certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN --redirect || true
    print_success "SSL configurado"
else
    print_warning "SSL não configurado (necessário domínio). Acesse via HTTP."
fi

#===============================================================================
# 15. Criar usuário admin no banco
#===============================================================================
print_status "Criando usuário administrador..."

# Gerar hash da senha usando Python
HASHED_PASS=$(python3 -c "from passlib.context import CryptContext; pwd_context = CryptContext(schemes=['bcrypt'], deprecated='auto'); print(pwd_context.hash('$ADMIN_PASS'))")

# Inserir usuário no MongoDB
mongosh $DB_NAME --quiet --eval "
db.users.deleteMany({username: '$ADMIN_USER'});
db.users.insertOne({
    id: '$(uuidgen)',
    username: '$ADMIN_USER',
    hashed_password: '$HASHED_PASS',
    created_at: new Date()
});
print('Usuário admin criado');
"
print_success "Usuário admin criado"

#===============================================================================
# 16. Criar script de atualização
#===============================================================================
cat > $APP_DIR/update.sh << 'EOF'
#!/bin/bash
cd /var/www/ajleiloes

# Atualizar backend
cd backend
source venv/bin/activate
pip install -r requirements.txt -q
deactivate

# Atualizar frontend
cd ../frontend
yarn install --silent
yarn build

# Reiniciar serviços
pm2 restart all
sudo systemctl restart nginx

echo "Atualização concluída!"
EOF
chmod +x $APP_DIR/update.sh

#===============================================================================
# Finalização
#===============================================================================
echo ""
echo "=========================================="
echo -e "${GREEN}   Instalação Concluída com Sucesso!${NC}"
echo "=========================================="
echo ""
echo "Informações de Acesso:"
echo "----------------------------------------"
if [ "$DOMAIN" = "$(curl -s ifconfig.me)" ]; then
    echo -e "Site:           ${BLUE}http://$DOMAIN${NC}"
else
    echo -e "Site:           ${BLUE}https://$DOMAIN${NC}"
fi
echo -e "Painel Admin:   ${BLUE}http://$DOMAIN/admin/login${NC}"
echo -e "Usuário:        ${YELLOW}$ADMIN_USER${NC}"
echo -e "Senha:          ${YELLOW}(a que você definiu)${NC}"
echo ""
echo "Comandos Úteis:"
echo "----------------------------------------"
echo "Ver logs:       pm2 logs"
echo "Status:         pm2 status"
echo "Reiniciar:      pm2 restart all"
echo "Atualizar:      $APP_DIR/update.sh"
echo ""
echo "Diretórios:"
echo "----------------------------------------"
echo "Aplicação:      $APP_DIR"
echo "Logs Nginx:     /var/log/nginx/"
echo "Config Nginx:   /etc/nginx/sites-available/ajleiloes"
echo ""
print_warning "IMPORTANTE: Salve suas credenciais em local seguro!"
echo ""
