import { DataSource } from 'typeorm';
import { Banner } from '../../app/entities/banner.entity';

export async function seedBanners(dataSource: DataSource) {
  const bannerRepository = dataSource.getRepository(Banner);

  // Check if banners already exist
  const existingCount = await bannerRepository.count();
  if (existingCount > 0) {
    console.log('⏭️  Seed banners already exist, skipping...');
    return;
  }

  const banners = [
    {
      title: 'Khóa học React Native - Giảm giá 35%',
      imageUrl: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=1200&h=400&fit=crop&q=80',
      link: '/courses/react-native',
      position: 1,
    },
    {
      title: 'Học Next.js 14 - Sale 40% chỉ hôm nay!',
      imageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&h=400&fit=crop&q=80',
      link: '/courses/nextjs',
      position: 2,
    },
    {
      title: 'AI & Machine Learning - Khóa hot nhất 2024',
      imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&h=400&fit=crop&q=80',
      link: '/courses/deep-learning',
      position: 3,
    },
    {
      title: 'Docker & Kubernetes cho Developer',
      imageUrl: 'https://images.unsplash.com/photo-1605745341112-85968b19335b?w=1200&h=400&fit=crop&q=80',
      link: '/courses/docker-kubernetes',
      position: 4,
    },
    {
      title: 'Figma UI/UX Design - Bắt đầu career mới!',
      imageUrl: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=1200&h=400&fit=crop&q=80',
      link: '/courses/figma-uiux',
      position: 5,
    },
    {
      title: 'Học lập trình Web miễn phí',
      imageUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&h=400&fit=crop&q=80',
      link: '/courses/free-intro',
      position: 6,
    },
    {
      title: 'Khuyến mãi Black Friday - Giảm đến 50%',
      imageUrl: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&h=400&fit=crop&q=80',
      link: '/promotions/black-friday',
      position: 7,
    },
  ];

  await bannerRepository.save(banners);
  console.log(`✅ Successfully seeded ${banners.length} banners!`);
}
