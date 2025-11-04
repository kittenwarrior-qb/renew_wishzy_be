# 🚀 Hướng Dẫn Deploy Backend với Docker

## 📦 Files Cần Thiết

- `Dockerfile` - Cấu hình Docker image (dùng chung cho dev và prod)
- `docker-compose.yml` - Development environment (local)
- `docker-compose.prod.yml` - Production environment (VPS)
- `.env` - Biến môi trường development (tạo từ `env.example`)
- `.env.production` - Biến môi trường production (tạo từ `env.example`)

---

## Sự Khác Biệt Giữa Local và Production

### Development (Local)
- **File compose**: `docker-compose.yml`
- **Env file**: `.env`
- **Ports**: Database port (5432) được expose ra ngoài
- **Volumes**: Mount source code để hot reload (`./src:/app/src:ro`)
- **Restart**: `unless-stopped`
- **Swagger**: Bật mặc định (`SWAGGER_ENABLED=true`)
- **NODE_ENV**: `development`
- **Resource limits**: Không có (dùng hết resources của máy)

### Production (VPS)
- **File compose**: `docker-compose.prod.yml`
- **Env file**: `.env.production`
- **Ports**: Database port KHÔNG expose ra ngoài (bảo mật)
- **Volumes**: Chỉ mount logs, không mount source code
- **Restart**: `always` (tự động restart khi crash)
- **Swagger**: Tắt (`SWAGGER_ENABLED=false`)
- **NODE_ENV**: `production`
- **Resource limits**: Có giới hạn CPU và RAM (tối ưu cho VPS 2GB RAM)

---

## 💻 Development (Local)

### 1. Tạo file .env
```bash
cp env.example .env
```

### 2. Chỉnh sửa .env (nếu cần)
- Giữ nguyên các giá trị mặc định cho development
- Có thể thay đổi PORT, DB_PASSWORD nếu cần

### 3. Khởi động
```bash
# Build và start containers
docker-compose up -d --build

# Chờ database sẵn sàng (khoảng 10 giây)
sleep 10  # Linux/Mac
# hoặc timeout /t 10  # Windows

# Chạy migrations
docker-compose exec app npm run migration:run
```

### 4. Truy cập
- **API**: http://localhost:3000/api/v1
- **Swagger Docs**: http://localhost:3000/api/docs
- **Health Check**: http://localhost:3000/api/v1/health

### 5. Quản lý
```bash
# Xem logs
docker-compose logs -f

# Xem logs của app
docker-compose logs -f app

# Xem logs của database
docker-compose logs -f postgres

# Dừng containers
docker-compose stop

# Khởi động lại
docker-compose restart

# Dừng và xóa containers (giữ lại data)
docker-compose down

# Dừng và xóa tất cả (bao gồm volumes - MẤT DATA)
docker-compose down -v

# Rebuild containers
docker-compose up -d --build
```

---

## 🏭 Production (VPS)

### 1. Tạo file .env.production
```bash
cp env.example .env.production
nano .env.production  # hoặc vi, vim, code
```

### 2. Cấu hình .env.production (QUAN TRỌNG)

**Phải thay đổi các giá trị sau:**
- `NODE_ENV=production` - Đảm bảo là production
- `JWT_SECRET` - Chuỗi ngẫu nhiên mạnh (tối thiểu 32 ký tự)
- `JWT_REFRESH_SECRET` - Chuỗi ngẫu nhiên mạnh (tối thiểu 32 ký tự)
- `DB_PASSWORD` - Mật khẩu database mạnh
- `SWAGGER_ENABLED=false` - Tắt Swagger trong production
- `ALLOWED_ORIGINS` - URL frontend của bạn (ví dụ: `https://yourdomain.com`)
- `FRONTEND_URL` - URL frontend của bạn (ví dụ: `https://yourdomain.com`)

**Tạo JWT secret mạnh:**
```bash
# Linux/Mac
openssl rand -base64 32

# Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

### 3. Khởi động
```bash
# Build và start containers
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d --build

# Chờ database sẵn sàng (khoảng 10-15 giây)
sleep 10

# Chạy migrations
docker-compose -f docker-compose.prod.yml --env-file .env.production exec -T app npm run migration:run
```

### 4. Kiểm tra
```bash
# Xem trạng thái containers
docker-compose -f docker-compose.prod.yml --env-file .env.production ps

# Xem logs
docker-compose -f docker-compose.prod.yml --env-file .env.production logs -f

# Health check
curl http://localhost:3000/api/v1/health

# Xem resource usage
docker stats
```

### 5. Quản lý
```bash
# Xem logs
docker-compose -f docker-compose.prod.yml --env-file .env.production logs -f

# Dừng containers
docker-compose -f docker-compose.prod.yml --env-file .env.production stop

# Khởi động lại
docker-compose -f docker-compose.prod.yml --env-file .env.production restart

# Dừng và xóa containers
docker-compose -f docker-compose.prod.yml --env-file .env.production down

# Rebuild containers
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d --build
```

---

## 📊 So Sánh Lệnh Chạy

### Development
```bash
# Sử dụng docker-compose.yml và .env
docker-compose up -d --build
docker-compose exec app npm run migration:run
docker-compose logs -f
docker-compose stop
docker-compose down
```

### Production
```bash
# Sử dụng docker-compose.prod.yml và .env.production
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d --build
docker-compose -f docker-compose.prod.yml --env-file .env.production exec -T app npm run migration:run
docker-compose -f docker-compose.prod.yml --env-file .env.production logs -f
docker-compose -f docker-compose.prod.yml --env-file .env.production stop
docker-compose -f docker-compose.prod.yml --env-file .env.production down
```

**Lưu ý:** Tất cả lệnh production đều cần thêm:
- `-f docker-compose.prod.yml` (chỉ định file compose)
- `--env-file .env.production` (chỉ định file env)

---

## 🔧 Database Management

### Backup
```bash
# Development
docker-compose exec postgres pg_dump -U postgres wishzy_db > backup.sql

# Production
docker-compose -f docker-compose.prod.yml --env-file .env.production exec postgres pg_dump -U ${DB_USERNAME} ${DB_NAME} > backup.sql
```

### Restore
```bash
# Development
docker-compose exec -T postgres psql -U postgres wishzy_db < backup.sql

# Production
docker-compose -f docker-compose.prod.yml --env-file .env.production exec -T postgres psql -U ${DB_USERNAME} ${DB_NAME} < backup.sql
```

### Truy cập Database
```bash
# Development
docker-compose exec postgres psql -U postgres -d wishzy_db

# Production
docker-compose -f docker-compose.prod.yml --env-file .env.production exec postgres psql -U ${DB_USERNAME} -d ${DB_NAME}
```

---

## 🐛 Troubleshooting

### Container không khởi động
```bash
# Xem logs chi tiết
docker-compose logs app  # Dev
docker-compose -f docker-compose.prod.yml --env-file .env.production logs app  # Prod

# Kiểm tra port đã được sử dụng
netstat -tulpn | grep 3000  # Linux
netstat -ano | findstr :3000  # Windows
```

### Database connection failed
```bash
# Kiểm tra database đã sẵn sàng
docker-compose exec postgres pg_isready -U postgres  # Dev
docker-compose -f docker-compose.prod.yml --env-file .env.production exec postgres pg_isready -U ${DB_USERNAME}  # Prod
```

### Migration failed
```bash
# Chạy lại migration
docker-compose exec app npm run migration:run  # Dev
docker-compose -f docker-compose.prod.yml --env-file .env.production exec -T app npm run migration:run  # Prod
```

---

## 📝 Tóm Tắt

### Development
```bash
cp env.example .env
docker-compose up -d --build
sleep 10
docker-compose exec app npm run migration:run
```

### Production
```bash
cp env.example .env.production
nano .env.production  # Cấu hình các giá trị quan trọng
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d --build
sleep 10
docker-compose -f docker-compose.prod.yml --env-file .env.production exec -T app npm run migration:run
```

---

**Lưu ý:** File `.env` và `.env.production` không nên được commit lên Git (đã có trong `.gitignore`).
