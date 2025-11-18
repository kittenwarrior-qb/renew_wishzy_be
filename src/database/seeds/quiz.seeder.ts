import { DataSource } from 'typeorm';
import { Quiz } from '../../app/entities/quiz.entity';
import { Question } from '../../app/entities/question.entity';
import { AnswerOption } from '../../app/entities/answer-option.entity';
import { QuizAttempt } from '../../app/entities/quiz-attempt.entity';
import { UserAnswer } from '../../app/entities/user-answer.entity';
import { User } from '../../app/entities/user.entity';
import { AttemptStatus } from '../../app/entities/enums/attempt-status.enum';

// Quiz topics and templates
const quizTopics = [
  { title: 'JavaScript Fundamentals', category: 'Programming' },
  { title: 'TypeScript Advanced', category: 'Programming' },
  { title: 'React Hooks Deep Dive', category: 'Frontend' },
  { title: 'Node.js Best Practices', category: 'Backend' },
  { title: 'Database Design Principles', category: 'Database' },
  { title: 'RESTful API Design', category: 'Backend' },
  { title: 'CSS Grid & Flexbox', category: 'Frontend' },
  { title: 'Git Version Control', category: 'DevOps' },
  { title: 'Docker Containerization', category: 'DevOps' },
  { title: 'AWS Cloud Services', category: 'Cloud' },
  { title: 'Python Data Structures', category: 'Programming' },
  { title: 'Machine Learning Basics', category: 'AI/ML' },
  { title: 'SQL Query Optimization', category: 'Database' },
  { title: 'GraphQL Fundamentals', category: 'Backend' },
  { title: 'Vue.js Composition API', category: 'Frontend' },
  { title: 'MongoDB Aggregation', category: 'Database' },
  { title: 'Kubernetes Orchestration', category: 'DevOps' },
  { title: 'Security Best Practices', category: 'Security' },
  { title: 'Microservices Architecture', category: 'Architecture' },
  { title: 'Testing with Jest', category: 'Testing' },
  { title: 'Redux State Management', category: 'Frontend' },
  { title: 'Express.js Middleware', category: 'Backend' },
  { title: 'HTML5 Semantic Tags', category: 'Frontend' },
  { title: 'Linux Command Line', category: 'DevOps' },
  { title: 'Agile Methodology', category: 'Management' },
  { title: 'Design Patterns', category: 'Architecture' },
  { title: 'Web Performance', category: 'Optimization' },
  { title: 'OAuth 2.0 Authentication', category: 'Security' },
  { title: 'WebSocket Real-time', category: 'Backend' },
  { title: 'Progressive Web Apps', category: 'Frontend' },
  { title: 'CI/CD Pipelines', category: 'DevOps' },
  { title: 'Elasticsearch Basics', category: 'Database' },
  { title: 'Angular Components', category: 'Frontend' },
  { title: 'Redis Caching', category: 'Database' },
  { title: 'Serverless Functions', category: 'Cloud' },
  { title: 'Web Accessibility', category: 'Frontend' },
  { title: 'API Rate Limiting', category: 'Backend' },
  { title: 'Nginx Configuration', category: 'DevOps' },
  { title: 'Clean Code Principles', category: 'Programming' },
  { title: 'SOLID Principles', category: 'Architecture' },
  { title: 'Functional Programming', category: 'Programming' },
  { title: 'Async/Await Patterns', category: 'Programming' },
  { title: 'WebAssembly Intro', category: 'Advanced' },
  { title: 'Blockchain Basics', category: 'Emerging Tech' },
  { title: 'IoT Development', category: 'Emerging Tech' },
  { title: 'Mobile App Development', category: 'Mobile' },
  { title: 'Game Development Unity', category: 'Gaming' },
  { title: 'Data Visualization', category: 'Data Science' },
  { title: 'Natural Language Processing', category: 'AI/ML' },
  { title: 'Computer Vision Basics', category: 'AI/ML' },
];

// Question templates for variety
const questionTemplates = [
  { prefix: 'What is', suffix: '?' },
  { prefix: 'Which of the following', suffix: '?' },
  { prefix: 'How do you', suffix: '?' },
  { prefix: 'What does', suffix: 'mean?' },
  { prefix: 'When should you use', suffix: '?' },
  { prefix: 'What is the purpose of', suffix: '?' },
  { prefix: 'Which statement is true about', suffix: '?' },
  { prefix: 'What is the difference between', suffix: '?' },
  { prefix: 'How can you implement', suffix: '?' },
  { prefix: 'What are the benefits of', suffix: '?' },
];

function generateQuestionText(index: number, topic: string): string {
  const template = questionTemplates[index % questionTemplates.length];
  return `${template.prefix} ${topic} - Question ${index + 1}${template.suffix}`;
}

function generateAnswerOptions(
  questionIndex: number,
  hasMultipleCorrect: boolean,
): Array<{ text: string; isCorrect: boolean }> {
  const numOptions = 4;
  const options: Array<{ text: string; isCorrect: boolean }> = [];

  if (hasMultipleCorrect) {
    // 2 correct answers
    for (let i = 0; i < numOptions; i++) {
      options.push({
        text: `Option ${String.fromCharCode(65 + i)}: Answer for question ${questionIndex + 1}`,
        isCorrect: i < 2, // First 2 are correct
      });
    }
  } else {
    // 1 correct answer
    const correctIndex = questionIndex % numOptions;
    for (let i = 0; i < numOptions; i++) {
      options.push({
        text: `Option ${String.fromCharCode(65 + i)}: Answer for question ${questionIndex + 1}`,
        isCorrect: i === correctIndex,
      });
    }
  }

  return options;
}

export async function seedQuizzes(dataSource: DataSource) {
  const quizRepository = dataSource.getRepository(Quiz);
  const questionRepository = dataSource.getRepository(Question);
  const answerOptionRepository = dataSource.getRepository(AnswerOption);
  const quizAttemptRepository = dataSource.getRepository(QuizAttempt);
  const userAnswerRepository = dataSource.getRepository(UserAnswer);
  const userRepository = dataSource.getRepository(User);

  // Check if quizzes already exist
  const existingQuizzes = await quizRepository.count();
  if (existingQuizzes > 0) {
    console.log('Quizzes already exist, skipping...');
    return;
  }

  console.log('🎯 Starting quiz seeding...');

  // Get instructors and users
  const { UserRole } = await import('../../app/entities/user.entity');
  const instructors = await userRepository.find({ where: { role: UserRole.INSTRUCTOR } });
  const students = await userRepository.find({ where: { role: UserRole.USER } });

  if (instructors.length === 0 || students.length === 0) {
    console.log('⚠️  No instructors or students found. Please seed users first.');
    return;
  }

  const quizzes: Quiz[] = [];
  const allQuestions: Question[] = [];
  const allAnswerOptions: AnswerOption[] = [];

  // Create 50 quizzes
  for (let i = 0; i < 50; i++) {
    const topic = quizTopics[i];
    const instructor = instructors[i % instructors.length];
    const isFree = i % 3 !== 0; // 2/3 are free
    const isPublic = i % 5 !== 0; // 4/5 are public

    const quiz = quizRepository.create({
      creatorId: instructor.id,
      title: `${topic.title} - Quiz ${i + 1}`,
      description: `Comprehensive quiz covering ${topic.title} concepts. Test your knowledge in ${topic.category}.`,
      isPublic,
      isFree,
      price: isFree ? 0 : Math.floor(Math.random() * 50 + 10), // 10-60 if paid
      timeLimit: 30 + (i % 6) * 10, // 30-80 minutes
      totalAttempts: 0,
      shareCount: Math.floor(Math.random() * 100),
    });

    quizzes.push(quiz);
  }

  // Save quizzes
  const savedQuizzes = await quizRepository.save(quizzes);
  console.log(`✅ Created ${savedQuizzes.length} quizzes`);

  // Create questions and answer options for each quiz
  for (let quizIndex = 0; quizIndex < savedQuizzes.length; quizIndex++) {
    const quiz = savedQuizzes[quizIndex];
    const topic = quizTopics[quizIndex];

    for (let qIndex = 0; qIndex < 30; qIndex++) {
      const hasMultipleCorrect = qIndex % 5 === 0; // Every 5th question has multiple correct answers

      const question = questionRepository.create({
        quizId: quiz.id,
        questionText: generateQuestionText(qIndex, topic.title),
        orderIndex: qIndex,
        points: hasMultipleCorrect ? 2 : 1, // Multiple correct = 2 points
      });

      allQuestions.push(question);
    }
  }

  // Save questions in batches
  const savedQuestions = await questionRepository.save(allQuestions);
  console.log(`✅ Created ${savedQuestions.length} questions`);

  // Create answer options
  for (let i = 0; i < savedQuestions.length; i++) {
    const question = savedQuestions[i];
    const hasMultipleCorrect = i % 5 === 0;
    const options = generateAnswerOptions(i, hasMultipleCorrect);

    for (let optIndex = 0; optIndex < options.length; optIndex++) {
      const option = answerOptionRepository.create({
        questionId: question.id,
        optionText: options[optIndex].text,
        isCorrect: options[optIndex].isCorrect,
        orderIndex: optIndex,
      });

      allAnswerOptions.push(option);
    }
  }

  // Save answer options in batches
  await answerOptionRepository.save(allAnswerOptions);
  console.log(`✅ Created ${allAnswerOptions.length} answer options`);

  // Create quiz attempts and user answers
  console.log('📝 Creating quiz attempts and user answers...');

  const attempts: QuizAttempt[] = [];
  const userAnswers: UserAnswer[] = [];

  // Each student attempts 5-10 random quizzes
  for (const student of students) {
    const numAttempts = Math.floor(Math.random() * 6) + 5; // 5-10 attempts
    const attemptedQuizIndices = new Set<number>();

    for (let i = 0; i < numAttempts; i++) {
      let quizIndex: number;
      do {
        quizIndex = Math.floor(Math.random() * savedQuizzes.length);
      } while (attemptedQuizIndices.has(quizIndex));

      attemptedQuizIndices.add(quizIndex);
      const quiz = savedQuizzes[quizIndex];

      // Get questions for this quiz
      const quizQuestions = savedQuestions.filter((q) => q.quizId === quiz.id);
      const maxScore = quizQuestions.reduce((sum, q) => sum + q.points, 0);

      // Random completion status
      const isCompleted = Math.random() > 0.2; // 80% completed
      const startedAt = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000); // Last 30 days

      const attempt = quizAttemptRepository.create({
        quizId: quiz.id,
        userId: student.id,
        startedAt,
        completedAt: isCompleted
          ? new Date(startedAt.getTime() + Math.random() * 60 * 60 * 1000)
          : null,
        totalScore: 0,
        maxScore,
        percentage: 0,
        status: isCompleted ? AttemptStatus.COMPLETED : AttemptStatus.IN_PROGRESS,
      });

      attempts.push(attempt);
    }
  }

  // Save attempts
  const savedAttempts = await quizAttemptRepository.save(attempts);
  console.log(`✅ Created ${savedAttempts.length} quiz attempts`);

  // Create user answers for completed attempts
  for (const attempt of savedAttempts) {
    if (attempt.status !== AttemptStatus.COMPLETED) continue;

    const quizQuestions = savedQuestions.filter((q) => q.quizId === attempt.quizId);
    let totalScore = 0;

    for (const question of quizQuestions) {
      const questionOptions = allAnswerOptions.filter((opt) => opt.questionId === question.id);
      const correctOptions = questionOptions.filter((opt) => opt.isCorrect);

      // Simulate user answer (70% chance of correct answer)
      const isCorrect = Math.random() > 0.3;
      let selectedOption: AnswerOption;

      if (isCorrect && correctOptions.length > 0) {
        selectedOption = correctOptions[Math.floor(Math.random() * correctOptions.length)];
      } else {
        const incorrectOptions = questionOptions.filter((opt) => !opt.isCorrect);
        selectedOption =
          incorrectOptions.length > 0
            ? incorrectOptions[Math.floor(Math.random() * incorrectOptions.length)]
            : questionOptions[0];
      }

      const pointsEarned = selectedOption.isCorrect ? question.points : 0;
      totalScore += pointsEarned;

      const userAnswer = userAnswerRepository.create({
        attemptId: attempt.id,
        questionId: question.id,
        selectedOptionId: selectedOption.id,
        isCorrect: selectedOption.isCorrect,
        pointsEarned,
        answeredAt: new Date(attempt.startedAt.getTime() + Math.random() * 30 * 60 * 1000),
      });

      userAnswers.push(userAnswer);
    }

    // Update attempt with final score
    attempt.totalScore = totalScore;
    attempt.percentage = Number(((totalScore / attempt.maxScore) * 100).toFixed(2));
  }

  // Save user answers in batches
  await userAnswerRepository.save(userAnswers);
  console.log(`✅ Created ${userAnswers.length} user answers`);

  // Update attempts with scores
  await quizAttemptRepository.save(savedAttempts);

  // Update quiz total attempts count
  for (const quiz of savedQuizzes) {
    const attemptCount = savedAttempts.filter((a) => a.quizId === quiz.id).length;
    quiz.totalAttempts = attemptCount;
  }
  await quizRepository.save(savedQuizzes);

  console.log('🎉 Quiz seeding completed successfully!');
  console.log(`   - ${savedQuizzes.length} quizzes`);
  console.log(`   - ${savedQuestions.length} questions`);
  console.log(`   - ${allAnswerOptions.length} answer options`);
  console.log(`   - ${savedAttempts.length} quiz attempts`);
  console.log(`   - ${userAnswers.length} user answers`);
}
