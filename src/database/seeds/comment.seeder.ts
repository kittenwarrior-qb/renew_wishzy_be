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

  // Get users and lectures
  const users = await dataSource.query("SELECT id FROM users WHERE role = 'user' LIMIT 20");
  const lectures = await dataSource.query('SELECT id FROM lectures LIMIT 100');

  if (users.length === 0 || lectures.length === 0) {
    console.log('⚠️  Users or lectures not found. Please seed them first.');
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

  // Generate 80-120 comments (80 parent comments, 20 replies)
  const numberOfParentComments = 80;
  const numberOfReplies = 20;

  // Create parent comments first
  for (let i = 0; i < numberOfParentComments; i++) {
    const user = users[Math.floor(Math.random() * users.length)];
    const lecture = lectures[Math.floor(Math.random() * lectures.length)];

    // Determine comment type
    const random = Math.random();
    let content: string;
    let baseLikes: number;
    let baseDislikes: number;

    if (random < 0.7) { // 70% positive
      content = positiveComments[Math.floor(Math.random() * positiveComments.length)];
      baseLikes = Math.floor(Math.random() * 50) + 10;
      baseDislikes = Math.floor(Math.random() * 5);
    } else if (random < 0.9) { // 20% neutral
      content = neutralComments[Math.floor(Math.random() * neutralComments.length)];
      baseLikes = Math.floor(Math.random() * 20) + 5;
      baseDislikes = Math.floor(Math.random() * 10);
    } else { // 10% critical
      content = criticalComments[Math.floor(Math.random() * criticalComments.length)];
      baseLikes = Math.floor(Math.random() * 10);
      baseDislikes = Math.floor(Math.random() * 30) + 5;
    }

    comments.push({
      content,
      like: baseLikes,
      dislike: baseDislikes,
      userId: user.id,
      lectureId: lecture.id,
      createdAt: new Date(Date.now() - Math.floor(Math.random() * 90 * 24 * 60 * 60 * 1000)), // Random date within last 90 days
    });
  }

  // Save parent comments first to get their IDs
  const savedParentComments = await commentRepository.save(comments);
  console.log(`✅ Successfully seeded ${savedParentComments.length} parent comments!`);

  // Now create reply comments
  const replies: any[] = [];
  for (let i = 0; i < numberOfReplies; i++) {
    const user = users[Math.floor(Math.random() * users.length)];
    const parentComment = savedParentComments[Math.floor(Math.random() * savedParentComments.length)];
    
    // Replies are usually shorter
    const replyContents = [
      'Đồng ý với bạn!',
      'Cảm ơn bạn đã chia sẻ!',
      'Mình cũng nghĩ vậy.',
      'Rất hữu ích, cảm ơn!',
      'Bạn có thể giải thích thêm được không?',
      'Mình có câu hỏi tương tự.',
      'Chính xác!',
    ];
    
    const content = replyContents[Math.floor(Math.random() * replyContents.length)];
    const baseLikes = Math.floor(Math.random() * 10);
    const baseDislikes = Math.floor(Math.random() * 3);

    replies.push({
      content,
      like: baseLikes,
      dislike: baseDislikes,
      userId: user.id,
      lectureId: parentComment.lectureId || parentComment.lecture_id, // Reply on same lecture
      parentId: parentComment.id,
      createdAt: new Date((parentComment.createdAt || parentComment.created_at).getTime() + Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)), // Within 7 days of parent
    });
  }

  await commentRepository.save(replies);
  console.log(`✅ Successfully seeded ${replies.length} reply comments!`);
}
