import { faker } from '@faker-js/faker';
import { CourseLevel } from 'src/app/entities/enums/course.enum';
import { CreateCourseDto } from './dto/create-course.dto';

export class CourseTestDataGenerator {
  static generateVietnameseCourse(
    categoryIds: string[],
    createdBy: string,
  ): Omit<CreateCourseDto, 'createdBy'> & { createdBy: string } {
    const vnTopics = [
      'Lập trình Web',
      'Lập trình Mobile',
      'Khoa học Dữ liệu',
      'Học máy',
      'Điện toán Đám mây',
      'DevOps',
      'An ninh mạng',
      'Blockchain',
      'Phát triển Game',
      'Thiết kế UI/UX',
      'Backend Development',
      'Frontend Development',
      'Full Stack',
      'Quản trị Database',
      'Phát triển API',
      'Microservices',
      'Testing & QA',
      'Agile & Scrum',
      'Kiến trúc Phần mềm',
      'Thiết kế Hệ thống',
    ];

    const vnTechs = [
      'React',
      'Vue.js',
      'Angular',
      'Node.js',
      'Python',
      'Java',
      'C#',
      'Go',
      'Rust',
      'TypeScript',
      'JavaScript',
      'Kotlin',
      'Swift',
      'Flutter',
      'React Native',
      'Docker',
      'Kubernetes',
      'AWS',
      'Azure',
      'PostgreSQL',
    ];

    const levels = [CourseLevel.BEGINNER, CourseLevel.INTERMEDIATE, CourseLevel.ADVANCED];
    const levelTexts = {
      [CourseLevel.BEGINNER]: 'từ cơ bản đến nâng cao',
      [CourseLevel.INTERMEDIATE]: 'nâng cao',
      [CourseLevel.ADVANCED]: 'chuyên sâu',
    };

    const topic = faker.helpers.arrayElement(vnTopics);
    const tech = faker.helpers.arrayElement(vnTechs);
    const level = faker.helpers.arrayElement(levels);
    const levelText = levelTexts[level];

    return {
      name: `${topic} với ${tech} ${levelText}`,
      description: `Khóa học ${topic} toàn diện với ${tech}. Học từ cơ bản đến nâng cao, bao gồm nhiều dự án thực tế và bài tập thực hành. Phù hợp cho người mới bắt đầu và những ai muốn nâng cao kỹ năng.`,
      notes: `Yêu cầu: ${faker.helpers.arrayElement(['Không yêu cầu kiến thức nền', 'Biết lập trình cơ bản', 'Có kinh nghiệm lập trình'])}`,
      thumbnail: faker.image.urlLoremFlickr({
        category: 'technology',
        width: 1920,
        height: 1080,
      }),
      price: faker.number.int({ min: 99000, max: 1999000 }),
      level,
      totalDuration: faker.number.int({ min: 1800, max: 7200 }),
      categoryId: faker.helpers.arrayElement(categoryIds),
      createdBy,
    };
  }

  static generateVietnameseCourses(
    quantity: number,
    categoryIds: string[],
    createdBy: string,
  ): (Omit<CreateCourseDto, 'createdBy'> & { createdBy: string })[] {
    const courses = [];

    for (let i = 0; i < quantity; i++) {
      courses.push(this.generateVietnameseCourse(categoryIds, createdBy));
    }

    return courses;
  }
}

export class ChapterTestDataGenerator {
  static generateChapter(
    courseId: string,
    createdBy: string,
    index: number,
  ): {
    name: string;
    courseId: string;
    description?: string;
    duration?: number;
    createdBy: string;
  } {
    const chapterTopics = [
      'Giới thiệu',
      'Cài đặt môi trường',
      'Kiến thức cơ bản',
      'Nâng cao',
      'Thực hành',
      'Dự án thực tế',
      'Tối ưu hóa',
      'Bảo mật',
      'Testing',
      'Deployment',
    ];

    return {
      name: `Chương ${index + 1}: ${faker.helpers.arrayElement(chapterTopics)}`,
      courseId,
      description: faker.lorem.paragraph(),
      duration: faker.number.int({ min: 300, max: 1800 }),
      createdBy,
    };
  }

  static generateChapters(
    courseId: string,
    createdBy: string,
    quantity: number,
  ): {
    name: string;
    courseId: string;
    description?: string;
    duration?: number;
    createdBy: string;
  }[] {
    const chapters = [];

    for (let i = 0; i < quantity; i++) {
      chapters.push(this.generateChapter(courseId, createdBy, i));
    }

    return chapters;
  }
}

export class LectureTestDataGenerator {
  static generateLecture(
    chapterId: string,
    createdBy: string,
    index: number,
  ): {
    name: string;
    description?: string;
    fileUrl: string;
    duration: number;
    isPreview?: boolean;
    orderIndex: number;
    chapterId: string;
    createdBy: string;
  } {
    const lectureTopics = [
      'Tổng quan',
      'Khái niệm cơ bản',
      'Ví dụ thực tế',
      'Bài tập',
      'Demo',
      'Best practices',
      'Common mistakes',
      'Tips & tricks',
      'Q&A',
      'Tổng kết',
    ];

    const sampleVideos = [
      'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
      'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
      'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
      'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
      'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4',
      'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
      'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4',
      'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
      'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4',
    ];

    return {
      name: `Bài ${index + 1}: ${faker.helpers.arrayElement(lectureTopics)}`,
      description: faker.lorem.sentence(),
      fileUrl: faker.helpers.arrayElement(sampleVideos),
      duration: faker.number.int({ min: 180, max: 900 }),
      isPreview: index === 0 ? faker.datatype.boolean({ probability: 0.3 }) : false,
      orderIndex: index + 1,
      chapterId,
      createdBy,
    };
  }

  static generateLectures(
    chapterId: string,
    createdBy: string,
    quantity: number,
  ): {
    name: string;
    description?: string;
    fileUrl: string;
    duration: number;
    isPreview?: boolean;
    orderIndex: number;
    chapterId: string;
    createdBy: string;
  }[] {
    const lectures = [];

    for (let i = 0; i < quantity; i++) {
      lectures.push(this.generateLecture(chapterId, createdBy, i));
    }

    return lectures;
  }
}
