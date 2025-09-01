"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.databaseConfig = void 0;
require("reflect-metadata");
const typeorm_1 = require("typeorm");
const dotenv = require("dotenv");
dotenv.config();
const user_entity_1 = require("../modules/users/entities/user.entity");
const student_entity_1 = require("../modules/students/entities/student.entity");
const parent_entity_1 = require("../modules/parents/entities/parent.entity");
const parent_student_entity_1 = require("../modules/relations/entities/parent-student.entity");
const quiz_entity_1 = require("../modules/quizzes/entities/quiz.entity");
const question_entity_1 = require("../modules/quizzes/entities/question.entity");
const quiz_attempt_entity_1 = require("../modules/quizzes/entities/quiz-attempt.entity");
const course_entity_1 = require("../modules/content/entities/course.entity");
const settings_entity_1 = require("../modules/settings/entities/settings.entity");
const user_preferences_entity_1 = require("../modules/settings/entities/user-preferences.entity");
exports.databaseConfig = {
    type: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'chrono_carto',
    entities: [user_entity_1.User, student_entity_1.Student, parent_entity_1.Parent, parent_student_entity_1.ParentStudent, quiz_entity_1.Quiz, question_entity_1.Question, quiz_attempt_entity_1.QuizAttempt, course_entity_1.Course, settings_entity_1.SystemSettings, user_preferences_entity_1.UserPreferences],
    migrations: ['src/database/migrations/*{.ts,.js}'],
    synchronize: true,
    logging: true,
};
exports.default = new typeorm_1.DataSource(exports.databaseConfig);
//# sourceMappingURL=database.config.js.map