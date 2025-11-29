import { DataSource } from 'typeorm';
import { Comment } from '../../app/entities/comment.entity';

export async function seedComments(dataSource: DataSource) {
  const commentRepository = dataSource.getRepository(Comment);

  // Check if comments already exist
  const existingCount = await commentRepository.count();
  if (existingCount > 0) {
    console.log('⏭️  Seed comments already exist, skipping...');
    return;
  }

  // Get users and courses
  const users = await dataSource.query("SELECT id FROM users WHERE role = 'user' LIMIT 20");
  const courses = await dataSource.query('SELECT id FROM courses LIMIT 30');

  if (users.length === 0 || courses.length === 0) {
    console.log('⚠️  Users or courses not found. Please seed them first.');
    return;
  }

  // Sample review contents in Vietnamese
  const positiveComments = [
    'Khóa học rất hay và chi tiết. Giảng viên giải thích dễ hiểu, phù hợp cho người mới bắt đầu. Rất đáng tiền!',
    'Nội dung chất lượng, cập nhật theo xu hướng mới nhất. Các dự án thực hành rất bổ ích. Highly recommended!',
    'Mình đã học được rất nhiều từ khóa này. Giảng viên nhiệt tình, trả lời câu hỏi nhanh chóng. 5 sao không có gì phải bàn!',
    'Best course ever! Sau khóa học này mình đã apply được vào công ty mơ ước. Cảm ơn giảng viên nhiều!',
    'Khóa học đầy đủ, chi tiết từ A-Z. Video quality tốt, âm thanh rõ ràng. Rất hài lòng với khóa học này.',
    'Giảng viên giải thích rất dễ hiểu, có nhiều ví dụ thực tế. Sau mỗi section đều có quiz để ôn tập. Tuyệt vời!',
    'Nội dung cập nhật, theo kịp công nghệ mới. Các bài tập thực hành rất hay. Đã giới thiệu cho bạn bè rồi!',
    'Perfect course for beginners! Mình không có background gì nhưng vẫn học được. Giảng viên rất tận tâm.',
    'Khóa học này vượt quá mong đợi của mình. Từ lý thuyết đến thực hành đều rất bài bản. Worth every penny!',
    'Community support tốt, giảng viên và học viên đều nhiệt tình giúp đỡ. Học xong cảm thấy tự tin hơn nhiều!',
  ];

  const neutralComments = [
    'Khóa học ổn, nội dung khá đầy đủ. Tuy nhiên một số phần hơi dài dòng, có thể rút gọn được.',
    'Nội dung tốt nhưng pace hơi nhanh với người mới. Nên có thêm bài tập ở mỗi section.',
    'Overall khá tốt, nhưng mình mong có thêm project thực tế phức tạp hơn để practice.',
    'Khóa học đáng giá nhưng cần update thêm về những tính năng mới nhất của framework.',
    'Good content but could be better organized. Một số video hơi dài, nên chia nhỏ ra.',
  ];

  const criticalComments = [
    'Nội dung cơ bản, không có gì mới. Với người đã biết thì hơi redundant.',
    'Video quality không ổn lắm, âm thanh đôi lúc bị nhỏ. Hi vọng team sẽ cải thiện.',
    'Khóa học không như mô tả, thiếu nhiều phần quan trọng. Hơi thất vọng...',
  ];

  const comments: any[] = [];

  // Generate 80-120 comments
  const numberOfComments = 100;

  for (let i = 0; i < numberOfComments; i++) {
    const user = users[Math.floor(Math.random() * users.length)];
    const course = courses[Math.floor(Math.random() * courses.length)];
    
    // Determine rating and corresponding comment
    const random = Math.random();
    let rating: number;
    let content: string;
    
    if (random < 0.7) { // 70% positive (4-5 stars)
      rating = Math.random() < 0.6 ? 5.0 : 4.0;
      content = positiveComments[Math.floor(Math.random() * positiveComments.length)];
    } else if (random < 0.9) { // 20% neutral (3 stars)
      rating = 3.0;
      content = neutralComments[Math.floor(Math.random() * neutralComments.length)];
    } else { // 10% critical (1-2 stars)
      rating = Math.random() < 0.5 ? 2.0 : 1.0;
      content = criticalComments[Math.floor(Math.random() * criticalComments.length)];
    }

    // Random likes and dislikes based on rating
    const baseLikes = rating >= 4 ? Math.floor(Math.random() * 50) + 10 : Math.floor(Math.random() * 10);
    const baseDislikes = rating <= 2 ? Math.floor(Math.random() * 30) + 5 : Math.floor(Math.random() * 5);

    comments.push({
      content,
      rating,
      like: baseLikes,
      dislike: baseDislikes,
      userId: user.id,
      courseId: course.id,
      createdAt: new Date(Date.now() - Math.floor(Math.random() * 90 * 24 * 60 * 60 * 1000)), // Random date within last 90 days
    });
  }

  await commentRepository.save(comments);
  console.log(`✅ Successfully seeded ${comments.length} comments!`);
}
