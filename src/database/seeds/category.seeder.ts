import { DataSource } from 'typeorm';
import { Category } from '../../app/entities/category.entity';

export async function seedCategories(dataSource: DataSource) {
  const categoryRepository = dataSource.getRepository(Category);

  // Check if categories already exist
  const existingCount = await categoryRepository.count();
  if (existingCount > 0) {
    console.log('⏭️  Seed categories already exist, skipping...');
    return;
  }

  const categories = [
    // Technology & Programming
    {
      name: 'Lập trình Web',
      notes: 'Học lập trình web từ cơ bản đến nâng cao',
      parentId: null,
    },
    {
      name: 'Lập trình Mobile',
      notes: 'Phát triển ứng dụng di động đa nền tảng',
      parentId: null,
    },
    {
      name: 'Cơ sở dữ liệu',
      notes: 'SQL, NoSQL và quản lý dữ liệu',
      parentId: null,
    },
    {
      name: 'DevOps & Cloud',
      notes: 'Triển khai và quản lý hạ tầng',
      parentId: null,
    },
    {
      name: 'AI & Machine Learning',
      notes: 'Trí tuệ nhân tạo và học máy',
      parentId: null,
    },
    
    // Design & Creativity
    {
      name: 'Thiết kế UI/UX',
      notes: 'Thiết kế giao diện và trải nghiệm người dùng',
      parentId: null,
    },
    {
      name: 'Thiết kế đồ họa',
      notes: 'Photoshop, Illustrator và các công cụ thiết kế',
      parentId: null,
    },
    {
      name: 'Dựng phim & Video',
      notes: 'Chỉnh sửa video và hiệu ứng đặc biệt',
      parentId: null,
    },
    
    // Business & Marketing
    {
      name: 'Marketing Digital',
      notes: 'SEO, SEM, Social Media Marketing',
      parentId: null,
    },
    {
      name: 'Kinh doanh & Khởi nghiệp',
      notes: 'Quản trị kinh doanh và khởi nghiệp',
      parentId: null,
    },
    {
      name: 'Tài chính & Đầu tư',
      notes: 'Quản lý tài chính cá nhân và đầu tư',
      parentId: null,
    },
    
    // Personal Development
    {
      name: 'Kỹ năng mềm',
      notes: 'Giao tiếp, lãnh đạo, làm việc nhóm',
      parentId: null,
    },
    {
      name: 'Ngoại ngữ',
      notes: 'Học tiếng Anh và các ngôn ngữ khác',
      parentId: null,
    },
    {
      name: 'Sức khỏe & Thể hình',
      notes: 'Yoga, Fitness, Dinh dưỡng',
      parentId: null,
    },
    
    // Others
    {
      name: 'Nhiếp ảnh',
      notes: 'Kỹ thuật chụp ảnh và chỉnh sửa',
      parentId: null,
    },
    {
      name: 'Âm nhạc',
      notes: 'Học nhạc cụ và sáng tác',
      parentId: null,
    },
    {
      name: 'Nấu ăn & Ẩm thực',
      notes: 'Các món ăn Việt Nam và quốc tế',
      parentId: null,
    },
    {
      name: 'Handmade & Thủ công',
      notes: 'Làm đồ handmade, thêu, đan len',
      parentId: null,
    },
  ];

  const savedCategories = await categoryRepository.save(categories);
  console.log(`✅ Successfully seeded ${savedCategories.length} categories!`);
  
  return savedCategories;
}
