import { DataSource } from 'typeorm';
import { Wishlist } from '../../app/entities/wishlist.entity';

export async function seedWishlists(dataSource: DataSource) {
  const wishlistRepository = dataSource.getRepository(Wishlist);

  // Check if wishlists already exist
  const existingCount = await wishlistRepository.count();
  if (existingCount > 0) {
    console.log('⏭️  Seed wishlists already exist, skipping...');
    return;
  }

  // Get users and courses
  const users = await dataSource.query("SELECT id FROM users WHERE role = 'user'");
  const courses = await dataSource.query('SELECT id FROM courses');

  if (users.length === 0 || courses.length === 0) {
    console.log('⚠️  Users or courses not found. Please seed them first.');
    return;
  }

  const wishlists: any[] = [];

  // Create wishlist for each user
  for (const user of users) {
    // Each user has 2-8 courses in their wishlist
    const wishlistSize = Math.floor(Math.random() * 7) + 2;
    const wishlistedCourses: string[] = [];

    // Randomly select courses
    const shuffled = [...courses].sort(() => 0.5 - Math.random());
    for (let i = 0; i < Math.min(wishlistSize, courses.length); i++) {
      wishlistedCourses.push(shuffled[i].id);
    }

    wishlists.push({
      userId: user.id,
      courses: wishlistedCourses, // JSONB array of course IDs
    });
  }

  await wishlistRepository.save(wishlists);
  console.log(`✅ Successfully seeded ${wishlists.length} wishlists!`);
}
