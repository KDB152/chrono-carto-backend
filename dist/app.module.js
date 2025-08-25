"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const database_config_1 = require("./config/database.config");
const auth_module_1 = require("./modules/auth/auth.module");
const users_module_1 = require("./modules/users/users.module");
const students_module_1 = require("./modules/students/students.module");
const parents_module_1 = require("./modules/parents/parents.module");
const relations_module_1 = require("./modules/relations/relations.module");
const quizzes_module_1 = require("./modules/quizzes/quizzes.module");
const admin_module_1 = require("./modules/admin/admin.module");
const content_module_1 = require("./modules/content/content.module");
const messaging_module_1 = require("./modules/messaging/messaging.module");
const settings_module_1 = require("./modules/settings/settings.module");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forRoot({
                ...database_config_1.databaseConfig,
                autoLoadEntities: true,
            }),
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            students_module_1.StudentsModule,
            parents_module_1.ParentsModule,
            relations_module_1.RelationsModule,
            quizzes_module_1.QuizzesModule,
            admin_module_1.AdminModule,
            content_module_1.ContentModule,
            messaging_module_1.MessagingModule,
            settings_module_1.SettingsModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map