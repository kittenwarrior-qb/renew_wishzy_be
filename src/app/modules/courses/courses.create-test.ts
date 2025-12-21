import { faker } from '@faker-js/faker';
import { CourseLevel } from 'src/app/entities/enums/course.enum';
import { CreateCourseDto } from './dto/create-course.dto';

/**
 * ============================================
 * UDEMY-STYLE TEST DATA GENERATOR
 * ============================================
 * Tạo dữ liệu test chuẩn Udemy với:
 * - Thumbnails chất lượng cao từ Unsplash
 * - Video samples từ Google
 * - Cấu trúc khóa học logic (intro -> content -> final project)
 * - Quiz xen kẽ hợp lý (không phải bài nào cũng có quiz)
 */

// ============================================
// CONSTANTS & SAMPLE DATA
// ============================================

// Unsplash images với keywords cụ thể cho từng chủ đề
const COURSE_THUMBNAILS: Record<string, string[]> = {
  'Lập trình Web': [
    'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=1280&h=720&fit=crop', // JavaScript
    'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=1280&h=720&fit=crop', // React
    'https://images.unsplash.com/photo-1581276879432-15e50529f34b?w=1280&h=720&fit=crop', // Coding
  ],
  'Lập trình Mobile': [
    'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=1280&h=720&fit=crop', // Mobile app
    'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=1280&h=720&fit=crop', // Phone dev
  ],
  'Khoa học Dữ liệu': [
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1280&h=720&fit=crop', // Data
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1280&h=720&fit=crop', // Analytics
  ],
  DevOps: [
    'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=1280&h=720&fit=crop', // Docker
    'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1280&h=720&fit=crop', // Server
  ],
  default: [
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1280&h=720&fit=crop', // Tech
    'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1280&h=720&fit=crop', // Laptop
    'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1280&h=720&fit=crop', // Coding
    'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=1280&h=720&fit=crop', // Code
  ],
};

// Sample videos với duration thực tế (seconds)
const SAMPLE_VIDEOS: Array<{ url: string; duration: number }> = [
  // Short videos (15s - 30s) - cho intro/outro
  {
    url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    duration: 15,
  },
  {
    url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    duration: 15,
  },
  {
    url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    duration: 60,
  },
  {
    url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
    duration: 15,
  },
  {
    url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
    duration: 15,
  },
  // Medium/Long videos - cho content chính
  {
    url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    duration: 596,
  }, // ~10 min
  {
    url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    duration: 653,
  }, // ~11 min
  {
    url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    duration: 888,
  }, // ~15 min
  {
    url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    duration: 734,
  }, // ~12 min
];

// Cấu trúc khóa học chuẩn Udemy
interface CourseStructure {
  topic: string;
  techs: string[];
  chapters: ChapterTemplate[];
}

interface ChapterTemplate {
  nameTemplate: string;
  description: string;
  lectureCount: number;
  lectureTypes: LectureType[];
}

type LectureType = 'intro' | 'theory' | 'practice' | 'exercise' | 'quiz' | 'project' | 'summary';

// Template cho các loại khóa học
const COURSE_TEMPLATES: CourseStructure[] = [
  {
    topic: 'Lập trình Web',
    techs: ['React', 'Vue.js', 'Angular', 'Node.js', 'TypeScript', 'Next.js'],
    chapters: [
      {
        nameTemplate: 'Giới thiệu khóa học',
        description: 'Tổng quan và cài đặt',
        lectureCount: 2,
        lectureTypes: ['intro', 'theory'],
      },
      {
        nameTemplate: 'Kiến thức nền tảng',
        description: 'Các khái niệm cơ bản',
        lectureCount: 4,
        lectureTypes: ['theory', 'practice', 'exercise', 'quiz'],
      },
      {
        nameTemplate: 'Xây dựng Components',
        description: 'Tạo và quản lý components',
        lectureCount: 5,
        lectureTypes: ['theory', 'practice', 'practice', 'exercise', 'quiz'],
      },
      {
        nameTemplate: 'State Management',
        description: 'Quản lý trạng thái ứng dụng',
        lectureCount: 4,
        lectureTypes: ['theory', 'practice', 'exercise', 'quiz'],
      },
      {
        nameTemplate: 'API Integration',
        description: 'Kết nối với backend',
        lectureCount: 4,
        lectureTypes: ['theory', 'practice', 'practice', 'quiz'],
      },
      {
        nameTemplate: 'Dự án thực tế',
        description: 'Xây dựng ứng dụng hoàn chỉnh',
        lectureCount: 3,
        lectureTypes: ['project', 'project', 'quiz'],
      },
    ],
  },
  {
    topic: 'Backend Development',
    techs: ['Node.js', 'NestJS', 'Express', 'Python', 'Django', 'FastAPI'],
    chapters: [
      {
        nameTemplate: 'Giới thiệu Backend',
        description: 'Tổng quan về backend',
        lectureCount: 2,
        lectureTypes: ['intro', 'theory'],
      },
      {
        nameTemplate: 'RESTful API',
        description: 'Thiết kế và xây dựng API',
        lectureCount: 5,
        lectureTypes: ['theory', 'practice', 'practice', 'exercise', 'quiz'],
      },
      {
        nameTemplate: 'Database',
        description: 'Làm việc với cơ sở dữ liệu',
        lectureCount: 4,
        lectureTypes: ['theory', 'practice', 'exercise', 'quiz'],
      },
      {
        nameTemplate: 'Authentication',
        description: 'Xác thực và phân quyền',
        lectureCount: 4,
        lectureTypes: ['theory', 'practice', 'practice', 'quiz'],
      },
      {
        nameTemplate: 'Deployment',
        description: 'Triển khai ứng dụng',
        lectureCount: 3,
        lectureTypes: ['theory', 'practice', 'quiz'],
      },
    ],
  },
  {
    topic: 'DevOps',
    techs: ['Docker', 'Kubernetes', 'AWS', 'CI/CD', 'Terraform', 'Jenkins'],
    chapters: [
      {
        nameTemplate: 'Giới thiệu DevOps',
        description: 'DevOps là gì?',
        lectureCount: 2,
        lectureTypes: ['intro', 'theory'],
      },
      {
        nameTemplate: 'Containerization',
        description: 'Docker và containers',
        lectureCount: 4,
        lectureTypes: ['theory', 'practice', 'exercise', 'quiz'],
      },
      {
        nameTemplate: 'Orchestration',
        description: 'Kubernetes cơ bản',
        lectureCount: 4,
        lectureTypes: ['theory', 'practice', 'practice', 'quiz'],
      },
      {
        nameTemplate: 'CI/CD Pipeline',
        description: 'Tự động hóa deployment',
        lectureCount: 4,
        lectureTypes: ['theory', 'practice', 'exercise', 'quiz'],
      },
      {
        nameTemplate: 'Monitoring',
        description: 'Giám sát hệ thống',
        lectureCount: 3,
        lectureTypes: ['theory', 'practice', 'quiz'],
      },
    ],
  },
];

// Lecture name templates theo type
const LECTURE_TEMPLATES: Record<LectureType, string[]> = {
  intro: ['Giới thiệu khóa học', 'Tổng quan nội dung', 'Hướng dẫn học tập', 'Cài đặt môi trường'],
  theory: [
    'Khái niệm {topic}',
    'Tìm hiểu về {topic}',
    'Lý thuyết {topic}',
    '{topic} là gì?',
    'Nguyên lý {topic}',
  ],
  practice: [
    'Thực hành {topic}',
    'Demo {topic}',
    'Coding {topic}',
    'Xây dựng {topic}',
    'Triển khai {topic}',
  ],
  exercise: ['Bài tập {topic}', 'Thử thách {topic}', 'Luyện tập {topic}'],
  quiz: ['Kiểm tra kiến thức', 'Bài kiểm tra', 'Đánh giá chương'],
  project: ['Dự án: {topic}', 'Xây dựng dự án', 'Hoàn thiện dự án'],
  summary: ['Tổng kết chương', 'Ôn tập kiến thức', 'Kết luận'],
};

// Quiz questions templates
const QUIZ_QUESTION_TEMPLATES = [
  {
    template: 'Trong {tech}, {concept} được sử dụng để làm gì?',
    answers: [
      { text: 'Để {correctAction}', correct: true },
      { text: 'Để {wrongAction1}', correct: false },
      { text: 'Để {wrongAction2}', correct: false },
      { text: 'Không có tác dụng gì', correct: false },
    ],
  },
  {
    template: 'Đâu là cách đúng để {action} trong {tech}?',
    answers: [
      { text: '{correctSyntax}', correct: true },
      { text: '{wrongSyntax1}', correct: false },
      { text: '{wrongSyntax2}', correct: false },
      { text: '{wrongSyntax3}', correct: false },
    ],
  },
  {
    template: 'Khi nào nên sử dụng {concept} trong {tech}?',
    answers: [
      { text: 'Khi cần {correctUseCase}', correct: true },
      { text: 'Khi cần {wrongUseCase1}', correct: false },
      { text: 'Luôn luôn sử dụng', correct: false },
      { text: 'Không bao giờ sử dụng', correct: false },
    ],
  },
  {
    template: '{concept} trong {tech} có đặc điểm gì?',
    answers: [
      { text: '{correctFeature}', correct: true },
      { text: '{wrongFeature1}', correct: false },
      { text: '{wrongFeature2}', correct: false },
      { text: 'Tất cả các đáp án trên đều sai', correct: false },
    ],
  },
  {
    template: 'Lỗi nào thường gặp khi làm việc với {concept}?',
    answers: [
      { text: '{correctError}', correct: true },
      { text: '{wrongError1}', correct: false },
      { text: '{wrongError2}', correct: false },
      { text: 'Không có lỗi nào', correct: false },
    ],
  },
];

// Concepts cho từng tech
const TECH_CONCEPTS: Record<string, string[]> = {
  React: ['useState', 'useEffect', 'Components', 'Props', 'State', 'Hooks', 'Context', 'Redux'],
  'Vue.js': [
    'Reactive Data',
    'Computed Properties',
    'Watchers',
    'Directives',
    'Vuex',
    'Composition API',
  ],
  'Node.js': ['Event Loop', 'Modules', 'npm', 'Express', 'Middleware', 'Async/Await'],
  TypeScript: ['Types', 'Interfaces', 'Generics', 'Enums', 'Type Guards', 'Decorators'],
  Docker: ['Containers', 'Images', 'Dockerfile', 'Docker Compose', 'Volumes', 'Networks'],
  Kubernetes: ['Pods', 'Services', 'Deployments', 'ConfigMaps', 'Secrets', 'Ingress'],
  default: ['Variables', 'Functions', 'Classes', 'Objects', 'Arrays', 'Loops'],
};

// ============================================
// SAMPLE DOCUMENTS DATA
// ============================================

// Sample PDF documents (public URLs)
const SAMPLE_DOCUMENTS = {
  pdf: [
    'https://www.w3.org/WAI/WCAG21/Techniques/pdf/img/table-word.jpg', // placeholder
    'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf',
  ],
  // Course-level documents
  courseDocuments: [
    {
      name: 'Giáo trình khóa học.pdf',
      descriptions: 'Tài liệu tổng hợp toàn bộ nội dung khóa học',
      fileUrl: 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf',
    },
    {
      name: 'Hướng dẫn cài đặt môi trường.pdf',
      descriptions: 'Hướng dẫn chi tiết cách cài đặt các công cụ cần thiết',
      fileUrl: 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf',
    },
    {
      name: 'Tài liệu tham khảo.pdf',
      descriptions: 'Danh sách các nguồn tài liệu tham khảo bổ sung',
      fileUrl: 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf',
    },
  ],
  // Chapter-level documents
  chapterDocuments: [
    {
      nameTemplate: 'Slide bài giảng - {chapter}.pdf',
      descriptions: 'Slide tóm tắt nội dung chương',
    },
    {
      nameTemplate: 'Bài tập thực hành - {chapter}.pdf',
      descriptions: 'Các bài tập thực hành cho chương này',
    },
  ],
  // Lecture-level documents
  lectureDocuments: [
    {
      nameTemplate: 'Code mẫu - {lecture}.zip',
      descriptions: 'Source code mẫu cho bài học',
    },
    {
      nameTemplate: 'Ghi chú bài học - {lecture}.pdf',
      descriptions: 'Ghi chú và tóm tắt nội dung bài học',
    },
    {
      nameTemplate: 'Tài liệu bổ sung - {lecture}.pdf',
      descriptions: 'Tài liệu đọc thêm cho bài học',
    },
  ],
};

// ============================================
// HELPER FUNCTIONS
// ============================================

function getThumbnail(topic: string): string {
  const thumbnails = COURSE_THUMBNAILS[topic] || COURSE_THUMBNAILS.default;
  return faker.helpers.arrayElement(thumbnails);
}

function getVideo(isShort: boolean = false): { url: string; duration: number } {
  if (isShort) {
    return faker.helpers.arrayElement(SAMPLE_VIDEOS.slice(0, 5));
  }
  return faker.helpers.arrayElement(SAMPLE_VIDEOS.slice(5)); // Long videos only
}

function getConcepts(tech: string): string[] {
  return TECH_CONCEPTS[tech] || TECH_CONCEPTS.default;
}

// ============================================
// COURSE GENERATOR
// ============================================

export class CourseTestDataGenerator {
  static generateVietnameseCourse(
    categoryIds: string[],
    createdBy: string,
  ): Omit<CreateCourseDto, 'createdBy'> & { createdBy: string } {
    const template = faker.helpers.arrayElement(COURSE_TEMPLATES);
    const tech = faker.helpers.arrayElement(template.techs);
    const levels = [CourseLevel.BEGINNER, CourseLevel.INTERMEDIATE, CourseLevel.ADVANCED];
    const level = faker.helpers.arrayElement(levels);

    const levelTexts = {
      [CourseLevel.BEGINNER]: 'cho người mới bắt đầu',
      [CourseLevel.INTERMEDIATE]: 'nâng cao',
      [CourseLevel.ADVANCED]: 'chuyên sâu',
    };

    // Tính tổng duration dựa trên số chapters và lectures
    const totalLectures = template.chapters.reduce((sum, ch) => sum + ch.lectureCount, 0);
    const avgDuration = faker.number.int({ min: 300, max: 600 }); // 5-10 min per lecture
    const totalDuration = totalLectures * avgDuration;

    // Giá theo level
    const priceRanges = {
      [CourseLevel.BEGINNER]: { min: 199000, max: 499000 },
      [CourseLevel.INTERMEDIATE]: { min: 499000, max: 999000 },
      [CourseLevel.ADVANCED]: { min: 999000, max: 1999000 },
    };
    const priceRange = priceRanges[level];

    return {
      name: `${template.topic} với ${tech} ${levelTexts[level]}`,
      description: `Khóa học ${template.topic} toàn diện với ${tech}. Bạn sẽ học từ những khái niệm cơ bản nhất đến các kỹ thuật nâng cao, bao gồm nhiều dự án thực tế và bài tập thực hành. Khóa học phù hợp cho ${level === CourseLevel.BEGINNER ? 'người mới bắt đầu' : 'những ai đã có kiến thức nền tảng'}.`,
      notes: `Yêu cầu: ${level === CourseLevel.BEGINNER ? 'Không yêu cầu kiến thức nền' : 'Có kiến thức lập trình cơ bản'}. Bao gồm ${totalLectures} bài học, ${template.chapters.length} chương.`,
      thumbnail: getThumbnail(template.topic),
      price: faker.number.int(priceRange),
      level,
      totalDuration,
      categoryId: faker.helpers.arrayElement(categoryIds),
      createdBy,
    };
  }

  static generateVietnameseCourses(
    quantity: number,
    categoryIds: string[],
    createdBy: string,
  ): (Omit<CreateCourseDto, 'createdBy'> & { createdBy: string })[] {
    return Array.from({ length: quantity }, () =>
      this.generateVietnameseCourse(categoryIds, createdBy),
    );
  }
}

// ============================================
// CHAPTER GENERATOR
// ============================================

export class ChapterTestDataGenerator {
  static generateChaptersForCourse(
    courseId: string,
    createdBy: string,
    courseName: string,
  ): Array<{
    name: string;
    courseId: string;
    description: string;
    orderIndex: number;
    createdBy: string;
    _lectureTypes: LectureType[]; // Internal use for lecture generation
  }> {
    // Detect which template to use based on course name
    const template =
      COURSE_TEMPLATES.find((t) => courseName.toLowerCase().includes(t.topic.toLowerCase())) ||
      COURSE_TEMPLATES[0];

    return template.chapters.map((chapterTemplate, index) => ({
      name: `Chương ${index + 1}: ${chapterTemplate.nameTemplate}`,
      courseId,
      description: chapterTemplate.description,
      orderIndex: index,
      createdBy,
      _lectureTypes: chapterTemplate.lectureTypes,
    }));
  }

  // Legacy method for backward compatibility
  static generateChapters(
    courseId: string,
    createdBy: string,
    quantity: number,
  ): Array<{
    name: string;
    courseId: string;
    description?: string;
    duration?: number;
    createdBy: string;
  }> {
    const chapterTopics = [
      'Giới thiệu',
      'Kiến thức cơ bản',
      'Nâng cao',
      'Thực hành',
      'Dự án thực tế',
    ];

    return Array.from({ length: quantity }, (_, i) => ({
      name: `Chương ${i + 1}: ${chapterTopics[i % chapterTopics.length]}`,
      courseId,
      description: faker.lorem.paragraph(),
      duration: faker.number.int({ min: 300, max: 1800 }),
      createdBy,
    }));
  }
}

// ============================================
// LECTURE GENERATOR
// ============================================

export class LectureTestDataGenerator {
  static generateLecturesForChapter(
    chapterId: string,
    createdBy: string,
    chapterIndex: number,
    lectureTypes: LectureType[],
    tech: string,
  ): Array<{
    name: string;
    description: string;
    fileUrl: string;
    duration: number;
    isPreview: boolean;
    orderIndex: number;
    chapterId: string;
    createdBy: string;
    requiresQuiz: boolean;
    _type: LectureType; // Internal use
  }> {
    const concepts = getConcepts(tech);

    return lectureTypes.map((type, index) => {
      const concept = faker.helpers.arrayElement(concepts);
      const templates = LECTURE_TEMPLATES[type];
      const nameTemplate = faker.helpers.arrayElement(templates);
      const name = nameTemplate.replace('{topic}', concept);

      // First lecture of first chapter is preview
      const isPreview = chapterIndex === 0 && index === 0;

      // Quiz type lectures require quiz
      const requiresQuiz = type === 'quiz';

      // Quiz lectures don't have video
      let fileUrl = '';
      let duration = 0;

      if (!requiresQuiz) {
        // Get video with matching duration
        const isShortVideo = type === 'intro' || type === 'summary';
        const video = getVideo(isShortVideo);
        fileUrl = video.url;
        duration = video.duration;
      }

      return {
        name: `Bài ${index + 1}: ${name}`,
        description: `${type === 'quiz' ? 'Bài kiểm tra kiến thức về ' : 'Học về '}${concept} trong ${tech}`,
        fileUrl,
        duration,
        isPreview,
        orderIndex: index,
        chapterId,
        createdBy,
        requiresQuiz,
        _type: type,
      };
    });
  }

  // Legacy method
  static generateLectures(
    chapterId: string,
    createdBy: string,
    quantity: number,
    quizPattern: 'none' | 'alternate' | 'end' | 'random' = 'alternate',
  ): Array<{
    name: string;
    description?: string;
    fileUrl: string;
    duration: number;
    isPreview?: boolean;
    orderIndex: number;
    chapterId: string;
    createdBy: string;
    requiresQuiz: boolean;
  }> {
    const lectureTopics = ['Tổng quan', 'Khái niệm', 'Thực hành', 'Bài tập', 'Demo'];

    return Array.from({ length: quantity }, (_, i) => {
      let requiresQuiz = false;
      switch (quizPattern) {
        case 'alternate':
          requiresQuiz = (i + 1) % 3 === 0; // Every 3rd lecture
          break;
        case 'end':
          requiresQuiz = i === quantity - 1;
          break;
        case 'random':
          requiresQuiz = faker.datatype.boolean({ probability: 0.3 });
          break;
      }

      // Get video with actual duration
      const video = requiresQuiz ? { url: '', duration: 0 } : getVideo(false);

      return {
        name: `Bài ${i + 1}: ${lectureTopics[i % lectureTopics.length]}`,
        description: faker.lorem.sentence(),
        fileUrl: video.url,
        duration: video.duration,
        isPreview: i === 0,
        orderIndex: i,
        chapterId,
        createdBy,
        requiresQuiz,
      };
    });
  }
}

// ============================================
// QUIZ GENERATOR
// ============================================

export class QuizTestDataGenerator {
  static generateQuizForLecture(
    lectureId: string,
    creatorId: string,
    lectureName: string,
    tech: string,
    questionCount: number = 3,
  ): {
    title: string;
    description: string;
    entityId: string;
    creatorId: string;
    isPublic: boolean;
    isFree: boolean;
    price: number;
    timeLimit: number;
    passingScore: number;
    questions: Array<{
      questionText: string;
      points: number;
      orderIndex: number;
      answerOptions: Array<{
        optionText: string;
        isCorrect: boolean;
        orderIndex: number;
      }>;
    }>;
  } {
    const concepts = getConcepts(tech);
    const questions = [];

    for (let i = 0; i < questionCount; i++) {
      const concept = concepts[i % concepts.length];
      const template = QUIZ_QUESTION_TEMPLATES[i % QUIZ_QUESTION_TEMPLATES.length];

      // Generate question text
      const questionText = template.template
        .replace('{tech}', tech)
        .replace('{concept}', concept)
        .replace('{action}', `sử dụng ${concept}`);

      // Generate answers with Vietnamese content
      const answers = [
        {
          optionText: `${concept} giúp quản lý và xử lý dữ liệu hiệu quả trong ${tech}`,
          isCorrect: true,
          orderIndex: 0,
        },
        {
          optionText: `${concept} chỉ dùng cho giao diện người dùng`,
          isCorrect: false,
          orderIndex: 1,
        },
        {
          optionText: `${concept} không liên quan đến ${tech}`,
          isCorrect: false,
          orderIndex: 2,
        },
        {
          optionText: `${concept} đã lỗi thời và không nên sử dụng`,
          isCorrect: false,
          orderIndex: 3,
        },
      ];

      // Shuffle answers
      const shuffledAnswers = faker.helpers.shuffle(answers);
      shuffledAnswers.forEach((a, idx) => (a.orderIndex = idx));

      questions.push({
        questionText,
        points: 1,
        orderIndex: i,
        answerOptions: shuffledAnswers,
      });
    }

    return {
      title: `Kiểm tra: ${lectureName.replace(/^Bài \d+:\s*/, '')}`,
      description: `Bài kiểm tra kiến thức về ${tech}. Trả lời đúng tất cả câu hỏi để hoàn thành bài học.`,
      entityId: lectureId,
      creatorId,
      isPublic: true,
      isFree: true,
      price: 0,
      timeLimit: Math.max(5, questionCount * 2),
      passingScore: 100,
      questions,
    };
  }

  // Legacy method
  static generateQuizzes(
    lectures: Array<{ id: string; name: string; requiresQuiz: boolean }>,
    creatorId: string,
    questionsPerQuiz: number = 3,
  ): Array<ReturnType<typeof QuizTestDataGenerator.generateQuizForLecture>> {
    return lectures
      .filter((l) => l.requiresQuiz)
      .map((lecture) =>
        this.generateQuizForLecture(lecture.id, creatorId, lecture.name, 'React', questionsPerQuiz),
      );
  }
}

// ============================================
// DOCUMENT GENERATOR
// ============================================

export type DocumentEntityType = 'course' | 'chapter' | 'lecture';

export interface GeneratedDocument {
  name: string;
  descriptions: string;
  notes?: string;
  fileUrl: string;
  entityId: string;
  entityType: DocumentEntityType;
  createdBy: string;
}

export class DocumentTestDataGenerator {
  /**
   * Generate documents for a course (course-level documents)
   */
  static generateCourseDocuments(
    courseId: string,
    createdBy: string,
    courseName: string,
  ): GeneratedDocument[] {
    // Always create all 3 course documents
    return SAMPLE_DOCUMENTS.courseDocuments.map((doc) => ({
      name: doc.name,
      descriptions: `${doc.descriptions} - ${courseName}`,
      notes: `Tài liệu cho khóa học: ${courseName}`,
      fileUrl: doc.fileUrl,
      entityId: courseId,
      entityType: 'course' as DocumentEntityType,
      createdBy,
    }));
  }

  /**
   * Generate documents for a chapter
   */
  static generateChapterDocuments(
    chapterId: string,
    createdBy: string,
    chapterName: string,
  ): GeneratedDocument[] {
    // 50% chance to have documents for each chapter
    if (faker.datatype.boolean({ probability: 0.5 })) {
      // Random 1-2 documents per chapter
      const count = faker.number.int({ min: 1, max: 2 });
      const templates = faker.helpers.arrayElements(SAMPLE_DOCUMENTS.chapterDocuments, count);

      return templates.map((template) => ({
        name: template.nameTemplate.replace(
          '{chapter}',
          chapterName.replace(/^Chương \d+:\s*/, ''),
        ),
        descriptions: template.descriptions,
        fileUrl: 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf',
        entityId: chapterId,
        entityType: 'chapter' as DocumentEntityType,
        createdBy,
      }));
    }
    return [];
  }

  /**
   * Generate documents for a lecture
   */
  static generateLectureDocuments(
    lectureId: string,
    createdBy: string,
    lectureName: string,
    lectureType: LectureType,
  ): GeneratedDocument[] {
    // Quiz lectures don't have documents
    if (lectureType === 'quiz') {
      return [];
    }

    // 40% chance to have documents for each lecture
    if (faker.datatype.boolean({ probability: 0.4 })) {
      // Random 1-2 documents per lecture
      const count = faker.number.int({ min: 1, max: 2 });
      const templates = faker.helpers.arrayElements(SAMPLE_DOCUMENTS.lectureDocuments, count);

      return templates.map((template) => ({
        name: template.nameTemplate.replace('{lecture}', lectureName.replace(/^Bài \d+:\s*/, '')),
        descriptions: template.descriptions,
        fileUrl: 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf',
        entityId: lectureId,
        entityType: 'lecture' as DocumentEntityType,
        createdBy,
      }));
    }
    return [];
  }
}

// ============================================
// FULL COURSE GENERATOR (Udemy-style)
// ============================================

export interface GeneratedCourseData {
  course: ReturnType<typeof CourseTestDataGenerator.generateVietnameseCourse>;
  chapters: ReturnType<typeof ChapterTestDataGenerator.generateChaptersForCourse>;
  lectures: ReturnType<typeof LectureTestDataGenerator.generateLecturesForChapter>[];
  quizzes: ReturnType<typeof QuizTestDataGenerator.generateQuizForLecture>[];
  documents: {
    course: GeneratedDocument[];
    chapters: GeneratedDocument[][];
    lectures: GeneratedDocument[][];
  };
}

export class FullCourseGenerator {
  /**
   * Generate a complete Udemy-style course with chapters, lectures, quizzes, and documents
   */
  static generateFullCourse(categoryIds: string[], createdBy: string): GeneratedCourseData {
    // 1. Generate course
    const course = CourseTestDataGenerator.generateVietnameseCourse(categoryIds, createdBy);

    // Extract tech from course name
    const techMatch = course.name.match(/với\s+(\w+(?:\.\w+)?)/);
    const tech = techMatch ? techMatch[1] : 'React';

    // 2. Generate chapters
    const chapters = ChapterTestDataGenerator.generateChaptersForCourse(
      '', // Will be set after course is saved
      createdBy,
      course.name,
    );

    // 3. Generate lectures for each chapter
    const allLectures: ReturnType<typeof LectureTestDataGenerator.generateLecturesForChapter>[] =
      [];
    chapters.forEach((chapter, chapterIndex) => {
      const lectures = LectureTestDataGenerator.generateLecturesForChapter(
        '', // Will be set after chapter is saved
        createdBy,
        chapterIndex,
        chapter._lectureTypes,
        tech,
      );
      allLectures.push(lectures);
    });

    // 4. Generate quizzes for lectures that require them
    const quizzes: ReturnType<typeof QuizTestDataGenerator.generateQuizForLecture>[] = [];
    allLectures.forEach((chapterLectures) => {
      chapterLectures.forEach((lecture) => {
        if (lecture.requiresQuiz) {
          const quiz = QuizTestDataGenerator.generateQuizForLecture(
            '', // Will be set after lecture is saved
            createdBy,
            lecture.name,
            tech,
            lecture._type === 'quiz' && lecture.name.includes('cuối') ? 5 : 3, // Final quiz has 5 questions
          );
          quizzes.push(quiz);
        }
      });
    });

    // 5. Generate documents
    // Course documents (will be set after course is saved)
    const courseDocuments = DocumentTestDataGenerator.generateCourseDocuments(
      '',
      createdBy,
      course.name,
    );

    // Chapter documents (will be set after chapters are saved)
    const chapterDocuments: GeneratedDocument[][] = chapters.map((chapter) =>
      DocumentTestDataGenerator.generateChapterDocuments('', createdBy, chapter.name),
    );

    // Lecture documents (will be set after lectures are saved)
    const lectureDocuments: GeneratedDocument[][] = [];
    allLectures.forEach((chapterLectures) => {
      chapterLectures.forEach((lecture) => {
        const docs = DocumentTestDataGenerator.generateLectureDocuments(
          '',
          createdBy,
          lecture.name,
          lecture._type,
        );
        lectureDocuments.push(docs);
      });
    });

    return {
      course,
      chapters,
      lectures: allLectures,
      quizzes,
      documents: {
        course: courseDocuments,
        chapters: chapterDocuments,
        lectures: lectureDocuments,
      },
    };
  }

  /**
   * Get statistics about generated course
   */
  static getCourseStats(data: GeneratedCourseData): {
    totalChapters: number;
    totalLectures: number;
    totalQuizzes: number;
    totalQuestions: number;
    totalDocuments: number;
    lecturesWithQuiz: number;
    lecturesWithoutQuiz: number;
    estimatedDuration: string;
  } {
    const totalLectures = data.lectures.reduce((sum, ch) => sum + ch.length, 0);
    const lecturesWithQuiz = data.lectures.reduce(
      (sum, ch) => sum + ch.filter((l) => l.requiresQuiz).length,
      0,
    );
    const totalQuestions = data.quizzes.reduce((sum, q) => sum + q.questions.length, 0);
    const totalDuration = data.lectures.reduce(
      (sum, ch) => sum + ch.reduce((s, l) => s + l.duration, 0),
      0,
    );

    // Count documents
    const totalDocuments =
      data.documents.course.length +
      data.documents.chapters.reduce((sum, docs) => sum + docs.length, 0) +
      data.documents.lectures.reduce((sum, docs) => sum + docs.length, 0);

    const hours = Math.floor(totalDuration / 3600);
    const minutes = Math.floor((totalDuration % 3600) / 60);

    return {
      totalChapters: data.chapters.length,
      totalLectures,
      totalQuizzes: data.quizzes.length,
      totalQuestions,
      totalDocuments,
      lecturesWithQuiz,
      lecturesWithoutQuiz: totalLectures - lecturesWithQuiz,
      estimatedDuration: `${hours}h ${minutes}m`,
    };
  }
}
