import { faker } from '@faker-js/faker';
import { CreateCategoryDto } from './dto/create-category.dto';

export class CategoryTestDataGenerator {
  static generateCategory(parentId?: string): CreateCategoryDto {
    const categoryNames = [
      'Lập trình Web',
      'Lập trình Mobile',
      'Data Science',
      'Machine Learning',
      'Cloud Computing',
      'DevOps',
      'Cybersecurity',
      'Blockchain',
      'Game Development',
      'UI/UX Design',
      'Backend Development',
      'Frontend Development',
      'Full Stack',
      'Database',
      'API Development',
      'Microservices',
      'Testing & QA',
      'Agile & Scrum',
      'Software Architecture',
      'System Design',
      'Artificial Intelligence',
      'Internet of Things',
      'Mobile Apps',
      'Web Apps',
      'Desktop Apps',
      'Networking',
      'Operating Systems',
      'Programming Languages',
      'Frameworks',
      'Tools & Technologies',
    ];

    const name = faker.helpers.arrayElement(categoryNames);

    return {
      name: parentId ? `${name} - ${faker.lorem.words(2)}` : name,
      notes: faker.lorem.sentence(),
      parentId,
    };
  }

  static generateCategories(quantity: number, parentId?: string): CreateCategoryDto[] {
    const categories: CreateCategoryDto[] = [];

    for (let i = 0; i < quantity; i++) {
      categories.push(this.generateCategory(parentId));
    }

    return categories;
  }
}
