import { DataSource } from 'typeorm';
import { Course } from '../../app/entities/course.entity';
import { Chapter } from '../../app/entities/chapter.entity';
import { Lecture } from '../../app/entities/lecture.entity';
import { Comment, CommentStatus } from '../../app/entities/comment.entity';
import { Feedback } from '../../app/entities/feedback.entity';
import { User, UserRole } from '../../app/entities/user.entity';
import { CourseLevel } from '../../app/entities/enums/course.enum';

/**
 * OPTIONAL SEEDER - Tạo dữ liệu mẫu cho instructor1
 *
 * ⚠️ KHÔNG tự động chạy với seed chính (npm run seed)
 * ✅ Chạy riêng với: npm run seed:instructor
 *
 * Mục đích: Tạo 1 khóa học React Native đầy đủ cho instructor1 để test chức năng instructor
 *
 * Prerequisites:
 * - User instructor1@wishzy.com phải tồn tại (từ user.seeder.ts)
 * - Category với id = '1' phải tồn tại
 *
 * Tạo:
 * - 1 course: React Native từ A-Z
 * - 3 chapters
 * - 5 lectures
 * - 15-25 comments + 8 replies
 * - 15 feedbacks
 *
 * @see INSTRUCTOR_SEED_README.md để biết thêm chi tiết
 */
export async function seedInstructorData(dataSource: DataSource) {
  const courseRepository = dataSource.getRepository(Course);
  const chapterRepository = dataSource.getRepository(Chapter);
  const lectureRepository = dataSource.getRepository(Lecture);
  const commentRepository = dataSource.getRepository(Comment);
  const feedbackRepository = dataSource.getRepository(Feedback);
  const userRepository = dataSource.getRepository(User);

  // Get instructor1 (Lê Hoàng Nam)
  const instructor1 = await userRepository.findOne({
    where: { email: 'instructor1@wishzy.com' }
  });

  if (!instructor1) {
    console.log('❌ Instructor1 not found, skipping instructor data seeding');
    return;
  }

  console.log('👨‍🏫 Seeding data for instructor1:', instructor1.fullName);

  // Check if instructor already has courses
  const existingCourse = await courseRepository.findOne({
    where: { createdBy: instructor1.id }
  });

  if (existingCourse) {
    console.log('⏭️  Instructor1 already has courses, skipping...');
    return;
  }

  // Create a course for instructor1
  const courseData = {
    name: 'React Native từ A-Z - Khóa học thực hành',
    description: 'Khóa học React Native toàn diện từ cơ bản đến nâng cao, bao gồm các dự án thực tế và deployment.',
    notes: 'Khóa học này sẽ giúp bạn thành thạo React Native trong 3 tháng',
    thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800',
    price: 1500000,
    saleInfo: {
      saleType: 'percent' as any,
      value: 20,
      saleEndDate: new Date('2025-01-31')
    },
    rating: 0,
    status: true,
    averageRating: 4.8,
    numberOfStudents: 156,
    level: CourseLevel.INTERMEDIATE,
    totalDuration: 2400, // 40 hours
    categoryId: '1', // Assuming category exists
    createdBy: instructor1.id,
  };

  const savedCourse = await courseRepository.save(courseData);
  console.log('📚 Created course:', savedCourse.name);

  // Create chapters
  const chapters = [
    {
      name: 'Giới thiệu và Setup',
      description: 'Cài đặt môi trường và làm quen với React Native',
      order: 1,
      courseId: savedCourse.id,
    },
    {
      name: 'Components và Navigation',
      description: 'Học về các components cơ bản và navigation',
      order: 2,
      courseId: savedCourse.id,
    },
    {
      name: 'State Management và API',
      description: 'Quản lý state và tích hợp API',
      order: 3,
      courseId: savedCourse.id,
    }
  ];

  const savedChapters = [];
  for (const chapterData of chapters) {
    const chapter = chapterRepository.create(chapterData);
    const savedChapter = await chapterRepository.save(chapter);
    savedChapters.push(savedChapter);
    console.log('📖 Created chapter:', savedChapter.name);
  }

  // Create lectures
  const lectures = [
    // Chapter 1 lectures
    {
      name: 'Cài đặt React Native CLI',
      description: 'Hướng dẫn cài đặt môi trường development',
      order: 1,
      duration: 900, // 15 minutes
      chapterId: savedChapters[0].id,
    },
    {
      name: 'Tạo project đầu tiên',
      description: 'Khởi tạo và chạy ứng dụng React Native đầu tiên',
      order: 2,
      duration: 1200, // 20 minutes
      chapterId: savedChapters[0].id,
    },
    // Chapter 2 lectures
    {
      name: 'View, Text và StyleSheet',
      description: 'Học về các components cơ bản nhất',
      order: 1,
      duration: 1800, // 30 minutes
      chapterId: savedChapters[1].id,
    },
    {
      name: 'React Navigation Setup',
      description: 'Cài đặt và sử dụng React Navigation',
      order: 2,
      duration: 2100, // 35 minutes
      chapterId: savedChapters[1].id,
    },
    // Chapter 3 lectures
    {
      name: 'useState và useEffect',
      description: 'Quản lý state với React Hooks',
      order: 1,
      duration: 1500, // 25 minutes
      chapterId: savedChapters[2].id,
    }
  ];

  const savedLectures = [];
  for (const lectureData of lectures) {
    const lecture = lectureRepository.create(lectureData);
    const savedLecture = await lectureRepository.save(lecture);
    savedLectures.push(savedLecture);
    console.log('🎥 Created lecture:', savedLecture.name);
  }

  // Get some students for comments and feedbacks
  const students = await userRepository.find({
    where: { role: UserRole.USER },
    take: 10
  });

  // Create comments for lectures
  const commentContents = [
    'Bài giảng rất hay và dễ hiểu! Cảm ơn thầy đã giải thích chi tiết.',
    'Mình có một câu hỏi về phần cài đặt, có thể hướng dẫn thêm không ạ?',
    'Video chất lượng tốt, âm thanh rõ ràng. Rất hài lòng với khóa học này.',
    'Phần này hơi khó hiểu, mong thầy có thể làm thêm ví dụ.',
    'Tuyệt vời! Sau bài này mình đã hiểu rõ về React Navigation rồi.',
    'Code demo rất thực tế, giúp mình áp dụng vào dự án thật.',
    'Có thể share source code của bài này không thầy?',
    'Bài giảng hay nhưng hơi nhanh, mình phải xem lại vài lần.',
    'Cảm ơn thầy! Khóa học này đáng tiền lắm.',
    'Mình đã follow được hết các bước, rất chi tiết và dễ hiểu.'
  ];

  const comments = [];
  for (let i = 0; i < savedLectures.length; i++) {
    const lecture = savedLectures[i];
    
    // Create 3-5 comments per lecture
    const numComments = Math.floor(Math.random() * 3) + 3;
    
    for (let j = 0; j < numComments; j++) {
      const randomStudent = students[Math.floor(Math.random() * students.length)];
      const randomContent = commentContents[Math.floor(Math.random() * commentContents.length)];
      
      const comment = commentRepository.create({
        content: randomContent,
        like: Math.floor(Math.random() * 20),
        dislike: Math.floor(Math.random() * 5),
        status: [CommentStatus.PENDING, CommentStatus.PENDING, CommentStatus.REPLIED][Math.floor(Math.random() * 3)] as CommentStatus, // More pending
        userId: randomStudent.id,
        lectureId: lecture.id,
        parentId: null,
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Last 30 days
      });
      
      comments.push(comment);
    }
  }

  const savedComments = await commentRepository.save(comments);
  console.log(`💬 Created ${savedComments.length} comments`);

  // Create some replies from instructor
  const replyContents = [
    'Cảm ơn bạn đã đánh giá tích cực! Chúc bạn học tập hiệu quả.',
    'Mình sẽ làm thêm video hướng dẫn chi tiết về phần này nhé.',
    'Bạn có thể tham khảo tài liệu bổ sung trong phần mô tả bài học.',
    'Source code đã được cập nhật trong phần resources của bài học.',
    'Nếu có thắc mắc gì thêm, bạn cứ comment tiếp nhé!',
    'Cảm ơn feedback của bạn, mình sẽ cải thiện tốc độ giảng bài.'
  ];

  const replies = [];
  const pendingComments = savedComments.filter(c => c.status === CommentStatus.PENDING).slice(0, 8);
  
  for (const comment of pendingComments) {
    const randomReply = replyContents[Math.floor(Math.random() * replyContents.length)];
    
    const reply = commentRepository.create({
      content: randomReply,
      like: Math.floor(Math.random() * 10),
      dislike: 0,
      status: CommentStatus.PENDING,
      userId: instructor1.id,
      lectureId: comment.lectureId,
      parentId: comment.id,
      createdAt: new Date(comment.createdAt.getTime() + Math.random() * 24 * 60 * 60 * 1000),
    });
    
    replies.push(reply);
    
    // Update parent comment status to replied
    comment.status = CommentStatus.REPLIED;
  }

  await commentRepository.save(replies);
  await commentRepository.save(pendingComments);
  console.log(`↩️  Created ${replies.length} replies`);

  // Create feedbacks for the course
  const feedbackContents = [
    'Khóa học rất chất lượng, giảng viên nhiệt tình và kiến thức cập nhật.',
    'Nội dung phong phú, từ cơ bản đến nâng cao. Rất đáng tiền!',
    'Video HD, âm thanh rõ ràng. Support tốt khi có thắc mắc.',
    'Sau khóa học này mình đã tự tin làm app React Native rồi.',
    'Giảng viên giải thích dễ hiểu, ví dụ thực tế. Recommend!',
    'Khóa học hay nhưng hơi dài, mong có thêm bài tập thực hành.',
    'Chất lượng tốt, giá cả hợp lý. Sẽ giới thiệu cho bạn bè.',
    'Học xong cảm thấy nắm vững React Native hơn nhiều.',
    'Giảng viên tận tâm, trả lời câu hỏi nhanh chóng.',
    'Khóa học đáng tiền, kiến thức thực tế và cập nhật.'
  ];

  const feedbacks = [];
  for (let i = 0; i < 15; i++) {
    const randomStudent = students[Math.floor(Math.random() * students.length)];
    const randomContent = feedbackContents[Math.floor(Math.random() * feedbackContents.length)];
    const rating = Math.random() > 0.2 ? (Math.random() > 0.5 ? 5 : 4) : Math.floor(Math.random() * 3) + 1;
    
    const feedback = feedbackRepository.create({
      content: randomContent,
      rating: rating,
      like: Math.floor(Math.random() * 15),
      dislike: Math.floor(Math.random() * 3),
      userId: randomStudent.id,
      courseId: savedCourse.id,
      createdAt: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000), // Last 60 days
    });
    
    feedbacks.push(feedback);
  }

  const savedFeedbacks = await feedbackRepository.save(feedbacks);
  console.log(`⭐ Created ${savedFeedbacks.length} feedbacks`);

  // Update course statistics
  const avgRating = savedFeedbacks.reduce((acc, f) => acc + f.rating, 0) / savedFeedbacks.length;
  savedCourse.averageRating = Math.round(avgRating * 10) / 10;
  savedCourse.rating = savedFeedbacks.length;
  await courseRepository.save(savedCourse);

  console.log('✅ Instructor data seeding completed!');
  console.log(`📊 Summary for ${instructor1.fullName}:`);
  console.log(`   - 1 course: ${savedCourse.name}`);
  console.log(`   - ${savedChapters.length} chapters`);
  console.log(`   - ${savedLectures.length} lectures`);
  console.log(`   - ${savedComments.length} comments (${replies.length} replies)`);
  console.log(`   - ${savedFeedbacks.length} feedbacks (avg: ${avgRating.toFixed(1)}⭐)`);
}