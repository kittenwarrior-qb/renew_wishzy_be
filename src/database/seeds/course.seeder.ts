import { DataSource } from 'typeorm';
import { Course } from '../../app/entities/course.entity';
import { CourseLevel, SaleType } from '../../app/entities/enums/course.enum';

export async function seedCourses(dataSource: DataSource) {
  const courseRepository = dataSource.getRepository(Course);

  // Check if courses already exist
  const existingCount = await courseRepository.count();
  if (existingCount > 0) {
    console.log('⏭️  Seed courses already exist, skipping...');
    return;
  }

  // Get categories and instructors dynamically
  const categories = await dataSource.query('SELECT id, name FROM categories LIMIT 18');
  const instructors = await dataSource.query(
    "SELECT id FROM users WHERE role = 'instructor' AND is_instructor_active = true",
  );

  if (categories.length === 0 || instructors.length === 0) {
    console.log('⚠️  Categories or instructors not found. Please seed them first.');
    return;
  }

  // Helper function to get random category
  const getRandomCategory = () => categories[Math.floor(Math.random() * categories.length)].id;
  
  // Helper function to get random instructor
  const getRandomInstructor = () => instructors[Math.floor(Math.random() * instructors.length)].id;

  const courses = [
    // Web Development Courses
    {
      name: 'Lập trình ReactJS từ cơ bản đến nâng cao 2024',
      description:
        'Khóa học ReactJS toàn diện nhất, từ JSX, Components, Hooks đến Redux Toolkit, React Query và React Router. Bao gồm 5+ dự án thực chiến giúp bạn làm chủ React và sẵn sàng cho công việc. Học cách xây dựng ứng dụng Single Page Application (SPA) hiện đại, tối ưu hiệu suất và triển khai lên production.',
      notes: 'Yêu cầu: Biết HTML, CSS, JavaScript ES6+',
      thumbnail:
        'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80',
      price: 599000,
      saleInfo: {
        saleType: SaleType.PERCENT,
        value: 30,
        saleStartDate: new Date('2024-11-01'),
        saleEndDate: new Date('2025-01-31'),
      },
      rating: 0,
      status: true,
      averageRating: 0,
      numberOfStudents: 0,
      level: CourseLevel.INTERMEDIATE,
      totalDuration: 36000, // 10 hours in seconds
      categoryId: getRandomCategory(),
      createdBy: getRandomInstructor(),
    },
    {
      name: 'Node.js & NestJS - Xây dựng RESTful API chuyên nghiệp',
      description:
        'Học cách xây dựng backend mạnh mẽ và scalable với Node.js và NestJS framework. Khóa học bao gồm TypeORM, PostgreSQL, JWT Authentication, Role-based Access Control, API Documentation với Swagger, Unit Testing, E2E Testing và Deploy lên AWS/Heroku. Xây dựng hoàn chỉnh một Learning Management System từ đầu đến cuối.',
      notes: 'Yêu cầu: JavaScript ES6+, TypeScript cơ bản, biết SQL',
      thumbnail:
        'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=800&q=80',
      price: 799000,
      saleInfo: {
        saleType: SaleType.PERCENT,
        value: 25,
        saleStartDate: new Date('2024-11-01'),
        saleEndDate: new Date('2025-01-31'),
      },
      rating: 0,
      status: true,
      averageRating: 0,
      numberOfStudents: 0,
      level: CourseLevel.ADVANCED,
      totalDuration: 48000, // 13.3 hours
      categoryId: getRandomCategory(),
      createdBy: getRandomInstructor(),
    },
    {
      name: 'HTML CSS từ Zero đến Hero - Responsive Website',
      description:
        'Khóa học HTML CSS hoàn chỉnh cho người mới bắt đầu. Học cách tạo website responsive với Flexbox, CSS Grid, Animations, Transitions. Thực hành xây dựng 3 landing page đẹp mắt theo xu hướng hiện đại. Tìm hiểu về SASS/SCSS, BEM methodology và các best practices trong CSS.',
      notes: 'Không yêu cầu kiến thức nền, phù hợp người mới bắt đầu',
      thumbnail:
        'https://images.unsplash.com/photo-1507721999472-8ed4421c4af2?w=800&q=80',
      price: 299000,
      rating: 0,
      status: true,
      averageRating: 0,
      numberOfStudents: 0,
      level: CourseLevel.BEGINNER,
      totalDuration: 21600, // 6 hours
      categoryId: getRandomCategory(),
      createdBy: getRandomInstructor(),
    },
    {
      name: 'JavaScript ES6+ & TypeScript Masterclass',
      description:
        'Làm chủ JavaScript hiện đại và TypeScript từ A đến Z. Arrow functions, Destructuring, Spread/Rest operators, Promises, Async/Await, ES Modules, và tất cả tính năng ES6+. TypeScript với Interfaces, Generics, Decorators, và tích hợp vào dự án thực tế. Học cách viết code clean, maintainable và type-safe.',
      notes: 'Yêu cầu: Biết JavaScript cơ bản',
      thumbnail:
        'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=800&q=80',
      price: 499000,
      saleInfo: {
        saleType: SaleType.PERCENT,
        value: 20,
        saleStartDate: new Date('2024-11-01'),
        saleEndDate: new Date('2025-01-31'),
      },
      rating: 0,
      status: true,
      averageRating: 0,
      numberOfStudents: 0,
      level: CourseLevel.INTERMEDIATE,
      totalDuration: 27000, // 7.5 hours
      categoryId: getRandomCategory(),
      createdBy: getRandomInstructor(),
    },
    {
      name: 'Vue.js 3 - The Complete Guide (Composition API)',
      description:
        'Học Vue.js 3 với Composition API, Pinia State Management, Vue Router và Vite build tool. Xây dựng SPA hiện đại với Vue. Khóa học bao gồm: Directives, Computed Properties, Watchers, Lifecycle Hooks, Custom Directives, Plugins, và tích hợp với TypeScript. 3 dự án thực chiến từ cơ bản đến nâng cao.',
      notes: 'Yêu cầu: HTML, CSS, JavaScript ES6+',
      thumbnail:
        'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80',
      price: 549000,
      rating: 0,
      status: true,
      averageRating: 0,
      numberOfStudents: 0,
      level: CourseLevel.INTERMEDIATE,
      totalDuration: 30600, // 8.5 hours
      categoryId: getRandomCategory(),
      createdBy: getRandomInstructor(),
    },
    {
      name: 'Next.js 14 - Full-stack React Framework',
      description:
        'App Router, Server Components, Server Actions, Streaming, caching strategies và deploy lên Vercel. Xây dựng production-ready applications với Next.js 14. Tích hợp với Database (Prisma/PostgreSQL), Authentication (NextAuth.js), File uploads, SEO optimization và nhiều hơn nữa. Xây dựng một E-commerce Platform hoàn chỉnh.',
      notes: 'Yêu cầu: Thành thạo React.js',
      thumbnail:
        'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80',
      price: 749000,
      saleInfo: {
        saleType: SaleType.PERCENT,
        value: 35,
        saleStartDate: new Date('2024-11-01'),
        saleEndDate: new Date('2025-01-31'),
      },
      rating: 0,
      status: true,
      averageRating: 0,
      numberOfStudents: 0,
      level: CourseLevel.ADVANCED,
      totalDuration: 43200, // 12 hours
      categoryId: getRandomCategory(),
      createdBy: getRandomInstructor(),
    },

    // Mobile Development
    {
      name: 'React Native - Xây dựng ứng dụng di động đa nền tảng',
      description:
        'Tạo ứng dụng iOS và Android với một code base duy nhất bằng React Native. React Navigation, State Management (Redux/Zustand), Native Modules, Camera/Gallery integration, Push Notifications, AsyncStorage, và Deploy lên App Store & Google Play. Xây dựng một Social Media App hoàn chỉnh với real-time features.',
      notes: 'Yêu cầu: Thành thạo React.js',
      thumbnail:
        'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&q=80',
      price: 899000,
      saleInfo: {
        saleType: SaleType.PERCENT,
        value: 35,
        saleStartDate: new Date('2024-11-01'),
        saleEndDate: new Date('2025-01-31'),
      },
      rating: 0,
      status: true,
      averageRating: 0,
      numberOfStudents: 0,
      level: CourseLevel.ADVANCED,
      totalDuration: 54000, // 15 hours
      categoryId: getRandomCategory(),
      createdBy: getRandomInstructor(),
    },
    {
      name: 'Flutter & Dart - Lập trình Mobile toàn diện',
      description:
        'Từ Dart programming language cơ bản đến Flutter framework nâng cao. Widgets, Layouts, State Management với Bloc/Provider/Riverpod, Firebase integration (Authentication, Firestore, Storage), Local Storage, REST API integration, Push Notifications, và Publishing apps. Xây dựng 4 ứng dụng thực tế: Todo App, Weather App, Chat App, và E-commerce App.',
      notes: 'Không yêu cầu kinh nghiệm mobile development',
      thumbnail:
        'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800&q=80',
      price: 699000,
      saleInfo: {
        saleType: SaleType.PERCENT,
        value: 30,
        saleStartDate: new Date('2024-11-01'),
        saleEndDate: new Date('2025-01-31'),
      },
      rating: 0,
      status: true,
      averageRating: 0,
      numberOfStudents: 0,
      level: CourseLevel.BEGINNER,
      totalDuration: 45000, // 12.5 hours
      categoryId: getRandomCategory(),
      createdBy: getRandomInstructor(),
    },

    // Database & Backend
    {
      name: 'PostgreSQL từ cơ bản đến nâng cao',
      description:
        'Làm chủ PostgreSQL - hệ quản trị cơ sở dữ liệu mạnh mẽ nhất. SQL queries, Joins, Subqueries, Views, Stored Procedures, Triggers, Transactions, ACID properties, Query optimization, Indexing strategies, Partitioning, Replication, Backup & Recovery, và Performance tuning. Tích hợp PostgreSQL với Node.js, Python và các ứng dụng thực tế.',
      notes: 'Yêu cầu: Biết SQL cơ bản',
      thumbnail:
        'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800&q=80',
      price: 449000,
      rating: 0,
      status: true,
      averageRating: 0,
      numberOfStudents: 0,
      level: CourseLevel.INTERMEDIATE,
      totalDuration: 28800, // 8 hours
      categoryId: getRandomCategory(),
      createdBy: getRandomInstructor(),
    },
    {
      name: 'MongoDB & Mongoose - NoSQL Database Mastery',
      description:
        'Học MongoDB từ đầu. Document model, CRUD operations, Aggregation framework, Indexes, Text search, Geospatial queries, Replication, Sharding, và Security best practices. Tích hợp MongoDB với Node.js thông qua Mongoose ODM. Schema design patterns, Validation, Middleware, Population, Virtual fields. Xây dựng REST API với Express và MongoDB.',
      notes: 'Yêu cầu: JavaScript cơ bản',
      thumbnail:
        'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80',
      price: 399000,
      saleInfo: {
        saleType: SaleType.PERCENT,
        value: 25,
        saleStartDate: new Date('2024-11-01'),
        saleEndDate: new Date('2025-01-31'),
      },
      rating: 0,
      status: true,
      averageRating: 0,
      numberOfStudents: 0,
      level: CourseLevel.INTERMEDIATE,
      totalDuration: 25200, // 7 hours
      categoryId: getRandomCategory(),
      createdBy: getRandomInstructor(),
    },
    {
      name: 'GraphQL APIs - Modern API Development',
      description:
        'Xây dựng GraphQL APIs với Apollo Server và Apollo Client. Schema design, Type system, Resolvers, Queries, Mutations, Subscriptions, DataLoader for batching, Authentication & Authorization, Error handling, Testing, và Performance optimization. So sánh GraphQL vs REST. Tích hợp GraphQL với React, Node.js, PostgreSQL/MongoDB. Xây dựng a realtime Dashboard với GraphQL subscriptions.',
      notes: 'Yêu cầu: Hiểu về REST API và JavaScript',
      thumbnail:
        'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80',
      price: 649000,
      rating: 0,
      status: true,
      averageRating: 0,
      numberOfStudents: 0,
      level: CourseLevel.ADVANCED,
      totalDuration: 32400, // 9 hours
      categoryId: getRandomCategory(),
      createdBy: getRandomInstructor(),
    },

    // DevOps & Cloud
    {
      name: 'Docker & Kubernetes cho Developer',
      description:
        'Container hóa ứng dụng với Docker và orchestration với Kubernetes. Docker images, Containers, Volumes, Networks, Docker Compose, Dockerfile best practices, Multi-stage builds. Kubernetes: Pods, Services, Deployments, ConfigMaps, Secrets, Ingress, Persistent Volumes, Monitoring, Logging. CI/CD pipelines với GitHub Actions, GitLab CI. Deploy microservices lên Kubernetes cluster.',
      notes: 'Yêu cầu: Biết Linux command line cơ bản',
      thumbnail:
        'https://images.unsplash.com/photo-1605745341112-85968b19335b?w=800&q=80',
      price: 799000,
      saleInfo: {
        saleType: SaleType.PERCENT,
        value: 40,
        saleStartDate: new Date('2024-11-01'),
        saleEndDate: new Date('2025-01-31'),
      },
      rating: 0,
      status: true,
      averageRating: 0,
      numberOfStudents: 0,
      level: CourseLevel.ADVANCED,
      totalDuration: 46800, // 13 hours
      categoryId: getRandomCategory(),
      createdBy: getRandomInstructor(),
    },
    {
      name: 'AWS Cloud Practitioner - Cloud Computing Essentials',
      description:
        'Học Amazon Web Services từ cơ bản đến thành thạo. EC2 (Virtual Servers), S3 (Object Storage), RDS (Managed Databases), Lambda (Serverless), API Gateway, CloudFront (CDN), Route 53 (DNS), VPC (Networking), IAM (Security), CloudWatch (Monitoring). Thiết kế kiến trúc cloud scalable, highly available, và cost-effective. Chuẩn bị cho AWS Certified Cloud Practitioner exam.',
      notes: 'Không yêu cầu kiến thức cloud trước đó',
      thumbnail:
        'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80',
      price: 599000,
      saleInfo: {
        saleType: SaleType.PERCENT,
        value: 30,
        saleStartDate: new Date('2024-11-01'),
        saleEndDate: new Date('2025-01-31'),
      },
      rating: 0,
      status: true,
      averageRating: 0,
      numberOfStudents: 0,
      level: CourseLevel.BEGINNER,
      totalDuration: 36000, // 10 hours
      categoryId: getRandomCategory(),
      createdBy: getRandomInstructor(),
    },
    {
      name: 'CI/CD Pipeline với Jenkins và GitHub Actions',
      description:
        'Tự động hóa quy trình develop, test và deploy với CI/CD. Jenkins setup, Pipeline as Code (Jenkinsfile), GitHub Actions workflows, Automated testing, Code quality checks (ESLint, SonarQube), Docker image building & pushing, Deploy to multiple environments (Dev/Staging/Production), Blue-Green deployment, Canary deployment, Rollback strategies. Monitoring và alerting.',
      notes: 'Yêu cầu: Git, Docker cơ bản',
      thumbnail:
        'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=800&q=80',
      price: 549000,
      rating: 0,
      status: true,
      averageRating: 0,
      numberOfStudents: 0,
      level: CourseLevel.INTERMEDIATE,
      totalDuration: 27000, // 7.5 hours
      categoryId: getRandomCategory(),
      createdBy: getRandomInstructor(),
    },

    // AI & Data Science
    {
      name: 'Python cho Data Science & Machine Learning',
      description:
        'Pandas cho data manipulation, NumPy cho numerical computing, Matplotlib & Seaborn cho data visualization, Scikit-learn cho Machine Learning, TensorFlow & Keras cho Deep Learning. Từ data cleaning, exploratory data analysis (EDA) đến building & evaluating ML models. Supervised Learning (Regression, Classification), Unsupervised Learning (Clustering, Dimensionality Reduction), Model selection & tuning. 5+ projects thực tế với real-world datasets.',
      notes: 'Yêu cầu: Python cơ bản, toán học cơ bản',
      thumbnail:
        'https://images.unsplash.com/photo-1527474305487-b87b222841cc?w=800&q=80',
      price: 999000,
      saleInfo: {
        saleType: SaleType.PERCENT,
        value: 35,
        saleStartDate: new Date('2024-11-01'),
        saleEndDate: new Date('2025-01-31'),
      },
      rating: 0,
      status: true,
      averageRating: 0,
      numberOfStudents: 0,
      level: CourseLevel.INTERMEDIATE,
      totalDuration: 64800, // 18 hours
      categoryId: getRandomCategory(),
      createdBy: getRandomInstructor(),
    },
    {
      name: 'Deep Learning với TensorFlow & Keras',
      description:
        'Neural Networks fundamentals, Forward & Backward propagation, Gradient descent optimization. CNN (Convolutional Neural Networks) cho Computer Vision, RNN/LSTM cho Sequential data, GAN (Generative Adversarial Networks), Transfer Learning, Transformers & Attention mechanism cho NLP. Build real applications: Image Classification, Object Detection, Sentiment Analysis, Chatbot, Image Generation. Deploy models với TensorFlow Serving.',
      notes: 'Yêu cầu: Python, Linear Algebra, Calculus cơ bản',
      thumbnail:
        'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80',
      price: 1299000,
      saleInfo: {
        saleType: SaleType.PERCENT,
        value: 40,
        saleStartDate: new Date('2024-11-01'),
        saleEndDate: new Date('2025-01-31'),
      },
      rating: 0,
      status: true,
      averageRating: 0,
      numberOfStudents: 0,
      level: CourseLevel.ADVANCED,
      totalDuration: 72000, // 20 hours
      categoryId: getRandomCategory(),
      createdBy: getRandomInstructor(),
    },

    // UI/UX & Design
    {
      name: 'Figma UI/UX Design - Từ ý tưởng đến sản phẩm',
      description:
        'Thiết kế giao diện chuyên nghiệp với Figma từ A-Z. User Research methods, Wireframing, Prototyping with interactions & animations, Design Systems, Component libraries, Auto Layout, Variants, Design tokens, Handoff to developers with proper specifications. Thiết kế Mobile App UI và Website UI theo best practices. Typography, Color theory, Visual hierarchy, Accessibility (WCAG). 3 case studies thực tế.',
      notes: 'Không yêu cầu kinh nghiệm, phù hợp người mới',
      thumbnail:
        'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80',
      price: 499000,
      rating: 0,
      status: true,
      averageRating: 0,
      numberOfStudents: 0,
      level: CourseLevel.BEGINNER,
      totalDuration: 28800, // 8 hours
      categoryId: getRandomCategory(),
      createdBy: getRandomInstructor(),
    },
    {
      name: 'TailwindCSS - Utility-First CSS Framework',
      description:
        'Làm chủ TailwindCSS để build UI nhanh chóng và maintainable. Utility classes, Responsive design, Dark mode, Pseudo-classes, Arbitrary values, Custom configurations, Plugins, Performance optimization with PurgeCSS. Build components library với TailwindCSS. Tích hợp với React, Vue, Next.js. So sánh với Bootstrap và Material-UI. Best practices và patterns.',
      notes: 'Yêu cầu: HTML, CSS cơ bản',
      thumbnail:
        'https://images.unsplash.com/photo-1523437113738-bbd3cc89fb19?w=800&q=80',
      price: 349000,
      saleInfo: {
        saleType: SaleType.PERCENT,
        value: 20,
        saleStartDate: new Date('2024-11-01'),
        saleEndDate: new Date('2025-01-31'),
      },
      rating: 0,
      status: true,
      averageRating: 0,
      numberOfStudents: 0,
      level: CourseLevel.BEGINNER,
      totalDuration: 18000, // 5 hours
      categoryId: getRandomCategory(),
      createdBy: getRandomInstructor(),
    },
    {
      name: 'Adobe Photoshop - Thiết kế đồ họa chuyên nghiệp',
      description:
        'Làm chủ Photoshop từ cơ bản đến nâng cao. Layers, Masks, Selections, Adjustments, Filters, Smart Objects, Blend modes. Photo editing & retouching, Color grading, Compositing, Digital painting. Thiết kế Social Media Graphics, Posters, Banners, UI mockups. Typography trong Photoshop. Actions và automation. Tips & tricks từ professionals.',
      notes: 'Không yêu cầu kinh nghiệm',
      thumbnail:
        'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800&q=80',
      price: 599000,
      rating: 0,
      status: true,
      averageRating: 0,
      numberOfStudents: 0,
      level: CourseLevel.BEGINNER,
      totalDuration: 34200, // 9.5 hours
      categoryId: getRandomCategory(),
      createdBy: getRandomInstructor(),
    },

    // Testing & Quality
    {
      name: 'Testing trong JavaScript - Jest, Testing Library & Cypress',
      description:
        'Unit testing với Jest, Integration testing với React Testing Library, E2E testing với Cypress. Test-Driven Development (TDD) approach, Mocking & Stubbing, Code coverage, Snapshot testing, Testing async code, Testing hooks, Testing context. CI integration, Test reports. Best practices để write maintainable tests. Testing principles: AAA pattern, FIRST principles, Test Pyramid.',
      notes: 'Yêu cầu: JavaScript, React cơ bản',
      thumbnail:
        'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&q=80',
      price: 549000,
      rating: 0,
      status: true,
      averageRating: 0,
      numberOfStudents: 0,
      level: CourseLevel.INTERMEDIATE,
      totalDuration: 30600, // 8.5 hours
      categoryId: getRandomCategory(),
      createdBy: getRandomInstructor(),
    },

    // Specialized Topics
    {
      name: 'Microservices Architecture với Node.js',
      description:
        'Thiết kế và triển khai microservices architecture. Service decomposition strategies, API Gateway pattern, Service discovery with Consul/Eureka, Load balancing, Circuit breaker pattern, Message queues (RabbitMQ/Kafka), Event-driven architecture, Saga pattern for distributed transactions, Distributed tracing với Jaeger, Centralized logging với ELK stack, Monitoring với Prometheus & Grafana. Containerization với Docker & orchestration với Kubernetes.',
      notes: 'Yêu cầu: Kinh nghiệm backend development',
      thumbnail:
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
      price: 899000,
      saleInfo: {
        saleType: SaleType.PERCENT,
        value: 30,
        saleStartDate: new Date('2024-11-01'),
        saleEndDate: new Date('2025-01-31'),
      },
      rating: 0,
      status: true,
      averageRating: 0,
      numberOfStudents: 0,
      level: CourseLevel.ADVANCED,
      totalDuration: 54000, // 15 hours
      categoryId: getRandomCategory(),
      createdBy: getRandomInstructor(),
    },
    {
      name: 'Git & GitHub - Version Control Mastery',
      description:
        'Làm chủ Git từ cơ bản đến nâng cao. Repository initialization, Staging, Committing, Branching, Merging, Rebasing, Cherry-picking, Stashing, Tagging. Git workflows: Feature branch, Gitflow, Forking workflow. Resolving merge conflicts, Interactive rebase, Git hooks, Submodules. GitHub collaboration: Pull requests, Code reviews, Issues, Projects, GitHub Actions for CI/CD. Git best practices và common pitfalls.',
      notes: 'Không yêu cầu kiến thức trước',
      thumbnail:
        'https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=800&q=80',
      price: 249000,
      rating: 0,
      status: true,
      averageRating: 0,
      numberOfStudents: 0,
      level: CourseLevel.BEGINNER,
      totalDuration: 16200, // 4.5 hours
      categoryId: getRandomCategory(),
      createdBy: getRandomInstructor(),
    },
    {
      name: 'Redis - In-Memory Database & Caching',
      description:
        'Tối ưu hiệu suất ứng dụng với Redis. Data structures: Strings, Lists, Sets, Sorted Sets, Hashes, Bitmaps, HyperLogLog, Streams. Caching strategies: Cache-aside, Write-through, Write-behind, Refresh-ahead. Pub/Sub messaging, Session management, Rate limiting, Leaderboards, Real-time analytics. Redis persistence: RDB & AOF. Replication, Sentinel for high availability, Redis Cluster for scalability. Integration với Node.js/Python.',
      notes: 'Yêu cầu: Kinh nghiệm backend development',
      thumbnail:
        'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80',
      price: 449000,
      rating: 0,
      status: true,
      averageRating: 0,
      numberOfStudents: 0,
      level: CourseLevel.INTERMEDIATE,
      totalDuration: 25200, // 7 hours
      categoryId: getRandomCategory(),
      createdBy: getRandomInstructor(),
    },

    // Business & Marketing
    {
      name: 'SEO & Content Marketing 2024 - Tăng traffic tự nhiên',
      description:
        'Học cách tối ưu hóa website lên TOP Google. On-page SEO: Keywords research, Title tags, Meta descriptions, Header tags, URL structure, Internal linking, Image optimization. Off-page SEO: Backlinks, Guest posting, Social signals. Technical SEO: Site speed, Mobile-friendly, Schema markup, XML sitemaps, Robots.txt. Google Analytics & Search Console. Content strategy, Link building. Local SEO.',
      notes: 'Không yêu cầu kiến thức kỹ thuật',
      thumbnail:
        'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=800&q=80',
      price: 449000,
      rating: 0,
      status: true,
      averageRating: 0,
      numberOfStudents: 0,
      level: CourseLevel.BEGINNER,
      totalDuration: 23400, // 6.5 hours
      categoryId: getRandomCategory(),
      createdBy: getRandomInstructor(),
    },
    {
      name: 'Facebook Ads & Google Ads - Quảng cáo hiệu quả',
      description:
        'Chiến lược quảng cáo số hiệu quả trên Facebook và Google. Facebook Ads: Campaign structure, Audience targeting, Custom audiences, Lookalike audiences, Ad creative best practices, A/B testing, Budget optimization, Retargeting. Google Ads: Search ads, Display ads, Shopping ads, YouTube ads, Keywords bidding strategies, Quality score, Conversion tracking. Analytics và ROI measurement.',
      notes: 'Phù hợp cho marketers và business owners',
      thumbnail:
        'https://images.unsplash.com/photo-1611926653670-1b7ab53acf46?w=800&q=80',
      price: 599000,
      saleInfo: {
        saleType: SaleType.PERCENT,
        value: 25,
        saleStartDate: new Date('2024-11-01'),
        saleEndDate: new Date('2025-01-31'),
      },
      rating: 0,
      status: true,
      averageRating: 0,
      numberOfStudents: 0,
      level: CourseLevel.INTERMEDIATE,
      totalDuration: 27000, // 7.5 hours
      categoryId: getRandomCategory(),
      createdBy: getRandomInstructor(),
    },

    // Personal Development
    {
      name: 'Tiếng Anh giao tiếp - Từ mất gốc đến tự tin',
      description:
        'Khóa học tiếng Anh giao tiếp thực chiến. Phát âm chuẩn American/British, Ngữ pháp cơ bản, Từ vựng theo chủ đề hàng ngày, Mẫu câu giao tiếp phổ biến, Luyện nghe với native speakers, Speaking practice với bài tập tương tác. Tình huống thực tế: At work, Shopping, Restaurant, Travel, Small talk. Học tiếng Anh qua phim, nhạc, podcast. Tips học hiệu quả.',
      notes: 'Phù hợp mọi trình độ, kể cả người mới bắt đầu',
      thumbnail:
        'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=800&q=80',
      price: 399000,
      rating: 0,
      status: true,
      averageRating: 0,
      numberOfStudents: 0,
      level: CourseLevel.BEGINNER,
      totalDuration: 32400, // 9 hours
      categoryId: getRandomCategory(),
      createdBy: getRandomInstructor(),
    },
    {
      name: 'Kỹ năng thuyết trình và giao tiếp',
      description:
        'Trở thành người thuyết trình tự tin và thuyết phục. Chuẩn bị nội dung presentation, Cấu trúc presentation hiệu quả, Storytelling techniques, Body language, Eye contact, Voice control, Handle Q&A, Overcome stage fright, Design slides đẹp với PowerPoint/Keynote/Canva. Public speaking tips từ TED speakers. Practice với feedback.',
      notes: 'Phù hợp cho mọi người muốn cải thiện kỹ năng',
      thumbnail:
        'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&q=80',
      price: 349000,
      rating: 0,
      status: true,
      averageRating: 0,
      numberOfStudents: 0,
      level: CourseLevel.BEGINNER,
      totalDuration: 18000, // 5 hours
      categoryId: getRandomCategory(),
      createdBy: getRandomInstructor(),
    },
    {
      name: 'Yoga & Meditation - Sức khỏe thể chất & tinh thần',
      description:
        'Yoga cho người mới bắt đầu đến nâng cao. Hatha Yoga, Vinyasa flow, Yin Yoga, Restorative Yoga. Các tư thế cơ bản (Asanas), Breathing techniques (Pranayama), Meditation và mindfulness. Yoga cho back pain, Yoga for flexibility, Yoga for strength. Morning & evening routines. Nutrition for yogis. Build consistent practice.',
      notes: 'Không yêu cầu kinh nghiệm, mọi lứa tuổi',
      thumbnail:
        'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80',
      price: 299000,
      rating: 0,
      status: true,
      averageRating: 0,
      numberOfStudents: 0,
      level: CourseLevel.BEGINNER,
      totalDuration: 21600, // 6 hours
      categoryId: getRandomCategory(),
      createdBy: getRandomInstructor(),
    },

    // Free Courses
    {
      name: 'Giới thiệu về lập trình - Khóa học miễn phí',
      description:
        'Khóa học miễn phí dành cho người mới bắt đầu. Lập trình là gì? Các ngôn ngữ lập trình phổ biến. Career paths trong IT. Cách tư duy như một programmer. Algorithm cơ bản. Giới thiệu về HTML, CSS, JavaScript. Tools cần thiết cho lập trình viên. Roadmap học lập trình hiệu quả.',
      notes: 'Hoàn toàn miễn phí, dành cho người mới',
      thumbnail:
        'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80',
      price: 0,
      rating: 0,
      status: true,
      averageRating: 0,
      numberOfStudents: 0,
      level: CourseLevel.BEGINNER,
      totalDuration: 10800, // 3 hours
      categoryId: getRandomCategory(),
      createdBy: getRandomInstructor(),
    },
    {
      name: 'Figma cơ bản - Miễn phí',
      description:
        'Học Figma miễn phí trong 2 giờ. Interface overview, Creating frames, Shapes và vectors, Text và typography, Colors và gradients, Components basics, Auto Layout introduction, Prototyping simple interactions, Sharing designs. Đủ để bắt đầu design journey của bạn!',
      notes: 'Miễn phí, không yêu cầu kiến thức',
      thumbnail:
        'https://images.unsplash.com/photo-1609921212029-bb5a28e60960?w=800&q=80',
      price: 0,
      rating: 0,
      status: true,
      averageRating: 0,
      numberOfStudents: 0,
      level: CourseLevel.BEGINNER,
      totalDuration: 7200, // 2 hours
      categoryId: getRandomCategory(),
      createdBy: getRandomInstructor(),
    },
  ];

  // Insert courses
  await courseRepository
    .createQueryBuilder()
    .insert()
    .into(Course)
    .values(courses as any)
    .execute();

  console.log(`✅ Successfully seeded ${courses.length} courses!`);
}
