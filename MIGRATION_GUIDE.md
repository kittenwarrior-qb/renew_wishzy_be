# Migration Guide

## Tổng quan

Docker Compose đã được cấu hình để tự động:
1. Tạo table `migrations` khi khởi tạo PostgreSQL
2. Sync các migrations đã có vào database
3. Chạy các migrations mới khi container start

## Cách sử dụng

### 1. Start containers lần đầu
```bash
cd be
docker-compose up -d
```

Container sẽ tự động:
- Tạo database và table migrations
- Đánh dấu tất cả migrations hiện có là đã chạy
- Start ứng dụng

### 2. Thêm migration mới

**Tạo migration:**
```bash
npm run migration:generate -- src/database/migrations/AddNewColumn
```

**Rebuild và restart container:**
```bash
docker-compose up -d --build
```

Migration mới sẽ tự động chạy khi container start.

### 3. Quản lý migrations

**Xem logs:**
```bash
docker-compose logs -f app
```

**Chạy migrations thủ công:**
```bash
docker-compose exec app npm run migration:run
```

**Revert migration:**
```bash
docker-compose exec app npm run migration:revert
```

**Sync migrations (đánh dấu đã chạy):**
```bash
docker-compose exec app npm run sync:migrations
```

### 4. Reset database hoàn toàn

```bash
# Xóa containers và volumes
docker-compose down -v

# Start lại
docker-compose up -d
```

## Cấu trúc files

```
be/
├── docker/
│   ├── postgres/
│   │   └── init.sql              # Tạo table migrations
│   └── README.md                 # Hướng dẫn chi tiết
├── docker-entrypoint.sh          # Script chạy khi container start
├── src/
│   ├── database/
│   │   ├── migrations/           # Thư mục chứa migrations
│   │   └── data-source.ts        # TypeORM config
│   └── scripts/
│       └── sync-migrations.ts    # Script sync migrations
└── docker-compose.yml
```

## Lưu ý

- Table `migrations` được tạo tự động bởi `init.sql`
- Script `sync-migrations.ts` đánh dấu các migrations đã có là đã chạy
- Chỉ các migrations mới sẽ được execute
- Trong development, có thể bật `synchronize: true` trong TypeORM config
