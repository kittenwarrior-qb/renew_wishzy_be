import { DataSource } from 'typeorm';
import { Quiz } from '../../app/entities/quiz.entity';
import { Question } from '../../app/entities/question.entity';
import { AnswerOption } from '../../app/entities/answer-option.entity';
import { QuizAttempt } from '../../app/entities/quiz-attempt.entity';
import { UserAnswer } from '../../app/entities/user-answer.entity';
import { User } from '../../app/entities/user.entity';
import { AttemptStatus } from '../../app/entities/enums/attempt-status.enum';

// Quiz topics - 10 quizzes with descriptions
const quizTopics = [
  { title: 'JavaScript Cơ Bản', category: 'Programming', description: 'Kiểm tra kiến thức JavaScript từ cơ bản đến nâng cao' },
  { title: 'React & Hooks', category: 'Frontend', description: 'Bài kiểm tra về React, Hooks và các patterns phổ biến' },
  { title: 'Node.js & Express', category: 'Backend', description: 'Kiểm tra kiến thức về Node.js và Express framework' },
  { title: 'TypeScript Nâng Cao', category: 'Programming', description: 'Bài test TypeScript với các khái niệm nâng cao' },
  { title: 'SQL & Database', category: 'Database', description: 'Kiểm tra kiến thức SQL và thiết kế cơ sở dữ liệu' },
  { title: 'HTML & CSS', category: 'Frontend', description: 'Bài kiểm tra về HTML5, CSS3 và responsive design' },
  { title: 'Git & Version Control', category: 'DevOps', description: 'Kiểm tra kiến thức Git và quản lý phiên bản' },
  { title: 'RESTful API Design', category: 'Backend', description: 'Bài test về thiết kế và xây dựng RESTful API' },
  { title: 'Docker & Containers', category: 'DevOps', description: 'Kiểm tra kiến thức Docker và containerization' },
  { title: 'Testing & QA', category: 'Testing', description: 'Bài kiểm tra về unit testing, integration testing' },
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

  // Create 10 quizzes with 15-40 questions each
  for (let i = 0; i < 10; i++) {
    const topic = quizTopics[i];
    const instructor = instructors[i % instructors.length];
    const isFree = i % 3 !== 0; // 2/3 are free
    const isPublic = true; // All public

    const quiz = quizRepository.create({
      creatorId: instructor.id,
      title: topic.title,
      description: topic.description,
      isPublic,
      isFree,
      price: isFree ? 0 : Math.floor(Math.random() * 50 + 10), // 10-60 if paid
      timeLimit: 30 + (i % 4) * 15, // 30-75 minutes
      totalAttempts: 0,
      shareCount: Math.floor(Math.random() * 100),
    });

    quizzes.push(quiz);
  }

  // Save quizzes
  const savedQuizzes = await quizRepository.save(quizzes);
  console.log(`✅ Created ${savedQuizzes.length} quizzes`);

  // Create questions and answer options for each quiz (15-40 questions random)
  const questionCounts: number[] = [];
  for (let quizIndex = 0; quizIndex < savedQuizzes.length; quizIndex++) {
    const quiz = savedQuizzes[quizIndex];
    const topic = quizTopics[quizIndex];
    
    // Random 15-40 questions per quiz
    const numQuestions = Math.floor(Math.random() * 26) + 15; // 15-40
    questionCounts.push(numQuestions);

    for (let qIndex = 0; qIndex < numQuestions; qIndex++) {
      const hasMultipleCorrect = qIndex % 7 === 0; // Every 7th question has multiple correct answers

      const question = questionRepository.create({
        quizId: quiz.id,
        questionText: generateQuestionText(qIndex, topic.title),
        orderIndex: qIndex,
        points: hasMultipleCorrect ? 2 : 1, // Multiple correct = 2 points
      });

      allQuestions.push(question);
    }
  }
  
  console.log(`📊 Question distribution: ${questionCounts.join(', ')}`);
  console.log(`📊 Total questions: ${allQuestions.length}`);

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
