"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResetPasswordDto = exports.VerifyPasswordResetCodeDto = exports.SendPasswordResetDto = exports.VerifyTokenDto = exports.VerifyCodeDto = exports.SendVerificationCodeDto = void 0;
const class_validator_1 = require("class-validator");
class SendVerificationCodeDto {
}
exports.SendVerificationCodeDto = SendVerificationCodeDto;
__decorate([
    (0, class_validator_1.IsEmail)({}, { message: 'Email invalide' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Email requis' }),
    __metadata("design:type", String)
], SendVerificationCodeDto.prototype, "email", void 0);
class VerifyCodeDto {
}
exports.VerifyCodeDto = VerifyCodeDto;
__decorate([
    (0, class_validator_1.IsEmail)({}, { message: 'Email invalide' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Email requis' }),
    __metadata("design:type", String)
], VerifyCodeDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'Code doit être une chaîne de caractères' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Code requis' }),
    (0, class_validator_1.Length)(6, 6, { message: 'Code doit contenir exactement 6 caractères' }),
    __metadata("design:type", String)
], VerifyCodeDto.prototype, "code", void 0);
class VerifyTokenDto {
}
exports.VerifyTokenDto = VerifyTokenDto;
__decorate([
    (0, class_validator_1.IsString)({ message: 'Token doit être une chaîne de caractères' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Token requis' }),
    __metadata("design:type", String)
], VerifyTokenDto.prototype, "token", void 0);
class SendPasswordResetDto {
}
exports.SendPasswordResetDto = SendPasswordResetDto;
__decorate([
    (0, class_validator_1.IsEmail)({}, { message: 'Email invalide' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Email requis' }),
    __metadata("design:type", String)
], SendPasswordResetDto.prototype, "email", void 0);
class VerifyPasswordResetCodeDto {
}
exports.VerifyPasswordResetCodeDto = VerifyPasswordResetCodeDto;
__decorate([
    (0, class_validator_1.IsEmail)({}, { message: 'Email invalide' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Email requis' }),
    __metadata("design:type", String)
], VerifyPasswordResetCodeDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'Code doit être une chaîne de caractères' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Code requis' }),
    (0, class_validator_1.Length)(6, 6, { message: 'Code doit contenir exactement 6 caractères' }),
    __metadata("design:type", String)
], VerifyPasswordResetCodeDto.prototype, "code", void 0);
class ResetPasswordDto {
}
exports.ResetPasswordDto = ResetPasswordDto;
__decorate([
    (0, class_validator_1.IsString)({ message: 'Token doit être une chaîne de caractères' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Token requis' }),
    __metadata("design:type", String)
], ResetPasswordDto.prototype, "token", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'Mot de passe doit être une chaîne de caractères' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Nouveau mot de passe requis' }),
    (0, class_validator_1.Length)(8, 100, { message: 'Mot de passe doit contenir entre 8 et 100 caractères' }),
    __metadata("design:type", String)
], ResetPasswordDto.prototype, "newPassword", void 0);
//# sourceMappingURL=verify-email.dto.js.map