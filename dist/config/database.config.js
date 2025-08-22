"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.databaseConfig = void 0;
require("reflect-metadata");
const dotenv = require("dotenv");
dotenv.config();
const user_entity_1 = require("../modules/users/entities/user.entity");
const student_entity_1 = require("../modules/students/entities/student.entity");
const parent_entity_1 = require("../modules/parents/entities/parent.entity");
const quiz_entity_1 = require("../modules/quizzes/entities/quiz.entity");
const question_entity_1 = require("../modules/quizzes/entities/question.entity");
const quiz_attempt_entity_1 = require("../modules/quizzes/entities/quiz-attempt.entity");
const course_entity_1 = require("../modules/content/entities/course.entity");
exports.databaseConfig = {
    type: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'chrono_carto',
    entities: [user_entity_1.User, student_entity_1.Student, parent_entity_1.Parent, quiz_entity_1.Quiz, question_entity_1.Question, quiz_attempt_entity_1.QuizAttempt, course_entity_1.Course],
    migrations: ['src/database/migrations/*.ts'],
    synchronize: true,
    logging: true,
};
//# sourceMappingURL=database.config.js.map