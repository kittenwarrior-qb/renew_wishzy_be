# 🎓 Instructor Data Seeder

## Mục đích
File seed này tạo dữ liệu mẫu cho **instructor1** (Lê Hoàng Nam) để test các chức năng instructor.

## Nội dung seed
- ✅ 1 khóa học React Native (40 giờ, intermediate level)
- ✅ 3 chapters (Giới thiệu, Components, State Management)
- ✅ 5 lectures với duration cụ thể
- ✅ 15-25 comments từ students
- ✅ 8 replies từ instructor
- ✅ 15 feedbacks với rating 4-5 sao

## Cách sử dụng

### 1. Chạy seed chính TRƯỚC (bắt buộc)
```bash
npm run seed
```
**Lưu ý:** Phải chạy seed chính trước vì cần có:
- Users (instructor1, students)
- Categories (category với id = '1')

### 2. Chạy instructor seed (tùy chọn)
```bash
npm run seed:instructor
```

## Điều kiện
- ✅ User `instructor1@wishzy.com` phải tồn tại
- ✅ Category với id = '1' phải tồn tại
- ✅ Skip nếu instructor đã có course (idempotent)

## Không ảnh hưởng gì đến:
- ❌ Seed data chính của dự án
- ❌ Các instructors khác
- ❌ Data của teammates

## File liên quan
- **Seeder:** `src/database/seeds/instructor-data.seeder.ts`
- **Script:** `src/scripts/run-instructor-seeds.ts`
- **NPM command:** `npm run seed:instructor`

## Xóa data nếu muốn reset
```sql
DELETE FROM feedbacks WHERE course_id IN (SELECT id FROM courses WHERE created_by = (SELECT id FROM users WHERE email = 'instructor1@wishzy.com'));
DELETE FROM comments WHERE lecture_id IN (SELECT id FROM lectures WHERE chapter_id IN (SELECT id FROM chapters WHERE course_id IN (SELECT id FROM courses WHERE created_by = (SELECT id FROM users WHERE email = 'instructor1@wishzy.com'))));
DELETE FROM lectures WHERE chapter_id IN (SELECT id FROM chapters WHERE course_id IN (SELECT id FROM courses WHERE created_by = (SELECT id FROM users WHERE email = 'instructor1@wishzy.com')));
DELETE FROM chapters WHERE course_id IN (SELECT id FROM courses WHERE created_by = (SELECT id FROM users WHERE email = 'instructor1@wishzy.com'));
DELETE FROM courses WHERE created_by = (SELECT id FROM users WHERE email = 'instructor1@wishzy.com');
```

Hoặc đơn giản hơn: Xóa và chạy lại seed chính, sau đó chạy instructor seed.
