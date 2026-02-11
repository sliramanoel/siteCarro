#!/bin/bash

#===============================================================================
# Script de Instalação Automática - AJ Leilões
# Compatível com: Ubuntu 20.04/22.04, Debian 11/12
# Inclui: SSL Gratuito com Let's Encrypt
#===============================================================================

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configurações
APP_DIR="/var/www/ajleiloes"
DB_NAME="ajleiloes_db"
ADMIN_USER="admin"

# Variáveis globais
DOMAIN=""
ADMIN_PASS=""
ADMIN_EMAIL=""
SETUP_SSL="n"
SERVER_IP=""

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

print_header() {
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${CYAN}  $1${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

# Verificar se está rodando como root
check_root() {
    if [ "$EUID" -ne 0 ]; then
        print_error "Este script precisa ser executado como root (sudo)"
        exit 1
    fi
}

# Obter IP do servidor
get_server_ip() {
    SERVER_IP=$(curl -s ifconfig.me 2>/dev/null || curl -s icanhazip.com 2>/dev/null || hostname -I | awk '{print $1}')
}

# Coletar informações do usuário
collect_user_input() {
    print_header "CONFIGURAÇÃO INICIAL"
    echo ""
    
    # Domínio
    echo -e "${YELLOW}Passo 1/4: Configuração de Domínio${NC}"
    echo "Se você tem um domínio (ex: ajleiloes.com.br), digite-o abaixo."
    echo "Se não tem, pressione Enter para usar o IP do servidor."
    echo ""
    read -p "Domínio (ou Enter para IP): " DOMAIN
    
    if [ -z "$DOMAIN" ]; then
        DOMAIN=$SERVER_IP
        print_warning "Usando IP do servidor: $DOMAIN"
        SETUP_SSL="n"
    else
        echo ""
        # SSL
        echo -e "${YELLOW}Passo 2/4: Certificado SSL (HTTPS)${NC}"
        echo "O Let's Encrypt oferece certificados SSL gratuitos."
        echo "Requisitos: domínio válido apontando para este servidor."
        echo ""
        read -p "Deseja configurar SSL gratuito? (s/n): " SETUP_SSL
        SETUP_SSL=$(echo "$SETUP_SSL" | tr '[:upper:]' '[:lower:]')
        
        if [ "$SETUP_SSL" = "s" ] || [ "$SETUP_SSL" = "sim" ] || [ "$SETUP_SSL" = "y" ] || [ "$SETUP_SSL" = "yes" ]; then
            SETUP_SSL="s"
            echo ""
            echo "Digite seu email para notificações do Let's Encrypt"
            echo "(usado para avisos de expiração do certificado)"
            read -p "Email: " ADMIN_EMAIL
            
            if [ -z "$ADMIN_EMAIL" ]; then
                print_warning "Email não informado. Usando email genérico."
                ADMIN_EMAIL="admin@$DOMAIN"
            fi
        fi
    fi
    
    echo ""
    # Senha do admin
    echo -e "${YELLOW}Passo 3/4: Senha do Administrador${NC}"
    echo "Esta senha será usada para acessar o painel administrativo."
    echo ""
    while true; do
        read -s -p "Digite a senha (mínimo 6 caracteres): " ADMIN_PASS
        echo ""
        if [ ${#ADMIN_PASS} -lt 6 ]; then
            print_error "Senha muito curta. Use pelo menos 6 caracteres."
        else
            read -s -p "Confirme a senha: " ADMIN_PASS_CONFIRM
            echo ""
            if [ "$ADMIN_PASS" = "$ADMIN_PASS_CONFIRM" ]; then
                break
            else
                print_error "As senhas não coincidem. Tente novamente."
            fi
        fi
    done
    
    echo ""
    # Confirmação
    echo -e "${YELLOW}Passo 4/4: Confirmação${NC}"
    echo ""
    echo "Configurações definidas:"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo -e "  Domínio/IP:  ${GREEN}$DOMAIN${NC}"
    if [ "$SETUP_SSL" = "s" ]; then
        echo -e "  SSL:         ${GREEN}Sim (Let's Encrypt)${NC}"
        echo -e "  Email:       ${GREEN}$ADMIN_EMAIL${NC}"
    else
        echo -e "  SSL:         ${YELLOW}Não${NC}"
    fi
    echo -e "  Admin:       ${GREEN}$ADMIN_USER${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    read -p "Confirma e deseja continuar? (s/n): " CONFIRM
    
    if [ "$CONFIRM" != "s" ] && [ "$CONFIRM" != "S" ] && [ "$CONFIRM" != "sim" ] && [ "$CONFIRM" != "y" ]; then
        print_warning "Instalação cancelada pelo usuário."
        exit 0
    fi
}

# Atualizar sistema
update_system() {
    print_header "ATUALIZANDO SISTEMA"
    apt-get update -qq
    apt-get upgrade -y -qq
    print_success "Sistema atualizado"
}

# Instalar dependências básicas
install_dependencies() {
    print_header "INSTALANDO DEPENDÊNCIAS"
    apt-get install -y -qq \
        curl \
        wget \
        git \
        build-essential \
        software-properties-common \
        gnupg \
        ca-certificates \
        lsb-release \
        unzip \
        uuid-runtime
    print_success "Dependências básicas instaladas"
}

# Instalar Node.js
install_nodejs() {
    print_status "Instalando Node.js 20.x..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - >/dev/null 2>&1
    apt-get install -y -qq nodejs
    npm install -g yarn pm2 >/dev/null 2>&1
    print_success "Node.js $(node -v) instalado"
}

# Instalar Python
install_python() {
    print_status "Instalando Python..."
    apt-get install -y -qq python3 python3-pip python3-venv
    print_success "Python $(python3 --version | cut -d' ' -f2) instalado"
}

# Instalar MongoDB
install_mongodb() {
    print_status "Instalando MongoDB..."
    
    # Detectar versão do Ubuntu/Debian
    . /etc/os-release
    UBUNTU_CODENAME=$(lsb_release -cs)
    
    # Ubuntu 24.04 (noble) não tem suporte oficial para MongoDB 7.0
    # Usar jammy (22.04) como fallback para noble
    if [ "$UBUNTU_CODENAME" = "noble" ]; then
        print_warning "Ubuntu 24.04 detectado. Usando repositório compatível..."
        UBUNTU_CODENAME="jammy"
    fi
    
    # Importar chave GPG do MongoDB
    curl -fsSL https://pgp.mongodb.com/server-7.0.asc | gpg --dearmor -o /usr/share/keyrings/mongodb-server-7.0.gpg 2>/dev/null
    
    if [ "$ID" = "ubuntu" ]; then
        echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu ${UBUNTU_CODENAME}/mongodb-org/7.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-7.0.list >/dev/null
    else
        # Para Debian
        DEBIAN_CODENAME=$(lsb_release -cs)
        if [ "$DEBIAN_CODENAME" = "trixie" ] || [ "$DEBIAN_CODENAME" = "sid" ]; then
            DEBIAN_CODENAME="bookworm"
        fi
        echo "deb [ signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/debian ${DEBIAN_CODENAME}/mongodb-org/7.0 main" | tee /etc/apt/sources.list.d/mongodb-org-7.0.list >/dev/null
    fi
    
    apt-get update -qq
    apt-get install -y -qq mongodb-org
    
    # Iniciar e habilitar MongoDB
    systemctl start mongod
    systemctl enable mongod >/dev/null 2>&1
    
    # Verificar se MongoDB está rodando
    sleep 2
    if systemctl is-active --quiet mongod; then
        print_success "MongoDB instalado e rodando"
    else
        print_warning "MongoDB instalado. Tentando iniciar novamente..."
        systemctl start mongod
        sleep 2
        if systemctl is-active --quiet mongod; then
            print_success "MongoDB iniciado com sucesso"
        else
            print_error "Problema ao iniciar MongoDB. Verifique: sudo systemctl status mongod"
        fi
    fi
}

# Instalar Nginx
install_nginx() {
    print_status "Instalando Nginx..."
    apt-get install -y -qq nginx
    systemctl enable nginx >/dev/null 2>&1
    print_success "Nginx instalado"
}

# Configurar aplicação
setup_application() {
    print_header "CONFIGURANDO APLICAÇÃO"
    
    # Criar diretórios
    print_status "Criando estrutura de diretórios..."
    mkdir -p $APP_DIR/{frontend,backend,deploy}
    
    # Copiar arquivos
    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
    
    if [ -d "$PROJECT_DIR/frontend" ] && [ -d "$PROJECT_DIR/backend" ]; then
        print_status "Copiando arquivos do projeto..."
        cp -r "$PROJECT_DIR/frontend/"* "$APP_DIR/frontend/" 2>/dev/null || true
        cp -r "$PROJECT_DIR/backend/"* "$APP_DIR/backend/" 2>/dev/null || true
        cp -r "$PROJECT_DIR/deploy/"* "$APP_DIR/deploy/" 2>/dev/null || true
        print_success "Arquivos copiados"
    else
        print_warning "Arquivos não encontrados. Copie manualmente para $APP_DIR"
    fi
}

# Configurar Backend
setup_backend() {
    print_status "Configurando Backend..."
    
    cd $APP_DIR/backend
    
    # Criar ambiente virtual
    python3 -m venv venv
    source venv/bin/activate
    
    # Instalar dependências
    pip install --upgrade pip -q
    if [ -f "requirements.txt" ]; then
        pip install -r requirements.txt -q
    fi
    
    # Criar .env
    cat > .env << EOF
MONGO_URL="mongodb://localhost:27017"
DB_NAME="$DB_NAME"
CORS_ORIGINS="*"
WHATSAPP_LOJA=""
IMGUR_CLIENT_ID=""
EOF
    
    deactivate
    print_success "Backend configurado"
}

# Configurar Frontend
setup_frontend() {
    print_status "Configurando Frontend..."
    
    cd $APP_DIR/frontend
    
    # Definir URL do backend
    if [ "$SETUP_SSL" = "s" ]; then
        BACKEND_URL="https://$DOMAIN"
    else
        BACKEND_URL="http://$DOMAIN"
    fi
    
    cat > .env << EOF
REACT_APP_BACKEND_URL=$BACKEND_URL
EOF
    
    # Instalar dependências e build
    if [ -f "package.json" ]; then
        yarn install --silent 2>/dev/null
        yarn build 2>/dev/null
    fi
    
    print_success "Frontend configurado"
}

# Configurar PM2
setup_pm2() {
    print_status "Configurando PM2..."
    
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
    
    pm2 start $APP_DIR/ecosystem.config.js >/dev/null 2>&1
    pm2 save >/dev/null 2>&1
    pm2 startup systemd -u root --hp /root >/dev/null 2>&1
    print_success "PM2 configurado"
}

# Configurar Nginx (sem SSL)
setup_nginx_no_ssl() {
    print_status "Configurando Nginx (HTTP)..."
    
    cat > /etc/nginx/sites-available/ajleiloes << EOF
server {
    listen 80;
    server_name $DOMAIN;

    # Frontend
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

    client_max_body_size 50M;
}
EOF
    
    ln -sf /etc/nginx/sites-available/ajleiloes /etc/nginx/sites-enabled/
    rm -f /etc/nginx/sites-enabled/default
    
    nginx -t >/dev/null 2>&1
    systemctl restart nginx
    print_success "Nginx configurado (HTTP)"
}

# Configurar SSL com Let's Encrypt
setup_ssl() {
    print_header "CONFIGURANDO SSL (LET'S ENCRYPT)"
    
    print_status "Instalando Certbot..."
    apt-get install -y -qq certbot python3-certbot-nginx
    
    print_status "Verificando configuração do domínio..."
    
    # Verificar se o domínio aponta para este servidor
    DOMAIN_IP=$(dig +short $DOMAIN 2>/dev/null | head -1)
    
    if [ "$DOMAIN_IP" != "$SERVER_IP" ]; then
        print_warning "ATENÇÃO: O domínio $DOMAIN parece não apontar para este servidor."
        print_warning "IP do domínio: $DOMAIN_IP"
        print_warning "IP do servidor: $SERVER_IP"
        echo ""
        read -p "Deseja tentar configurar SSL mesmo assim? (s/n): " TRY_SSL
        if [ "$TRY_SSL" != "s" ] && [ "$TRY_SSL" != "S" ]; then
            print_warning "SSL não configurado. Você pode configurar depois com:"
            echo "  sudo certbot --nginx -d $DOMAIN"
            return
        fi
    fi
    
    print_status "Obtendo certificado SSL..."
    
    # Tentar obter certificado
    if certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email $ADMIN_EMAIL --redirect 2>/dev/null; then
        print_success "Certificado SSL instalado com sucesso!"
        
        # Configurar renovação automática
        print_status "Configurando renovação automática..."
        
        # Criar script de renovação
        cat > /etc/cron.d/certbot-renew << EOF
# Renovação automática do certificado SSL
0 3 * * * root certbot renew --quiet --post-hook "systemctl reload nginx"
EOF
        
        # Testar renovação
        certbot renew --dry-run >/dev/null 2>&1 && print_success "Renovação automática configurada"
        
    else
        print_error "Falha ao obter certificado SSL."
        print_warning "Possíveis causas:"
        echo "  1. Domínio não aponta para este servidor"
        echo "  2. Porta 80 bloqueada no firewall"
        echo "  3. DNS ainda não propagou"
        echo ""
        print_warning "O site funcionará via HTTP. Configure SSL depois com:"
        echo "  sudo certbot --nginx -d $DOMAIN"
    fi
}

# Configurar Firewall
setup_firewall() {
    print_status "Configurando Firewall..."
    ufw allow 22/tcp >/dev/null 2>&1   # SSH
    ufw allow 80/tcp >/dev/null 2>&1   # HTTP
    ufw allow 443/tcp >/dev/null 2>&1  # HTTPS
    ufw --force enable >/dev/null 2>&1
    print_success "Firewall configurado"
}

# Criar usuário admin
create_admin_user() {
    print_status "Criando usuário administrador..."
    
    cd $APP_DIR/backend
    source venv/bin/activate
    
    # Gerar hash da senha
    HASHED_PASS=$(python3 -c "from passlib.context import CryptContext; pwd_context = CryptContext(schemes=['bcrypt'], deprecated='auto'); print(pwd_context.hash('$ADMIN_PASS'))")
    
    deactivate
    
    # Inserir no MongoDB
    mongosh $DB_NAME --quiet --eval "
    db.users.deleteMany({username: '$ADMIN_USER'});
    db.users.insertOne({
        id: '$(uuidgen)',
        username: '$ADMIN_USER',
        hashed_password: '$HASHED_PASS',
        created_at: new Date()
    });
    " >/dev/null 2>&1
    
    print_success "Usuário admin criado"
}

# Criar scripts auxiliares
create_helper_scripts() {
    # Script de atualização
    cat > $APP_DIR/update.sh << 'UPDATEEOF'
#!/bin/bash
echo "Atualizando AJ Leilões..."

cd /var/www/ajleiloes

# Backend
echo "[*] Atualizando backend..."
cd backend
source venv/bin/activate
pip install -r requirements.txt -q
deactivate

# Frontend
echo "[*] Atualizando frontend..."
cd ../frontend
yarn install --silent
yarn build

# Reiniciar
echo "[*] Reiniciando serviços..."
pm2 restart all
sudo systemctl restart nginx

echo "[✓] Atualização concluída!"
UPDATEEOF
    chmod +x $APP_DIR/update.sh
    
    # Script de status
    cat > $APP_DIR/status.sh << 'STATUSEOF'
#!/bin/bash
echo "=== Status AJ Leilões ==="
echo ""
echo "PM2 (Backend):"
pm2 status
echo ""
echo "Nginx:"
systemctl status nginx --no-pager | head -5
echo ""
echo "MongoDB:"
systemctl status mongod --no-pager | head -5
STATUSEOF
    chmod +x $APP_DIR/status.sh
}

# Exibir informações finais
show_final_info() {
    echo ""
    print_header "INSTALAÇÃO CONCLUÍDA COM SUCESSO!"
    echo ""
    echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}                    INFORMAÇÕES DE ACESSO                       ${NC}"
    echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
    echo ""
    
    if [ "$SETUP_SSL" = "s" ]; then
        echo -e "  🌐 Site:          ${CYAN}https://$DOMAIN${NC}"
        echo -e "  🔐 Painel Admin:  ${CYAN}https://$DOMAIN/admin/login${NC}"
        echo -e "  🔒 SSL:           ${GREEN}Ativo (Let's Encrypt)${NC}"
    else
        echo -e "  🌐 Site:          ${CYAN}http://$DOMAIN${NC}"
        echo -e "  🔐 Painel Admin:  ${CYAN}http://$DOMAIN/admin/login${NC}"
        echo -e "  🔒 SSL:           ${YELLOW}Não configurado${NC}"
    fi
    
    echo ""
    echo -e "  👤 Usuário:       ${YELLOW}$ADMIN_USER${NC}"
    echo -e "  🔑 Senha:         ${YELLOW}(a que você definiu)${NC}"
    echo ""
    echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}                     COMANDOS ÚTEIS                             ${NC}"
    echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
    echo ""
    echo "  Ver status:       $APP_DIR/status.sh"
    echo "  Ver logs:         pm2 logs"
    echo "  Reiniciar:        pm2 restart all"
    echo "  Atualizar:        $APP_DIR/update.sh"
    echo "  Backup:           $APP_DIR/deploy/backup.sh"
    echo ""
    
    if [ "$SETUP_SSL" != "s" ] && [ "$DOMAIN" != "$SERVER_IP" ]; then
        echo -e "${YELLOW}═══════════════════════════════════════════════════════════════${NC}"
        echo -e "${YELLOW}                  CONFIGURAR SSL DEPOIS                        ${NC}"
        echo -e "${YELLOW}═══════════════════════════════════════════════════════════════${NC}"
        echo ""
        echo "  Para ativar HTTPS gratuito, execute:"
        echo ""
        echo "    sudo certbot --nginx -d $DOMAIN"
        echo ""
    fi
    
    echo -e "${RED}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${RED}  ⚠️  IMPORTANTE: Salve suas credenciais em local seguro!      ${NC}"
    echo -e "${RED}═══════════════════════════════════════════════════════════════${NC}"
    echo ""
}

#===============================================================================
# EXECUÇÃO PRINCIPAL
#===============================================================================

main() {
    clear
    echo ""
    echo -e "${CYAN}"
    echo "    ___       _    _       _ _   _              "
    echo "   / _ \     | |  | |     (_) | (_)             "
    echo "  / /_\ \    | |  | | ___  _| |_ _  ___  _ __   "
    echo "  |  _  | _  | |  | |/ _ \| | __| |/ _ \| '_ \  "
    echo "  | | | || |_| |  | |  __/| | |_| | (_) | | | | "
    echo "  \_| |_/ \___/   |_|\___||_|\__|_|\___/|_| |_| "
    echo ""
    echo "  Script de Instalação Automática para VPS"
    echo -e "${NC}"
    echo ""
    
    check_root
    get_server_ip
    collect_user_input
    
    echo ""
    print_header "INICIANDO INSTALAÇÃO"
    
    update_system
    install_dependencies
    install_nodejs
    install_python
    install_mongodb
    install_nginx
    setup_application
    setup_backend
    setup_frontend
    setup_pm2
    setup_nginx_no_ssl
    setup_firewall
    
    if [ "$SETUP_SSL" = "s" ]; then
        setup_ssl
    fi
    
    create_admin_user
    create_helper_scripts
    
    show_final_info
}

# Executar
main "$@"
