import { DataSource } from 'typeorm';
import { Course } from '../../app/entities/course.entity';
import { Chapter } from '../../app/entities/chapter.entity';
import { Lecture } from '../../app/entities/lecture.entity';
import { Comment, CommentStatus } from '../../app/entities/comment.entity';
import { Feedback } from '../../app/entities/feedback.entity';
import { User, UserRole } from '../../app/entities/user.entity';
import { Document, DocumentEntityType } from '../../app/entities/document.entity';
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
 * - 11 documents (course, chapter, lecture levels)
 *
 * @see INSTRUCTOR_SEED_README.md để biết thêm chi tiết
 */
export async function seedInstructorData(dataSource: DataSource) {
  const courseRepository = dataSource.getRepository(Course);
  const chapterRepository = dataSource.getRepository(Chapter);
  const lectureRepository = dataSource.getRepository(Lecture);
  const commentRepository = dataSource.getRepository(Comment);
  const feedbackRepository = dataSource.getRepository(Feedback);
  const documentRepository = dataSource.getRepository(Document);
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

  // Create documents for the course and lectures
  const documentData = [
    // Course-level documents
    {
      name: 'React Native Setup Guide.pdf',
      notes: 'Hướng dẫn cài đặt môi trường React Native chi tiết',
      descriptions: 'Tài liệu PDF hướng dẫn cài đặt môi trường development cho React Native trên Windows, macOS và Linux',
      fileUrl: '/documents/course_react_native_setup_guide.pdf',
      entityId: savedCourse.id,
      entityType: DocumentEntityType.COURSE,
      createdBy: instructor1.id,
      createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000), // 25 days ago
    },
    {
      name: 'React Native Cheat Sheet.docx',
      notes: 'Bảng tóm tắt các components và APIs quan trọng',
      descriptions: 'Tài liệu Word tổng hợp các components, hooks và APIs thường dùng trong React Native',
      fileUrl: '/documents/course_react_native_cheat_sheet.docx',
      entityId: savedCourse.id,
      entityType: DocumentEntityType.COURSE,
      createdBy: instructor1.id,
      createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), // 20 days ago
    },
    {
      name: 'Project Source Code.zip',
      notes: 'Source code hoàn chỉnh của dự án demo',
      descriptions: 'File ZIP chứa toàn bộ source code của các dự án thực hành trong khóa học',
      fileUrl: '/documents/course_project_source_code.zip',
      entityId: savedCourse.id,
      entityType: DocumentEntityType.COURSE,
      createdBy: instructor1.id,
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
    },
    // Chapter-level documents
    {
      name: 'Chapter 1 - Setup Checklist.pdf',
      notes: 'Checklist kiểm tra cài đặt môi trường',
      descriptions: 'Danh sách kiểm tra để đảm bảo môi trường development được cài đặt đúng cách',
      fileUrl: '/documents/chapter_1_setup_checklist.pdf',
      entityId: savedChapters[0].id,
      entityType: DocumentEntityType.CHAPTER,
      createdBy: instructor1.id,
      createdAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000), // 18 days ago
    },
    {
      name: 'Chapter 2 - Component Examples.docx',
      notes: 'Ví dụ code các components cơ bản',
      descriptions: 'Tài liệu chứa code mẫu và giải thích chi tiết về các components React Native',
      fileUrl: '/documents/chapter_2_component_examples.docx',
      entityId: savedChapters[1].id,
      entityType: DocumentEntityType.CHAPTER,
      createdBy: instructor1.id,
      createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000), // 12 days ago
    },
    {
      name: 'Chapter 3 - State Management Guide.pdf',
      notes: 'Hướng dẫn quản lý state với hooks',
      descriptions: 'Tài liệu chi tiết về useState, useEffect và các patterns quản lý state',
      fileUrl: '/documents/chapter_3_state_management.pdf',
      entityId: savedChapters[2].id,
      entityType: DocumentEntityType.CHAPTER,
      createdBy: instructor1.id,
      createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), // 8 days ago
    },
    // Lecture-level documents
    {
      name: 'CLI Installation Script.txt',
      notes: 'Script tự động cài đặt React Native CLI',
      descriptions: 'File script bash/batch để tự động cài đặt React Native CLI và dependencies',
      fileUrl: '/documents/lecture_cli_installation_script.txt',
      entityId: savedLectures[0].id,
      entityType: DocumentEntityType.LECTURE,
      createdBy: instructor1.id,
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
    },
    {
      name: 'First Project Template.zip',
      notes: 'Template project cho bài học đầu tiên',
      descriptions: 'Template project React Native cơ bản để học viên có thể bắt đầu nhanh chóng',
      fileUrl: '/documents/lecture_first_project_template.zip',
      entityId: savedLectures[1].id,
      entityType: DocumentEntityType.LECTURE,
      createdBy: instructor1.id,
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    },
    {
      name: 'StyleSheet Examples.docx',
      notes: 'Ví dụ về styling trong React Native',
      descriptions: 'Tài liệu chứa các ví dụ về StyleSheet, Flexbox và responsive design',
      fileUrl: '/documents/lecture_stylesheet_examples.docx',
      entityId: savedLectures[2].id,
      entityType: DocumentEntityType.LECTURE,
      createdBy: instructor1.id,
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    },
    {
      name: 'Navigation Setup Guide.pdf',
      notes: 'Hướng dẫn cài đặt React Navigation',
      descriptions: 'Tài liệu step-by-step cài đặt và cấu hình React Navigation v6',
      fileUrl: '/documents/lecture_navigation_setup.pdf',
      entityId: savedLectures[3].id,
      entityType: DocumentEntityType.LECTURE,
      createdBy: instructor1.id,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    },
    {
      name: 'Hooks Practice Exercises.pdf',
      notes: 'Bài tập thực hành về React Hooks',
      descriptions: 'Tập hợp các bài tập thực hành useState, useEffect và custom hooks',
      fileUrl: '/documents/lecture_hooks_exercises.pdf',
      entityId: savedLectures[4].id,
      entityType: DocumentEntityType.LECTURE,
      createdBy: instructor1.id,
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    }
  ];

  const documents = [];
  for (const docData of documentData) {
    const document = documentRepository.create(docData);
    documents.push(document);
  }

  const savedDocuments = await documentRepository.save(documents);
  console.log(`📄 Created ${savedDocuments.length} documents`);

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
  console.log(`   - ${savedDocuments.length} documents`);
}