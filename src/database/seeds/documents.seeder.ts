import { DataSource } from 'typeorm';
import { Document, DocumentEntityType } from '../../app/entities/document.entity';
import { User } from '../../app/entities/user.entity';
import { Course } from '../../app/entities/course.entity';
import { Chapter } from '../../app/entities/chapter.entity';
import { Lecture } from '../../app/entities/lecture.entity';

/**
 * DOCUMENTS SEEDER - Tạo dữ liệu mẫu documents cho instructor1
 * Tạo documents cho courses, chapters, lectures hiện có
 */
export async function seedDocuments(dataSource: DataSource) {
  const documentRepository = dataSource.getRepository(Document);
  const userRepository = dataSource.getRepository(User);
  const courseRepository = dataSource.getRepository(Course);
  const chapterRepository = dataSource.getRepository(Chapter);
  const lectureRepository = dataSource.getRepository(Lecture);

  console.log('📄 Starting documents seeding...');

  // Get instructor1 (Lê Hoàng Nam)
  const instructor1 = await userRepository.findOne({
    where: { email: 'instructor1@wishzy.com' }
  });

  if (!instructor1) {
    console.log('❌ Instructor1 not found, skipping documents seeding');
    return;
  }

  console.log('👨‍🏫 Creating documents for instructor1:', instructor1.fullName);

  // Get instructor's courses
  const courses = await courseRepository.find({
    where: { createdBy: instructor1.id },
    take: 5 // Limit to first 5 courses
  });

  if (courses.length === 0) {
    console.log('❌ No courses found for instructor1, skipping documents seeding');
    return;
  }

  console.log(`📚 Found ${courses.length} courses for instructor1`);

  // Get chapters and lectures for the first course
  const firstCourse = courses[0];
  const chapters = await chapterRepository.find({
    where: { courseId: firstCourse.id },
    take: 3
  });

  const lectures = await lectureRepository.find({
    where: { chapterId: chapters.length > 0 ? chapters[0].id : undefined },
    take: 5
  });

  console.log(`📖 Found ${chapters.length} chapters and ${lectures.length} lectures`);

  // Create documents data
  const documentsData = [];

  // Course-level documents
  const courseDocuments = [
    {
      name: 'Setup Guide.pdf',
      notes: 'Hướng dẫn cài đặt môi trường',
      descriptions: 'Tài liệu hướng dẫn cài đặt môi trường development',
      fileUrl: '/documents/setup_guide.pdf',
      entityId: firstCourse.id,
      entityType: DocumentEntityType.COURSE,
      createdBy: instructor1.id,
      createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
    },
    {
      name: 'Cheat Sheet.docx',
      notes: 'Bảng tóm tắt kiến thức',
      descriptions: 'Tài liệu tổng hợp kiến thức quan trọng',
      fileUrl: '/documents/cheat_sheet.docx',
      entityId: firstCourse.id,
      entityType: DocumentEntityType.COURSE,
      createdBy: instructor1.id,
      createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
    },
    {
      name: 'Source Code.zip',
      notes: 'Source code dự án demo',
      descriptions: 'File ZIP chứa source code thực hành',
      fileUrl: '/documents/source_code.zip',
      entityId: firstCourse.id,
      entityType: DocumentEntityType.COURSE,
      createdBy: instructor1.id,
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    }
  ];

  documentsData.push(...courseDocuments);

  // Chapter-level documents
  chapters.slice(0, 3).forEach((chapter, index) => {
    documentsData.push({
      name: `Chapter ${index + 1} Guide.pdf`,
      notes: `Hướng dẫn chương ${index + 1}`,
      descriptions: `Tài liệu chi tiết chương: ${chapter.name}`,
      fileUrl: `/documents/chapter_${index + 1}_guide.pdf`,
      entityId: chapter.id,
      entityType: DocumentEntityType.CHAPTER,
      createdBy: instructor1.id,
      createdAt: new Date(Date.now() - (18 - index * 3) * 24 * 60 * 60 * 1000),
    });
  });

  // Lecture-level documents
  lectures.slice(0, 5).forEach((lecture, index) => {
    documentsData.push({
      name: `${lecture.name} Materials.${index % 2 === 0 ? 'pdf' : 'docx'}`,
      notes: `Tài liệu bài giảng: ${lecture.name}`,
      descriptions: `Slide và bài tập cho bài giảng ${lecture.name}`,
      fileUrl: `/documents/lecture_${lecture.id}_materials.${index % 2 === 0 ? 'pdf' : 'docx'}`,
      entityId: lecture.id,
      entityType: DocumentEntityType.LECTURE,
      createdBy: instructor1.id,
      createdAt: new Date(Date.now() - (10 - index * 2) * 24 * 60 * 60 * 1000),
    });
  });

  // Save documents to database
  const savedDocuments = await documentRepository.save(documentsData);
  console.log(`📄 Created ${savedDocuments.length} documents`);

  // Summary
  const courseDocsCount = savedDocuments.filter(d => d.entityType === DocumentEntityType.COURSE).length;
  const chapterDocsCount = savedDocuments.filter(d => d.entityType === DocumentEntityType.CHAPTER).length;
  const lectureDocsCount = savedDocuments.filter(d => d.entityType === DocumentEntityType.LECTURE).length;

  console.log('✅ Documents seeding completed!');
  console.log(`📊 Summary for ${instructor1.fullName}:`);
  console.log(`   - ${courseDocsCount} course documents`);
  console.log(`   - ${chapterDocsCount} chapter documents`);
  console.log(`   - ${lectureDocsCount} lecture documents`);
  console.log(`   - Total: ${savedDocuments.length} documents`);
}