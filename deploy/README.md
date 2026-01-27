# 🚗 AJ Leilões - Guia de Instalação em VPS

## Requisitos Mínimos

| Recurso | Mínimo | Recomendado |
|---------|--------|-------------|
| RAM | 1 GB | 2 GB |
| CPU | 1 vCPU | 2 vCPU |
| Disco | 20 GB | 40 GB |
| Sistema | Ubuntu 20.04+ / Debian 11+ | Ubuntu 22.04 |

---

## 🚀 Instalação Rápida

### 1. Acesse sua VPS via SSH
```bash
ssh root@SEU_IP_DA_VPS
```

### 2. Baixe os arquivos do projeto
Você pode transferir os arquivos via SFTP ou clonar de um repositório:

```bash
# Opção 1: Via SFTP (use FileZilla, WinSCP, etc.)
# Transfira a pasta do projeto para /root/ajleiloes

# Opção 2: Via Git (se tiver repositório)
git clone SEU_REPOSITORIO /root/ajleiloes
```

### 3. Execute o script de instalação
```bash
cd /root/ajleiloes/deploy
chmod +x install.sh
sudo ./install.sh
```

### 4. Siga as instruções na tela
- Digite seu domínio (ou deixe em branco para usar IP)
- Digite a senha do painel administrativo

---

## 📋 O que o script instala automaticamente

- ✅ Node.js 20.x
- ✅ Python 3.x
- ✅ MongoDB 7.0
- ✅ Nginx (servidor web)
- ✅ PM2 (gerenciador de processos)
- ✅ Certbot (SSL gratuito)
- ✅ UFW (firewall)

---

## 🔧 Comandos Úteis

### Gerenciar Aplicação
```bash
# Ver status dos serviços
pm2 status

# Ver logs em tempo real
pm2 logs

# Reiniciar aplicação
pm2 restart all

# Parar aplicação
pm2 stop all
```

### Gerenciar Nginx
```bash
# Reiniciar Nginx
sudo systemctl restart nginx

# Ver logs de acesso
sudo tail -f /var/log/nginx/access.log

# Ver logs de erro
sudo tail -f /var/log/nginx/error.log
```

### Gerenciar MongoDB
```bash
# Acessar console do MongoDB
mongosh ajleiloes_db

# Ver coleções
show collections

# Ver carros cadastrados
db.cars.find().pretty()

# Ver configurações do site
db.site_settings.find().pretty()
```

---

## 🔄 Atualização do Sistema

Para atualizar o site após fazer alterações:

```bash
# 1. Transfira os arquivos atualizados para a VPS

# 2. Execute o script de atualização
/var/www/ajleiloes/update.sh
```

---

## 💾 Backup

### Backup Manual
```bash
/var/www/ajleiloes/deploy/backup.sh
```

### Backup Automático (cron)
```bash
# Editar crontab
crontab -e

# Adicionar linha para backup diário às 3h da manhã
0 3 * * * /var/www/ajleiloes/deploy/backup.sh
```

### Restaurar Backup
```bash
# Restaurar MongoDB
mongorestore --db=ajleiloes_db /var/backups/ajleiloes/mongo_DATA/ajleiloes_db

# Restaurar configurações
tar -xzf /var/backups/ajleiloes/config_DATA.tar.gz -C /
```

---

## 🌐 Configurar Domínio

### 1. No painel da Hostgator (ou seu provedor de DNS):
- Crie um registro **A** apontando para o IP da VPS
- Exemplo: `ajleiloes.com.br` → `123.456.789.10`

### 2. Aguarde a propagação DNS (até 24h)

### 3. Execute para obter SSL:
```bash
sudo certbot --nginx -d seudominio.com.br
```

---

## 🔒 Segurança Recomendada

### 1. Alterar porta SSH (opcional)
```bash
sudo nano /etc/ssh/sshd_config
# Altere: Port 22 → Port 2222

sudo systemctl restart sshd
sudo ufw allow 2222/tcp
```

### 2. Criar usuário não-root
```bash
adduser deploy
usermod -aG sudo deploy
```

### 3. Configurar fail2ban
```bash
sudo apt install fail2ban
sudo systemctl enable fail2ban
```

---

## ❓ Solução de Problemas

### Site não carrega
```bash
# Verificar se os serviços estão rodando
pm2 status
sudo systemctl status nginx
sudo systemctl status mongod

# Verificar logs
pm2 logs
sudo tail -f /var/log/nginx/error.log
```

### Erro 502 Bad Gateway
```bash
# Backend pode estar parado
pm2 restart all

# Verificar se a porta 8001 está sendo usada
sudo netstat -tlnp | grep 8001
```

### Erro de conexão com MongoDB
```bash
# Verificar se MongoDB está rodando
sudo systemctl status mongod

# Reiniciar MongoDB
sudo systemctl restart mongod
```

### Problemas com SSL
```bash
# Renovar certificado manualmente
sudo certbot renew

# Verificar configuração Nginx
sudo nginx -t
```

---

## 📞 Suporte

Se tiver problemas durante a instalação:
1. Verifique os logs: `pm2 logs` e `/var/log/nginx/error.log`
2. Certifique-se de que todas as portas estão abertas no firewall
3. Verifique se o domínio está apontando corretamente para o IP da VPS

---

## 📁 Estrutura de Arquivos

```
/var/www/ajleiloes/
├── frontend/
│   ├── build/          # Arquivos estáticos (produção)
│   ├── src/            # Código fonte React
│   └── .env            # Configurações do frontend
├── backend/
│   ├── venv/           # Ambiente virtual Python
│   ├── server.py       # Aplicação FastAPI
│   ├── requirements.txt
│   └── .env            # Configurações do backend
├── deploy/
│   ├── install.sh      # Script de instalação
│   └── backup.sh       # Script de backup
├── ecosystem.config.js # Configuração PM2
└── update.sh           # Script de atualização
```
