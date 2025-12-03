# Docker Setup Guide

## Tự động chạy migrations khi start container

Container sẽ tự động:
1. Đợi PostgreSQL sẵn sàng
2. Sync các migrations đã có vào database
3. Chạy các migrations mới (nếu có)
4. Start ứng dụng

## Cách sử dụng

### Start containers
```bash
docker-compose up -d
```

### Xem logs
```bash
docker-compose logs -f app
```

### Chạy migrations thủ công
```bash
# Vào container
docker-compose exec app sh

# Chạy migrations
npm run migration:run

# Revert migration
npm run migration:revert

# Sync migrations (đánh dấu migrations đã chạy)
npm run sync:migrations
```

### Tạo migration mới
```bash
# Trên local (không trong container)
npm run migration:generate -- src/database/migrations/MigrationName
```

### Reset database
```bash
# Xóa volume và tạo lại
docker-compose down -v
docker-compose up -d
```

## Cấu trúc

- `docker/postgres/init.sql` - Script khởi tạo database (tạo table migrations)
- `docker-entrypoint.sh` - Script chạy khi container start
- `src/database/migrations/` - Thư mục chứa migration files
- `src/scripts/sync-migrations.ts` - Script sync migrations vào database
