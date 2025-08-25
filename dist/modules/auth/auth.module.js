"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const jwt_1 = require("@nestjs/jwt");
const passport_1 = require("@nestjs/passport");
const auth_service_1 = require("./auth.service");
const auth_controller_1 = require("./auth.controller");
const email_verification_service_1 = require("./email-verification.service");
const jwt_strategy_1 = require("./strategies/jwt.strategy");
const users_module_1 = require("../users/users.module");
const students_module_1 = require("../students/students.module");
const parents_module_1 = require("../parents/parents.module");
const relations_module_1 = require("../relations/relations.module");
const user_entity_1 = require("../users/entities/user.entity");
let AuthModule = class AuthModule {
};
exports.AuthModule = AuthModule;
exports.AuthModule = AuthModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([user_entity_1.User]),
            users_module_1.UsersModule,
            students_module_1.StudentsModule,
            parents_module_1.ParentsModule,
            relations_module_1.RelationsModule,
            passport_1.PassportModule,
            jwt_1.JwtModule.register({
                secret: 'PHGv74WOiaVZxGXF8pwJn3XeSmza3byS',
                signOptions: { expiresIn: '1h' },
            }),
        ],
        providers: [auth_service_1.AuthService, email_verification_service_1.EmailVerificationService, jwt_strategy_1.JwtStrategy],
        controllers: [auth_controller_1.AuthController],
        exports: [email_verification_service_1.EmailVerificationService, auth_service_1.AuthService, jwt_strategy_1.JwtStrategy],
    })
], AuthModule);
//# sourceMappingURL=auth.module.js.map