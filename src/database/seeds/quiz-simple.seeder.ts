import { DataSource } from 'typeorm';
import { Quiz } from '../../app/entities/quiz.entity';
import { Question } from '../../app/entities/question.entity';
import { AnswerOption } from '../../app/entities/answer-option.entity';
import { User, UserRole } from '../../app/entities/user.entity';

// 8 Quiz với nội dung thực tế
const quizData = [
  {
    title: 'JavaScript Cơ Bản',
    description: 'Kiểm tra kiến thức JavaScript cơ bản',
    questions: [
      {
        questionText: 'Đâu là cách khai báo biến trong JavaScript ES6?',
        answers: [
          { text: 'var x = 10;', isCorrect: false },
          { text: 'let x = 10;', isCorrect: true },
          { text: 'int x = 10;', isCorrect: false },
          { text: 'string x = 10;', isCorrect: false },
        ],
      },
      {
        questionText: 'Kết quả của typeof null là gì?',
        answers: [
          { text: '"null"', isCorrect: false },
          { text: '"undefined"', isCorrect: false },
          { text: '"object"', isCorrect: true },
          { text: '"number"', isCorrect: false },
        ],
      },
      {
        questionText: 'Arrow function trong ES6 được viết như thế nào?',
        answers: [
          { text: 'function => {}', isCorrect: false },
          { text: '() => {}', isCorrect: true },
          { text: '-> {}', isCorrect: false },
          { text: 'lambda {}', isCorrect: false },
        ],
      },
    ],
  },
  {
    title: 'React Hooks',
    description: 'Bài kiểm tra về React Hooks',
    questions: [
      {
        questionText: 'Hook nào dùng để quản lý state trong functional component?',
        answers: [
          { text: 'useEffect', isCorrect: false },
          { text: 'useState', isCorrect: true },
          { text: 'useContext', isCorrect: false },
          { text: 'useReducer', isCorrect: false },
        ],
      },
      {
        questionText: 'useEffect được gọi khi nào?',
        answers: [
          { text: 'Chỉ khi component mount', isCorrect: false },
          { text: 'Sau mỗi lần render', isCorrect: true },
          { text: 'Chỉ khi state thay đổi', isCorrect: false },
          { text: 'Trước khi render', isCorrect: false },
        ],
      },
      {
        questionText: 'Hook nào dùng để tối ưu performance bằng cách memo hóa giá trị?',
        answers: [
          { text: 'useCallback', isCorrect: false },
          { text: 'useMemo', isCorrect: true },
          { text: 'useRef', isCorrect: false },
          { text: 'useState', isCorrect: false },
        ],
      },
    ],
  },
  {
    title: 'TypeScript Basics',
    description: 'Kiểm tra kiến thức TypeScript cơ bản',
    questions: [
      {
        questionText: 'Cách định nghĩa kiểu dữ liệu cho biến trong TypeScript?',
        answers: [
          { text: 'let x: number = 10;', isCorrect: true },
          { text: 'let x = number(10);', isCorrect: false },
          { text: 'let number x = 10;', isCorrect: false },
          { text: 'let x as number = 10;', isCorrect: false },
        ],
      },
      {
        questionText: 'Interface trong TypeScript dùng để làm gì?',
        answers: [
          { text: 'Tạo class mới', isCorrect: false },
          { text: 'Định nghĩa cấu trúc của object', isCorrect: true },
          { text: 'Khai báo biến', isCorrect: false },
          { text: 'Tạo function', isCorrect: false },
        ],
      },
      {
        questionText: 'Kiểu "any" trong TypeScript có nghĩa là gì?',
        answers: [
          { text: 'Chỉ chấp nhận string', isCorrect: false },
          { text: 'Chỉ chấp nhận number', isCorrect: false },
          { text: 'Chấp nhận mọi kiểu dữ liệu', isCorrect: true },
          { text: 'Không chấp nhận giá trị nào', isCorrect: false },
        ],
      },
    ],
  },
  {
    title: 'Node.js & Express',
    description: 'Kiểm tra kiến thức Node.js và Express',
    questions: [
      {
        questionText: 'Middleware trong Express là gì?',
        answers: [
          { text: 'Database connection', isCorrect: false },
          { text: 'Hàm xử lý request trước khi đến route handler', isCorrect: true },
          { text: 'Template engine', isCorrect: false },
          { text: 'Static file server', isCorrect: false },
        ],
      },
      {
        questionText: 'Cách tạo server HTTP cơ bản trong Express?',
        answers: [
          { text: 'express.listen(3000)', isCorrect: false },
          { text: 'app.listen(3000)', isCorrect: true },
          { text: 'server.start(3000)', isCorrect: false },
          { text: 'http.create(3000)', isCorrect: false },
        ],
      },
      {
        questionText: 'req.body chứa dữ liệu gì?',
        answers: [
          { text: 'Query parameters', isCorrect: false },
          { text: 'URL parameters', isCorrect: false },
          { text: 'Request body (POST data)', isCorrect: true },
          { text: 'Headers', isCorrect: false },
        ],
      },
    ],
  },
  {
    title: 'SQL Cơ Bản',
    description: 'Kiểm tra kiến thức SQL cơ bản',
    questions: [
      {
        questionText: 'Câu lệnh nào dùng để lấy dữ liệu từ bảng?',
        answers: [
          { text: 'GET', isCorrect: false },
          { text: 'SELECT', isCorrect: true },
          { text: 'FETCH', isCorrect: false },
          { text: 'RETRIEVE', isCorrect: false },
        ],
      },
      {
        questionText: 'JOIN nào trả về tất cả records từ bảng bên trái?',
        answers: [
          { text: 'INNER JOIN', isCorrect: false },
          { text: 'RIGHT JOIN', isCorrect: false },
          { text: 'LEFT JOIN', isCorrect: true },
          { text: 'CROSS JOIN', isCorrect: false },
        ],
      },
      {
        questionText: 'Câu lệnh nào dùng để xóa dữ liệu?',
        answers: [
          { text: 'REMOVE', isCorrect: false },
          { text: 'DELETE', isCorrect: true },
          { text: 'DROP', isCorrect: false },
          { text: 'TRUNCATE', isCorrect: false },
        ],
      },
    ],
  },
  {
    title: 'Git Version Control',
    description: 'Kiểm tra kiến thức Git',
    questions: [
      {
        questionText: 'Lệnh nào dùng để tạo branch mới?',
        answers: [
          { text: 'git new branch', isCorrect: false },
          { text: 'git branch <name>', isCorrect: true },
          { text: 'git create branch', isCorrect: false },
          { text: 'git add branch', isCorrect: false },
        ],
      },
      {
        questionText: 'Lệnh nào dùng để gộp branch vào branch hiện tại?',
        answers: [
          { text: 'git combine', isCorrect: false },
          { text: 'git join', isCorrect: false },
          { text: 'git merge', isCorrect: true },
          { text: 'git unite', isCorrect: false },
        ],
      },
      {
        questionText: 'git pull tương đương với?',
        answers: [
          { text: 'git fetch + git merge', isCorrect: true },
          { text: 'git push + git commit', isCorrect: false },
          { text: 'git add + git commit', isCorrect: false },
          { text: 'git clone + git checkout', isCorrect: false },
        ],
      },
    ],
  },
  {
    title: 'HTML & CSS',
    description: 'Kiểm tra kiến thức HTML và CSS',
    questions: [
      {
        questionText: 'Thuộc tính CSS nào dùng để căn giữa theo chiều ngang?',
        answers: [
          { text: 'text-center: true', isCorrect: false },
          { text: 'margin: 0 auto', isCorrect: true },
          { text: 'align: center', isCorrect: false },
          { text: 'center: horizontal', isCorrect: false },
        ],
      },
      {
        questionText: 'Flexbox property nào dùng để căn giữa items theo trục chính?',
        answers: [
          { text: 'align-items', isCorrect: false },
          { text: 'justify-content', isCorrect: true },
          { text: 'flex-center', isCorrect: false },
          { text: 'text-align', isCorrect: false },
        ],
      },
      {
        questionText: 'Thẻ HTML5 nào dùng cho navigation?',
        answers: [
          { text: '<navigation>', isCorrect: false },
          { text: '<nav>', isCorrect: true },
          { text: '<menu>', isCorrect: false },
          { text: '<links>', isCorrect: false },
        ],
      },
    ],
  },
  {
    title: 'RESTful API',
    description: 'Kiểm tra kiến thức RESTful API',
    questions: [
      {
        questionText: 'HTTP method nào dùng để tạo resource mới?',
        answers: [
          { text: 'GET', isCorrect: false },
          { text: 'POST', isCorrect: true },
          { text: 'PUT', isCorrect: false },
          { text: 'PATCH', isCorrect: false },
        ],
      },
      {
        questionText: 'Status code 404 có nghĩa là gì?',
        answers: [
          { text: 'Server error', isCorrect: false },
          { text: 'Unauthorized', isCorrect: false },
          { text: 'Not Found', isCorrect: true },
          { text: 'Bad Request', isCorrect: false },
        ],
      },
      {
        questionText: 'PUT và PATCH khác nhau như thế nào?',
        answers: [
          { text: 'PUT tạo mới, PATCH cập nhật', isCorrect: false },
          { text: 'PUT cập nhật toàn bộ, PATCH cập nhật một phần', isCorrect: true },
          { text: 'Không có sự khác biệt', isCorrect: false },
          { text: 'PATCH tạo mới, PUT cập nhật', isCorrect: false },
        ],
      },
    ],
  },
];

export async function seedSimpleQuizzes(dataSource: DataSource) {
  const quizRepository = dataSource.getRepository(Quiz);
  const questionRepository = dataSource.getRepository(Question);
  const answerOptionRepository = dataSource.getRepository(AnswerOption);
  const userRepository = dataSource.getRepository(User);

  console.log('🎯 Starting simple quiz seeding (8 quizzes, 3 questions each)...');

  // Get an instructor
  const instructor = await userRepository.findOne({ where: { role: UserRole.INSTRUCTOR } });

  if (!instructor) {
    console.log('⚠️  No instructor found. Please seed users first.');
    return;
  }

  const savedQuizzes: Quiz[] = [];

  for (let i = 0; i < quizData.length; i++) {
    const data = quizData[i];

    // Create quiz
    const quiz = quizRepository.create({
      creatorId: instructor.id,
      title: data.title,
      description: data.description,
      isPublic: true,
      isFree: i % 2 === 0, // Alternate free/paid
      price: i % 2 === 0 ? 0 : 50000,
      timeLimit: 15, // 15 minutes
      totalAttempts: 0,
      shareCount: 0,
      passingScore: 70,
    });

    const savedQuiz = await quizRepository.save(quiz);
    savedQuizzes.push(savedQuiz);

    // Create questions
    for (let qIndex = 0; qIndex < data.questions.length; qIndex++) {
      const qData = data.questions[qIndex];

      const question = questionRepository.create({
        quizId: savedQuiz.id,
        questionText: qData.questionText,
        orderIndex: qIndex,
        points: 1,
      });

      const savedQuestion = await questionRepository.save(question);

      // Create answer options
      for (let aIndex = 0; aIndex < qData.answers.length; aIndex++) {
        const aData = qData.answers[aIndex];

        const answerOption = answerOptionRepository.create({
          questionId: savedQuestion.id,
          optionText: aData.text,
          isCorrect: aData.isCorrect,
          orderIndex: aIndex,
        });

        await answerOptionRepository.save(answerOption);
      }
    }

    console.log(`✅ Created quiz: ${data.title}`);
  }

  console.log('🎉 Simple quiz seeding completed!');
  console.log(`   - ${savedQuizzes.length} quizzes`);
  console.log(`   - ${savedQuizzes.length * 3} questions`);
  console.log(`   - ${savedQuizzes.length * 3 * 4} answer options`);
}
