# Quiz System - Security & Anti-Cheating

## 🔒 Bảo mật chống gian lận

### 1. Ẩn đáp án đúng khi làm bài

**Vấn đề:** Nếu API trả về `isCorrect: true/false` trong answer options, user có thể inspect network và thấy đáp án đúng.

**Giải pháp:**

#### API cho student làm bài (KHÔNG có đáp án):

```bash
GET /api/v1/quizzes/:id
GET /api/v1/quizzes/:id/preview
```

**Response (SAFE - không có isCorrect):**

```json
{
  "id": "quiz-uuid",
  "title": "JavaScript Quiz",
  "questions": [
    {
      "id": "question-uuid",
      "questionText": "What is closure?",
      "points": 1,
      "answerOptions": [
        {
          "id": "option-1",
          "optionText": "A function inside another function"
          // ❌ NO isCorrect field here!
        },
        {
          "id": "option-2",
          "optionText": "A loop structure"
        }
      ]
    }
  ]
}
```

#### API cho creator xem đáp án (CÓ đáp án):

```bash
GET /api/v1/quizzes/:id?includeAnswers=true
# Chỉ work nếu bạn là creator của quiz
```

**Response (có isCorrect):**

```json
{
  "questions": [
    {
      "answerOptions": [
        {
          "id": "option-1",
          "optionText": "A function inside another function",
          "isCorrect": true // ✅ Creator thấy được
        }
      ]
    }
  ]
}
```

### 2. Ẩn kết quả khi đang làm bài

**Vấn đề:** User có thể xem attempt details và thấy `isCorrect`, `pointsEarned` ngay khi submit answer.

**Giải pháp:**

#### Khi đang làm bài (status = in_progress):

```bash
GET /api/v1/quiz-attempts/:id
```

**Response (SAFE):**

```json
{
  "id": "attempt-uuid",
  "status": "in_progress",
  "userAnswers": [
    {
      "id": "answer-uuid",
      "questionId": "question-uuid",
      "selectedOptionId": "option-uuid",
      "answeredAt": "2025-11-18T10:00:00Z"
      // ❌ NO isCorrect, NO pointsEarned
    }
  ]
}
```

#### Sau khi hoàn thành (status = completed):

```bash
GET /api/v1/quiz-attempts/:id/results
```

**Response (có kết quả):**

```json
{
  "attempt": {
    "totalScore": 25,
    "maxScore": 30,
    "percentage": 83.33,
    "status": "completed"
  },
  "results": [
    {
      "question": "What is closure?",
      "userAnswer": "A function inside another function",
      "correctAnswer": "A function inside another function",
      "isCorrect": true, // ✅ Thấy được sau khi complete
      "pointsEarned": 1
    }
  ]
}
```

### 3. Validation server-side

**Tất cả logic validation ở server:**

- ✅ Check đáp án đúng/sai ở server
- ✅ Tính điểm ở server
- ✅ Client chỉ gửi `selectedOptionId`, không gửi `isCorrect`
- ✅ Server tự query database để check correct answer

```typescript
// Client gửi:
POST /api/v1/quiz-attempts/:id/answer
{
  "questionId": "question-uuid",
  "selectedOptionId": "option-uuid"
  // ❌ KHÔNG gửi isCorrect
}

// Server tự check:
const selectedOption = await answerOptionRepository.findOne({
  where: { id: selectedOptionId }
});
const isCorrect = selectedOption.isCorrect; // ✅ Server check
```

## 🎯 Flow bảo mật

### Student làm bài:

1. **Xem quiz:**

   ```
   GET /quizzes/:id
   → Không thấy isCorrect
   ```

2. **Bắt đầu làm:**

   ```
   POST /quiz-attempts/start/:quizId
   → Tạo attempt với status = in_progress
   ```

3. **Trả lời câu hỏi:**

   ```
   POST /quiz-attempts/:id/answer
   Body: { questionId, selectedOptionId }
   → Server check đúng/sai, lưu vào DB
   → Response KHÔNG trả về isCorrect
   ```

4. **Xem tiến độ:**

   ```
   GET /quiz-attempts/:id
   → Thấy đã trả lời câu nào
   → KHÔNG thấy đúng/sai
   ```

5. **Hoàn thành:**

   ```
   POST /quiz-attempts/:id/complete
   → Server tính tổng điểm
   → Update status = completed
   ```

6. **Xem kết quả:**
   ```
   GET /quiz-attempts/:id/results
   → Bây giờ mới thấy đúng/sai
   → Thấy điểm số chi tiết
   ```

### Creator xem quiz:

1. **Xem với đáp án:**

   ```
   GET /quizzes/:id?includeAnswers=true
   → Thấy isCorrect vì là creator
   ```

2. **Xem danh sách quiz của mình:**
   ```
   GET /quizzes/my-quizzes
   → Thấy tất cả quiz đã tạo
   ```

## 🛡️ Các lớp bảo vệ

### Layer 1: API Response Filtering

- `findOneForTaking()`: Remove `isCorrect` field
- `getAttemptDetails()`: Hide results if in_progress

### Layer 2: Authorization Check

- `checkOwnership()`: Verify creator
- Only creator sees `includeAnswers=true`

### Layer 3: Server-side Validation

- All answer checking on server
- All score calculation on server
- Client cannot manipulate results

### Layer 4: Database Constraints

- Foreign keys ensure data integrity
- Cascade deletes prevent orphaned data
- Indexes for performance

## ⚠️ Lưu ý quan trọng

### ❌ KHÔNG BAO GIỜ:

- Trả về `isCorrect` khi user đang làm bài
- Tin tưởng client gửi `isCorrect` hoặc `pointsEarned`
- Cho phép user xem results trước khi complete
- Expose correct answers trong API response

### ✅ LUÔN LUÔN:

- Filter sensitive data trước khi response
- Validate ownership trước khi show answers
- Check attempt status trước khi show results
- Calculate scores server-side

## 🧪 Testing Security

### Test 1: Student không thấy đáp án

```bash
# Login as student
curl -H "Authorization: Bearer $STUDENT_TOKEN" \
  http://localhost:3000/api/v1/quizzes/:id

# Verify: Response KHÔNG có isCorrect field
```

### Test 2: Creator thấy đáp án

```bash
# Login as creator
curl -H "Authorization: Bearer $CREATOR_TOKEN" \
  http://localhost:3000/api/v1/quizzes/:id?includeAnswers=true

# Verify: Response CÓ isCorrect field
```

### Test 3: In-progress không thấy kết quả

```bash
# Start attempt
curl -X POST -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/v1/quiz-attempts/start/:quizId

# Get attempt details
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/v1/quiz-attempts/:attemptId

# Verify: userAnswers KHÔNG có isCorrect, pointsEarned
```

### Test 4: Completed thấy kết quả

```bash
# Complete attempt
curl -X POST -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/v1/quiz-attempts/:attemptId/complete

# Get results
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/v1/quiz-attempts/:attemptId/results

# Verify: results CÓ isCorrect, pointsEarned, correctAnswer
```

## 📊 Summary

| Endpoint                                     | isCorrect shown? | Condition                     |
| -------------------------------------------- | ---------------- | ----------------------------- |
| `GET /quizzes/:id`                           | ❌ No            | Always hidden for taking quiz |
| `GET /quizzes/:id?includeAnswers=true`       | ✅ Yes           | Only if you're the creator    |
| `GET /quiz-attempts/:id` (in_progress)       | ❌ No            | Hidden during quiz            |
| `GET /quiz-attempts/:id/results` (completed) | ✅ Yes           | Shown after completion        |
| `POST /quiz-attempts/:id/answer`             | ❌ No            | Server checks, doesn't return |

**Kết luận:** Hệ thống đã được thiết kế để ngăn chặn gian lận ở mọi cấp độ, từ API response filtering đến server-side validation.
