import { DataSource } from 'typeorm';
import { Quiz } from '../../app/entities/quiz.entity';
import { Question } from '../../app/entities/question.entity';
import { AnswerOption } from '../../app/entities/answer-option.entity';
import { User, UserRole } from '../../app/entities/user.entity';

// Quiz topics - 10 tests with descriptions
const testTopics = [
    {
        title: 'Kiến Thức Lập Trình Cơ Bản',
        category: 'Programming',
        description: 'Kiểm tra kiến thức lập trình cơ bản cho người mới bắt đầu',
        timeLimit: 30
    },
    {
        title: 'HTML & CSS Cơ Bản',
        category: 'Frontend',
        description: 'Kiểm tra kiến thức cơ bản về HTML và CSS',
        timeLimit: 30
    },
    {
        title: 'JavaScript Cơ Bản',
        category: 'Programming',
        description: 'Kiểm tra kiến thức cơ bản về JavaScript',
        timeLimit: 45
    },
    {
        title: 'Cơ Sở Dữ Liệu SQL',
        category: 'Database',
        description: 'Kiểm tra kiến thức cơ bản về SQL và cơ sở dữ liệu',
        timeLimit: 40
    },
    {
        title: 'Lập Trình Hướng Đối Tượng',
        category: 'Programming',
        description: 'Kiểm tra kiến thức về lập trình hướng đối tượng',
        timeLimit: 50
    },
    {
        title: 'React.js Căn Bản',
        category: 'Frontend',
        description: 'Kiểm tra kiến thức cơ bản về React.js',
        timeLimit: 35
    },
    {
        title: 'Node.js & Express',
        category: 'Backend',
        description: 'Kiểm tra kiến thức về Node.js và Express',
        timeLimit: 45
    },
    {
        title: 'Git & Version Control',
        category: 'DevOps',
        description: 'Kiểm tra kiến thức về Git và quản lý phiên bản',
        timeLimit: 30
    },
    {
        title: 'TypeScript Cơ Bản',
        category: 'Programming',
        description: 'Kiểm tra kiến thức cơ bản về TypeScript',
        timeLimit: 40
    },
    {
        title: 'API & RESTful',
        category: 'Backend',
        description: 'Kiểm tra kiến thức về API và thiết kế RESTful',
        timeLimit: 50
    }
];

// Question templates
const questionTemplates = [
    {
        prefix: 'Biến trong lập trình là gì?', options: [
            'Là các ký tự đặc biệt',
            'Là tên gọi của một vùng nhớ dùng để lưu trữ dữ liệu',
            'Là một loại hàm',
            'Là một vòng lặp'
        ], correctIndices: [1]
    },
    {
        prefix: 'Vòng lặp for thường được sử dụng khi nào?', options: [
            'Khi cần thực hiện một khối lệnh nhiều lần với số lần xác định',
            'Khi cần kiểm tra điều kiện',
            'Khi cần khai báo biến',
            'Khi cần tạo hàm mới'
        ], correctIndices: [0]
    },
    {
        prefix: 'Thẻ nào dùng để tạo tiêu đề lớn nhất trong HTML?', options: [
            '<h1>',
            '<head>',
            '<heading>',
            '<h6>'
        ], correctIndices: [0]
    },
    {
        prefix: 'Làm thế nào để khai báo một biến trong JavaScript?', options: [
            'var x = 5;',
            'variable x = 5;',
            'int x = 5;',
            'x = 5;'
        ], correctIndices: [0, 3]
    },
    {
        prefix: 'Câu lệnh nào dùng để chọn dữ liệu từ bảng?', options: [
            'GET',
            'SELECT',
            'EXTRACT',
            'OPEN'
        ], correctIndices: [1]
    }
];

function generateQuestion(topic: string, index: number) {
    const template = questionTemplates[index % questionTemplates.length];
    return {
        text: template.prefix,
        options: template.options.map((option, i) => ({
            text: option,
            isCorrect: template.correctIndices.includes(i)
        }))
    };
}

export async function seedTests(dataSource: DataSource) {
    console.log(' Seeding tests...');

    const userRepository = dataSource.getRepository(User);
    const quizRepository = dataSource.getRepository(Quiz);
    const questionRepository = dataSource.getRepository(Question);
    const answerOptionRepository = dataSource.getRepository(AnswerOption);

    // Get admin user to be the creator
    const adminUser = await userRepository.findOne({
        where: { role: UserRole.ADMIN },
        select: ['id']
    });

    if (!adminUser) {
        console.error(' No admin user found. Please create an admin user first.');
        return;
    }

    // Create tests
    for (const [index, topic] of testTopics.entries()) {
        console.log(`  Creating test: ${topic.title}`);

        // Create quiz
        const quiz = quizRepository.create({
            creatorId: adminUser.id,
            title: topic.title,
            description: topic.description,
            timeLimit: topic.timeLimit,
            isPublic: true,
            isFree: true,
            price: 0,
        });

        const savedQuiz = await quizRepository.save(quiz);

        // Create 3-5 questions per quiz
        const numQuestions = 3 + (index % 3); // 3-5 questions
        for (let i = 0; i < numQuestions; i++) {
            const questionData = generateQuestion(topic.title, i);

            const question = questionRepository.create({
                quizId: savedQuiz.id,
                questionText: questionData.text,
                orderIndex: i + 1,
                points: 1,
            });

            const savedQuestion = await questionRepository.save(question);

            // Create answer options
            for (const [optionIndex, optionData] of questionData.options.entries()) {
                const option = answerOptionRepository.create({
                    questionId: savedQuestion.id,
                    optionText: optionData.text,
                    isCorrect: optionData.isCorrect,
                    orderIndex: optionIndex + 1,
                });
                await answerOptionRepository.save(option);
            }
        }
    }

    console.log(' Test seeding completed!');
}

export async function clearTests(dataSource: DataSource) {
    console.log(' Clearing test data...');

    const quizRepository = dataSource.getRepository(Quiz);
    const quizzes = await quizRepository.find({
        where: testTopics.map(topic => ({ title: topic.title })),
        relations: ['questions', 'questions.answerOptions']
    });

    for (const quiz of quizzes) {
        console.log(`  Deleting test: ${quiz.title}`);
        await quizRepository.remove(quiz);
    }

    console.log(' Test data cleared!');
}
