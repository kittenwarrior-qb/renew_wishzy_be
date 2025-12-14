import { DataSource } from 'typeorm';
import { Chapter } from '../../app/entities/chapter.entity';
import { Lecture } from '../../app/entities/lecture.entity';

// Sample MP4 video URLs that are publicly available for testing
const SAMPLE_VIDEO_URLS = [
  'https://www.w3schools.com/html/mov_bbb.mp4', // Big Buck Bunny clip
  'https://www.w3schools.com/html/movie.mp4', // Simple test video
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', // Big Buck Bunny full
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', // Elephants Dream
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', // For Bigger Blazes
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4', // For Bigger Escapes
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', // For Bigger Fun
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4', // For Bigger Joyrides
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4', // For Bigger Meltdowns
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4', // Sintel
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4', // Subaru Outback
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4', // Tears of Steel
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4', // VW GTI Review
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4', // We Are Going On Bullrun
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4', // What Car Can You Get
];

// Chapter templates for different course types
const chapterTemplates = {
  webDevelopment: [
    {
      name: 'Giới thiệu và Chuẩn bị môi trường',
      description: 'Tổng quan khóa học, cài đặt công cụ và setup môi trường phát triển',
      lectures: [
        { name: 'Giới thiệu khóa học', description: 'Tổng quan về nội dung và mục tiêu khóa học', duration: 300, isPreview: true },
        { name: 'Cài đặt IDE và Extensions', description: 'Hướng dẫn cài đặt Visual Studio Code và các extensions cần thiết', duration: 600, isPreview: false },
        { name: 'Cấu hình Git và GitHub', description: 'Setting up version control cho dự án', duration: 480, isPreview: false },
      ],
    },
    {
      name: 'Kiến thức nền tảng',
      description: 'Các khái niệm cơ bản và lý thuyết nền tảng',
      lectures: [
        { name: 'Các khái niệm cốt lõi', description: 'Tìm hiểu các thuật ngữ và concepts quan trọng', duration: 720, isPreview: true },
        { name: 'Cấu trúc project', description: 'Hiểu về cách tổ chức code và folder structure', duration: 540, isPreview: false },
        { name: 'Best practices', description: 'Các quy tắc và cách làm tốt nhất', duration: 660, isPreview: false },
        { name: 'Debug và troubleshooting', description: 'Kỹ năng tìm và sửa lỗi', duration: 480, isPreview: false },
      ],
    },
    {
      name: 'Thực hành cơ bản',
      description: 'Bắt tay vào code với các ví dụ đơn giản',
      lectures: [
        { name: 'Tạo project đầu tiên', description: 'Khởi tạo project và cấu trúc cơ bản', duration: 900, isPreview: false },
        { name: 'Viết code component/module đầu tiên', description: 'Thực hành coding với ví dụ cụ thể', duration: 1200, isPreview: false },
        { name: 'Styling và UI cơ bản', description: 'Tạo giao diện người dùng đẹp mắt', duration: 840, isPreview: false },
      ],
    },
    {
      name: 'Chức năng nâng cao',
      description: 'Triển khai các tính năng phức tạp hơn',
      lectures: [
        { name: 'State Management', description: 'Quản lý trạng thái ứng dụng', duration: 1080, isPreview: false },
        { name: 'API Integration', description: 'Kết nối với backend và xử lý dữ liệu', duration: 960, isPreview: false },
        { name: 'Authentication & Authorization', description: 'Xác thực và phân quyền người dùng', duration: 1140, isPreview: false },
        { name: 'Performance Optimization', description: 'Tối ưu hóa hiệu suất ứng dụng', duration: 720, isPreview: false },
      ],
    },
    {
      name: 'Dự án thực chiến',
      description: 'Xây dựng dự án hoàn chỉnh từ đầu đến cuối',
      lectures: [
        { name: 'Planning và Design', description: 'Lên kế hoạch và thiết kế dự án', duration: 600, isPreview: false },
        { name: 'Implementation - Phần 1', description: 'Triển khai các chức năng chính', duration: 1800, isPreview: false },
        { name: 'Implementation - Phần 2', description: 'Hoàn thiện UI/UX và tính năng phụ', duration: 1500, isPreview: false },
        { name: 'Testing và Deploy', description: 'Kiểm thử và triển khai sản phẩm', duration: 900, isPreview: false },
      ],
    },
  ],
  database: [
    {
      name: 'Cơ bản về Database',
      description: 'Giới thiệu các khái niệm database cơ bản',
      lectures: [
        { name: 'Database là gì?', description: 'Tổng quan về hệ quản trị cơ sở dữ liệu', duration: 420, isPreview: true },
        { name: 'Cài đặt và cấu hình', description: 'Setup database server', duration: 600, isPreview: false },
        { name: 'SQL cơ bản', description: 'Các câu lệnh SQL cơ bản', duration: 840, isPreview: false },
      ],
    },
    {
      name: 'CRUD Operations',
      description: 'Thao tác Create, Read, Update, Delete',
      lectures: [
        { name: 'INSERT - Thêm dữ liệu', description: 'Cách thêm records vào database', duration: 540, isPreview: false },
        { name: 'SELECT - Truy vấn dữ liệu', description: 'Cách query và filter dữ liệu', duration: 720, isPreview: true },
        { name: 'UPDATE - Cập nhật dữ liệu', description: 'Cách sửa đổi records', duration: 480, isPreview: false },
        { name: 'DELETE - Xóa dữ liệu', description: 'Cách xóa records an toàn', duration: 420, isPreview: false },
      ],
    },
    {
      name: 'Joins và Relationships',
      description: 'Liên kết các bảng dữ liệu',
      lectures: [
        { name: 'INNER JOIN', description: 'Kết hợp dữ liệu từ nhiều bảng', duration: 660, isPreview: false },
        { name: 'LEFT/RIGHT JOIN', description: 'Outer joins và use cases', duration: 600, isPreview: false },
        { name: 'Subqueries', description: 'Truy vấn lồng nhau', duration: 720, isPreview: false },
      ],
    },
    {
      name: 'Indexing và Performance',
      description: 'Tối ưu hóa database',
      lectures: [
        { name: 'Index là gì?', description: 'Hiểu về indexes và cách hoạt động', duration: 540, isPreview: false },
        { name: 'Query Optimization', description: 'Tối ưu hóa câu truy vấn', duration: 780, isPreview: false },
        { name: 'EXPLAIN và Profiling', description: 'Phân tích performance', duration: 600, isPreview: false },
      ],
    },
  ],
  design: [
    {
      name: 'Design Fundamentals',
      description: 'Nguyên tắc thiết kế cơ bản',
      lectures: [
        { name: 'Color Theory', description: 'Lý thuyết màu sắc và cách phối màu', duration: 600, isPreview: true },
        { name: 'Typography', description: 'Nghệ thuật sử dụng font chữ', duration: 540, isPreview: false },
        { name: 'Layout và Composition', description: 'Bố cục và cân bằng thị giác', duration: 660, isPreview: false },
      ],
    },
    {
      name: 'UI/UX Basics',
      description: 'Cơ bản về trải nghiệm người dùng',
      lectures: [
        { name: 'User Research', description: 'Nghiên cứu và hiểu người dùng', duration: 720, isPreview: false },
        { name: 'Wireframing', description: 'Tạo khung giao diện sơ bộ', duration: 840, isPreview: true },
        { name: 'Prototyping', description: 'Tạo prototype tương tác', duration: 780, isPreview: false },
      ],
    },
    {
      name: 'Design Tools',
      description: 'Sử dụng công cụ thiết kế',
      lectures: [
        { name: 'Làm quen với giao diện', description: 'Tổng quan về các phần của phần mềm', duration: 480, isPreview: false },
        { name: 'Tạo shapes và vectors', description: 'Vẽ và chỉnh sửa hình dạng', duration: 600, isPreview: false },
        { name: 'Components và Assets', description: 'Tái sử dụng thiết kế hiệu quả', duration: 720, isPreview: false },
        { name: 'Export và Handoff', description: 'Xuất file và chuyển giao cho developers', duration: 540, isPreview: false },
      ],
    },
  ],
  general: [
    {
      name: 'Chương 1: Tổng quan',
      description: 'Giới thiệu và mục tiêu khóa học',
      lectures: [
        { name: 'Bài 1: Giới thiệu', description: 'Tổng quan về chủ đề', duration: 480, isPreview: true },
        { name: 'Bài 2: Lịch sử và phát triển', description: 'Nguồn gốc và sự phát triển', duration: 540, isPreview: false },
        { name: 'Bài 3: Ứng dụng thực tế', description: 'Các ứng dụng trong đời sống', duration: 600, isPreview: false },
      ],
    },
    {
      name: 'Chương 2: Kiến thức cơ bản',
      description: 'Nền tảng và khái niệm cơ bản',
      lectures: [
        { name: 'Bài 1: Khái niệm cốt lõi', description: 'Các thuật ngữ quan trọng', duration: 660, isPreview: false },
        { name: 'Bài 2: Nguyên tắc hoạt động', description: 'Cách mọi thứ vận hành', duration: 720, isPreview: true },
        { name: 'Bài 3: Các phương pháp tiếp cận', description: 'Cách tiếp cận khác nhau', duration: 540, isPreview: false },
      ],
    },
    {
      name: 'Chương 3: Thực hành',
      description: 'Áp dụng kiến thức vào thực tế',
      lectures: [
        { name: 'Bài 1: Bài tập thực hành 1', description: 'Thực hành với ví dụ đơn giản', duration: 900, isPreview: false },
        { name: 'Bài 2: Bài tập thực hành 2', description: 'Bài tập nâng cao', duration: 1080, isPreview: false },
        { name: 'Bài 3: Case study', description: 'Phân tích tình huống thực tế', duration: 840, isPreview: false },
      ],
    },
    {
      name: 'Chương 4: Nâng cao và mở rộng',
      description: 'Kiến thức nâng cao cho người muốn đi sâu',
      lectures: [
        { name: 'Bài 1: Kỹ thuật nâng cao', description: 'Các kỹ thuật chuyên sâu', duration: 780, isPreview: false },
        { name: 'Bài 2: Tips và tricks', description: 'Mẹo hay từ chuyên gia', duration: 600, isPreview: false },
        { name: 'Bài 3: Tổng kết và tiếp theo', description: 'Ôn tập và định hướng học tiếp', duration: 480, isPreview: false },
      ],
    },
  ],
};

// Helper function to get a random video URL
function getRandomVideoUrl(): string {
  return SAMPLE_VIDEO_URLS[Math.floor(Math.random() * SAMPLE_VIDEO_URLS.length)];
}

// Helper function to get chapter template based on course name
function getChapterTemplateForCourse(courseName: string): typeof chapterTemplates.general {
  const name = courseName.toLowerCase();
  
  if (name.includes('react') || name.includes('node') || name.includes('javascript') || 
      name.includes('typescript') || name.includes('vue') || name.includes('next') || 
      name.includes('html') || name.includes('css') || name.includes('tailwind')) {
    return chapterTemplates.webDevelopment;
  }
  
  if (name.includes('postgresql') || name.includes('mongodb') || name.includes('database') || 
      name.includes('redis') || name.includes('graphql')) {
    return chapterTemplates.database;
  }
  
  if (name.includes('figma') || name.includes('photoshop') || name.includes('ui') || 
      name.includes('ux') || name.includes('design')) {
    return chapterTemplates.design;
  }
  
  return chapterTemplates.general;
}

export async function seedChaptersAndLectures(dataSource: DataSource) {
  const chapterRepository = dataSource.getRepository(Chapter);
  const lectureRepository = dataSource.getRepository(Lecture);

  // Check if chapters already exist
  const existingChapterCount = await chapterRepository.count();
  if (existingChapterCount > 0) {
    console.log('⏭️  Seed chapters already exist, skipping...');
    return;
  }

  // Check if lectures already exist
  const existingLectureCount = await lectureRepository.count();
  if (existingLectureCount > 0) {
    console.log('⏭️  Seed lectures already exist, skipping...');
    return;
  }

  // Get all courses
  const courses = await dataSource.query('SELECT id, name, created_by FROM courses');
  
  if (courses.length === 0) {
    console.log('⚠️  No courses found. Please seed courses first.');
    return;
  }

  console.log(`📚 Creating chapters and lectures for ${courses.length} courses...`);

  let totalChapters = 0;
  let totalLectures = 0;

  for (const course of courses) {
    const template = getChapterTemplateForCourse(course.name);
    
    for (let i = 0; i < template.length; i++) {
      const chapterTemplate = template[i];
      
      // Calculate chapter duration from lectures
      const chapterDuration = chapterTemplate.lectures.reduce((sum, lec) => sum + lec.duration, 0);
      
      // Create chapter
      const chapter: Partial<Chapter> = {
        name: chapterTemplate.name,
        description: chapterTemplate.description,
        duration: chapterDuration,
        orderIndex: i + 1,
        courseId: course.id,
        createdBy: course.created_by,
      };

      const chapterResult = await chapterRepository
        .createQueryBuilder()
        .insert()
        .into(Chapter)
        .values(chapter as any)
        .returning('id')
        .execute();

      const chapterId = chapterResult.generatedMaps[0].id;
      totalChapters++;

      // Create lectures for this chapter
      const lectures: Partial<Lecture>[] = chapterTemplate.lectures.map((lecTemplate, lectureIndex) => ({
        name: lecTemplate.name,
        description: lecTemplate.description,
        fileUrl: getRandomVideoUrl(),
        videoSources: {
          '720p': getRandomVideoUrl(),
          '480p': getRandomVideoUrl(),
        },
        duration: lecTemplate.duration,
        isPreview: lecTemplate.isPreview,
        orderIndex: lectureIndex + 1,
        chapterId: chapterId,
        createdBy: course.created_by,
      }));

      await lectureRepository
        .createQueryBuilder()
        .insert()
        .into(Lecture)
        .values(lectures as any)
        .execute();

      totalLectures += lectures.length;
    }
  }

  console.log(`✅ Successfully seeded ${totalChapters} chapters and ${totalLectures} lectures!`);
}
