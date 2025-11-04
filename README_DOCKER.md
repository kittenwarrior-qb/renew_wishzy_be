# 🐳 Hướng Dẫn Deploy với Docker Compose

## 📁 Cấu Trúc Files

```
be/
├── Dockerfile                    # Docker image configuration
├── docker-compose.yml           # Development environment
├── docker-compose.prod.yml      # Production environment
├── .env                         # Development environment variables
├── .env.production              # Production environment variables
└── env.example                  # Template cho env files
```

---

## 🚀 Development (Local)

### Bước 1: Tạo file .env

```bash
# Copy từ template
cp env.example .env

# Hoặc chỉnh sửa file .env có sẵn
```

### Bước 2: Khởi động services

```bash
# Build và start containers
docker-compose up -d --build

# Chờ database sẵn sàng (khoảng 10 giây)
sleep 10

# Chạy migrations
docker-compose exec app npm run migration:run
```

### Bước 3: Truy cập

- **API**: http://localhost:3000/api/v1
- **Swagger**: http://localhost:3000/api/docs
- **Health**: http://localhost:3000/api/v1/health

### Các lệnh thường dùng

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

# Dừng và xóa containers (giữ data)
docker-compose down

# Dừng và xóa tất cả (bao gồm volumes - MẤT DATA)
docker-compose down -v

# Rebuild containers
docker-compose up -d --build

# Xem trạng thái
docker-compose ps

# Chạy migrations
docker-compose exec app npm run migration:run

# Revert migrations
docker-compose exec app npm run migration:revert
```

---

## 🏭 Production (VPS)

### Bước 1: Cấu hình file .env.production

```bash
# Chỉnh sửa file .env.production
nano .env.production
```

**Quan trọng - Cần thay đổi:**
- `JWT_SECRET` - Chuỗi ngẫu nhiên mạnh (tối thiểu 32 ký tự)
- `JWT_REFRESH_SECRET` - Chuỗi ngẫu nhiên mạnh (tối thiểu 32 ký tự)
- `DB_PASSWORD` - Mật khẩu database mạnh
- `SWAGGER_ENABLED=false` - Tắt Swagger trong production
- `ALLOWED_ORIGINS` - URL frontend của bạn
- `FRONTEND_URL` - URL frontend của bạn

**Tạo JWT secret mạnh:**
```bash
# Linux/Mac
openssl rand -base64 32

# Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

### Bước 2: Khởi động services

```bash
# Build và start containers
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d --build

# Chờ database sẵn sàng
sleep 10

# Chạy migrations
docker-compose -f docker-compose.prod.yml --env-file .env.production exec -T app npm run migration:run
```

### Bước 3: Kiểm tra

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

### Các lệnh thường dùng

```bash
# Xem logs
docker-compose -f docker-compose.prod.yml --env-file .env.production logs -f

# Xem logs của app
docker-compose -f docker-compose.prod.yml --env-file .env.production logs -f app

# Dừng containers
docker-compose -f docker-compose.prod.yml --env-file .env.production stop

# Khởi động lại
docker-compose -f docker-compose.prod.yml --env-file .env.production restart

# Dừng và xóa containers
docker-compose -f docker-compose.prod.yml --env-file .env.production down

# Rebuild containers
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d --build

# Chạy migrations
docker-compose -f docker-compose.prod.yml --env-file .env.production exec -T app npm run migration:run
```

---

## 🔧 Quản Lý Database

### Backup database

```bash
# Development
docker-compose exec postgres pg_dump -U postgres wishzy_db > backup.sql

# Production
docker-compose -f docker-compose.prod.yml --env-file .env.production exec postgres pg_dump -U ${DB_USERNAME} ${DB_NAME} > backup.sql
```

### Restore database

```bash
# Development
docker-compose exec -T postgres psql -U postgres wishzy_db < backup.sql

# Production
docker-compose -f docker-compose.prod.yml --env-file .env.production exec -T postgres psql -U ${DB_USERNAME} ${DB_NAME} < backup.sql
```

### Truy cập database

```bash
# Development
docker-compose exec postgres psql -U postgres -d wishzy_db

# Production
docker-compose -f docker-compose.prod.yml --env-file .env.production exec postgres psql -U ${DB_USERNAME} -d ${DB_NAME}
```

---

## 🔍 Troubleshooting

### Container không khởi động

```bash
# Xem logs chi tiết
docker-compose logs app

# Kiểm tra port đã được sử dụng
netstat -tulpn | grep 3000  # Linux
netstat -ano | findstr :3000  # Windows
```

### Database connection failed

```bash
# Kiểm tra database đã sẵn sàng
docker-compose exec postgres pg_isready -U postgres

# Xem logs database
docker-compose logs postgres
```

### Migration failed

```bash
# Chạy lại migration
docker-compose exec app npm run migration:run

# Xem logs chi tiết
docker-compose logs app
```

---

## 📊 Monitoring

```bash
# Xem resource usage real-time
docker stats

# Xem disk usage
docker system df

# Xem logs với giới hạn dòng
docker-compose logs --tail=100 -f app
```

---

## 🔒 Bảo Mật Production

- ✅ Đã thay đổi tất cả mật khẩu mặc định
- ✅ JWT_SECRET và JWT_REFRESH_SECRET là chuỗi ngẫu nhiên mạnh
- ✅ SWAGGER_ENABLED=false
- ✅ Database port không expose ra ngoài
- ✅ File .env.production không được commit lên Git
- ✅ Sử dụng HTTPS (qua Nginx reverse proxy)
- ✅ Resource limits đã được thiết lập

---

## 📝 Tóm Tắt

### Development
```bash
docker-compose up -d --build
sleep 10
docker-compose exec app npm run migration:run
```

### Production
```bash
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d --build
sleep 10
docker-compose -f docker-compose.prod.yml --env-file .env.production exec -T app npm run migration:run
```

---

**Lưu ý:** File `.env` và `.env.production` không nên được commit lên Git. Đảm bảo chúng đã có trong `.gitignore`.

