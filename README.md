# Docker Setup - Wishzy Backend

## LOCAL (Development)

```bash
cd be

# Chạy với Docker Compose
docker-compose up -d

# Xem logs
docker-compose logs -f

# Chạy migrations
docker-compose exec app npm run migration:run

# Seed data (nếu cần)
docker-compose exec app npm run seed

# Dừng
docker-compose down

# Rebuild khi có thay đổi code
docker-compose up -d --build

# Xóa tất cả (bao gồm data)
docker-compose down -v
```

**Truy cập:**
- API: http://localhost:8000
- Swagger: http://localhost:8000/api
- PostgreSQL: localhost:5432

---

## VPS (Production)

### 1. Cài Docker trên VPS

```bash
# SSH vào VPS
ssh root@your-vps-ip

# Update system
apt update && apt upgrade -y

# Cài Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Cài Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Verify
docker --version
docker-compose --version
```

### 2. Upload code lên VPS

```bash
# Từ máy local
scp -r ./be root@your-vps-ip:/var/www/wishzy/

# Hoặc dùng Git
ssh root@your-vps-ip
cd /var/www
git clone your-repo-url wishzy
```

### 3. Cấu hình .env.production

```bash
cd /var/www/wishzy/be
nano .env.production
```

**⚠️ BẮT BUỘC thay đổi:**

```bash
# 1. Database password (đừng dùng mặc định)
DB_PASSWORD=your_strong_password_here

# 2. JWT secrets (generate random)
JWT_SECRET=your_random_32_chars_string
JWT_REFRESH_SECRET=your_different_random_string

# 3. Domains
ALLOWED_ORIGINS=https://your-domain.com,https://www.your-domain.com
FRONTEND_URL=https://your-frontend-domain.com
VNP_RETURN_URL=https://your-domain.com/api/v1/orders
GOOGLE_CALLBACK_URL=https://your-domain.com/api/v1/auth/google/callback

# 4. Tắt Swagger
SWAGGER_ENABLED=false
```

**Generate JWT secrets:**
```bash
# Linux/Mac
openssl rand -base64 32

# Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

### 4. Chạy Docker trên VPS

```bash
cd /var/www/wishzy/be

# Build và start
docker-compose -f docker-compose.yml -f docker-compose.prod.yml --env-file .env.production up -d --build

# Xem logs
docker-compose logs -f

# Check status
docker-compose ps
```

### 5. Chạy Migrations

```bash
# Vào container
docker-compose exec app sh

# Chạy migrations
npm run migration:run

# Seed data (nếu cần)
npm run seed

# Exit
exit
```

### 6. Setup Nginx (Reverse Proxy)

```bash
# Cài Nginx
apt install nginx -y

# Tạo config
nano /etc/nginx/sites-available/wishzy
```

**Paste config:**

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    location / {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

**Enable site:**

```bash
# Link config
ln -s /etc/nginx/sites-available/wishzy /etc/nginx/sites-enabled/

# Test config
nginx -t

# Restart Nginx
systemctl restart nginx
```

### 7. Setup SSL (Let's Encrypt)

```bash
# Cài Certbot
apt install certbot python3-certbot-nginx -y

# Generate SSL certificate
certbot --nginx -d your-domain.com -d www.your-domain.com

# Test auto-renewal
certbot renew --dry-run
```

### 8. Setup Firewall

```bash
# Enable UFW
ufw enable

# Allow ports
ufw allow 22/tcp   # SSH
ufw allow 80/tcp   # HTTP
ufw allow 443/tcp  # HTTPS

# Check status
ufw status
```

---

## Quản lý Production

### Update code

```bash
cd /var/www/wishzy/be

# Pull latest
git pull origin main

# Rebuild
docker-compose -f docker-compose.yml -f docker-compose.prod.yml --env-file .env.production up -d --build

# Run new migrations
docker-compose exec app npm run migration:run
```

### Xem logs

```bash
# App logs
docker-compose logs -f app

# PostgreSQL logs
docker-compose logs -f postgres

# Nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### Backup Database

```bash
# Backup
docker-compose exec postgres pg_dump -U postgres wishzy_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore
docker-compose exec -T postgres psql -U postgres wishzy_db < backup_20241129.sql
```

### Restart services

```bash
# Restart all
docker-compose restart

# Restart app only
docker-compose restart app

# Restart Nginx
systemctl restart nginx
```

### Monitor resources

```bash
# Docker stats
docker stats

# Disk usage
df -h

# Memory
free -h

# Processes
htop
```

---

## Troubleshooting

### Container không start
```bash
docker-compose logs app
docker-compose restart app
```

### Database connection failed
```bash
docker-compose exec postgres pg_isready -U postgres
docker-compose restart postgres
```

### Nginx 502 Bad Gateway
```bash
# Check app running
docker-compose ps

# Check Nginx
nginx -t
tail -f /var/log/nginx/error.log
```

### Port đã được sử dụng
```bash
# Check port
netstat -tulpn | grep 8000

# Kill process
kill -9 <PID>
```

---

## Truy cập

**Local:**
- API: http://localhost:8000
- Swagger: http://localhost:8000/api

**Production:**
- API: https://your-domain.com
- Health: https://your-domain.com/health
