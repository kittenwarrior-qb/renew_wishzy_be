import { DataSource } from 'typeorm';
import { Feedback } from '../../app/entities/feedback.entity';

export async function seedFeedbacks(dataSource: DataSource) {
  const feedbackRepository = dataSource.getRepository(Feedback);

  // Check if feedbacks already exist
  const existingFeedbacks = await feedbackRepository.count();
  if (existingFeedbacks > 0) {
    console.log('⏭️  Seed feedbacks already exist, skipping...');
    return;
  }

  // Get users and courses
  const users = await dataSource.query("SELECT id FROM users WHERE role = 'user' LIMIT 15");
  const courses = await dataSource.query('SELECT id FROM courses LIMIT 20');

  if (users.length === 0 || courses.length === 0) {
    console.log('⚠️  Users or courses not found. Please seed them first.');
    return;
  }

  // Vietnamese feedback content
  const feedbackContents = [
    {
      rating: 5,
      content: 'Khóa học rất hay và bổ ích! Giảng viên giải thích rất rõ ràng và dễ hiểu. Tôi đã học được rất nhiều kiến thức mới.',
    },
    {
      rating: 5,
      content: 'Nội dung khóa học được cập nhật và thực tế. Các ví dụ minh họa rất sinh động. Rất đáng đầu tư!',
    },
    {
      rating: 4,
      content: 'Khóa học tốt, nội dung phong phú. Tuy nhiên có một số phần hơi khó hiểu, mong giảng viên có thể giải thích thêm.',
    },
    {
      rating: 5,
      content: 'Tuyệt vời! Đây là khóa học hay nhất tôi từng tham gia. Giảng viên rất nhiệt tình và chuyên nghiệp.',
    },
    {
      rating: 4,
      content: 'Nội dung khóa học chất lượng cao. Video rõ nét, âm thanh tốt. Chỉ có điều thời lượng hơi dài.',
    },
    {
      rating: 5,
      content: 'Khóa học giúp tôi nâng cao kỹ năng rất nhiều. Cảm ơn giảng viên đã chia sẻ những kiến thức quý báu.',
    },
    {
      rating: 3,
      content: 'Khóa học ổn, có những phần hay nhưng cũng có phần chưa thực sự thuyết phục. Cần cải thiện thêm.',
    },
    {
      rating: 5,
      content: 'Rất hài lòng với khóa học này. Nội dung từ cơ bản đến nâng cao, phù hợp cho người mới bắt đầu.',
    },
    {
      rating: 4,
      content: 'Giảng viên giảng dạy rất tâm huyết. Tài liệu phong phú và được cập nhật thường xuyên.',
    },
    {
      rating: 5,
      content: 'Khóa học vượt ngoài mong đợi của tôi. Đã áp dụng được ngay vào công việc thực tế.',
    },
    {
      rating: 4,
      content: 'Nội dung hay, cách trình bày hấp dẫn. Chỉ mong có thêm nhiều bài tập thực hành hơn.',
    },
    {
      rating: 5,
      content: 'Khóa học chất lượng cao với giá cả hợp lý. Tôi sẽ giới thiệu cho bạn bè và đồng nghiệp.',
    },
    {
      rating: 3,
      content: 'Khóa học có nội dung tốt nhưng cách trình bày hơi nhàm chán. Cần thêm tương tác.',
    },
    {
      rating: 5,
      content: 'Tôi rất ấn tượng với khóa học này. Giảng viên có kinh nghiệm thực tế phong phú.',
    },
    {
      rating: 4,
      content: 'Khóa học bổ ích, giúp tôi hiểu rõ hơn về lĩnh vực này. Cảm ơn giảng viên!',
    },
    {
      rating: 5,
      content: 'Đây là khoản đầu tư tốt nhất cho sự nghiệp của tôi. Khóa học rất thực tế và hữu ích.',
    },
    {
      rating: 2,
      content: 'Khóa học có vẻ hơi cũ, một số công nghệ đã lỗi thời. Cần cập nhật nội dung.',
    },
    {
      rating: 4,
      content: 'Nội dung khóa học tốt, giảng viên nhiệt tình. Tuy nhiên âm thanh có lúc không rõ.',
    },
    {
      rating: 5,
      content: 'Khóa học xuất sắc! Từ lý thuyết đến thực hành đều rất chi tiết và dễ hiểu.',
    },
    {
      rating: 4,
      content: 'Tôi học được rất nhiều từ khóa học này. Mong có thêm khóa học nâng cao.',
    },
  ];

  // Create 50-80 feedbacks
  const numberOfFeedbacks = 60;
  const feedbacks = [];

  for (let i = 0; i < numberOfFeedbacks; i++) {
    const user = users[Math.floor(Math.random() * users.length)];
    const course = courses[Math.floor(Math.random() * courses.length)];
    const feedbackTemplate = feedbackContents[Math.floor(Math.random() * feedbackContents.length)];
    
    // Random date in the past 60 days
    const createdAt = new Date(Date.now() - Math.floor(Math.random() * 60 * 24 * 60 * 60 * 1000));

    const feedback = {
      userId: user.id,
      courseId: course.id,
      rating: feedbackTemplate.rating,
      content: feedbackTemplate.content,
      like: Math.floor(Math.random() * 20), // 0-19 likes
      dislike: Math.floor(Math.random() * 5), // 0-4 dislikes
      createdAt,
      updatedAt: createdAt,
    };

    feedbacks.push(feedback);
  }

  // Save all feedbacks
  await feedbackRepository.save(feedbacks);

  console.log(`✅ Successfully seeded ${numberOfFeedbacks} feedbacks!`);
}