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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsController = void 0;
const common_1 = require("@nestjs/common");
const settings_service_1 = require("./settings.service");
const update_settings_dto_1 = require("./dto/update-settings.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
let SettingsController = class SettingsController {
    constructor(settingsService) {
        this.settingsService = settingsService;
    }
    async getAllSystemSettings() {
        return this.settingsService.getAllSystemSettings();
    }
    async getSystemSettingsAsObject() {
        return this.settingsService.getSystemSettingsAsObject();
    }
    async getSystemSetting(key) {
        const value = await this.settingsService.getSystemSetting(key);
        return { key, value };
    }
    async getSystemSettingsByCategory(category) {
        return this.settingsService.getSystemSettingsByCategory(category);
    }
    async setSystemSetting(dto) {
        const setting = await this.settingsService.setSystemSetting(dto.key, dto.value, dto.category, dto.description, dto.is_encrypted);
        return setting;
    }
    async bulkUpdateSystemSettings(dto) {
        return this.settingsService.bulkUpdateSystemSettings(dto);
    }
    async updateSystemSetting(key, dto) {
        const setting = await this.settingsService.setSystemSetting(key, dto.value, dto.category, dto.description, dto.is_encrypted);
        return setting;
    }
    async deleteSystemSetting(key) {
        const success = await this.settingsService.deleteSystemSetting(key);
        return { success };
    }
    async getAllUserPreferences(userId) {
        return this.settingsService.getAllUserPreferences(parseInt(userId));
    }
    async getUserPreferencesAsObject(userId) {
        return this.settingsService.getUserPreferencesAsObject(parseInt(userId));
    }
    async getUserPreference(userId, key) {
        const value = await this.settingsService.getUserPreference(parseInt(userId), key);
        return { key, value };
    }
    async getUserPreferencesByCategory(userId, category) {
        return this.settingsService.getUserPreferencesByCategory(parseInt(userId), category);
    }
    async setUserPreference(userId, dto) {
        const preference = await this.settingsService.setUserPreference(parseInt(userId), dto.key, dto.value, dto.category);
        return preference;
    }
    async bulkUpdateUserPreferences(userId, dto) {
        return this.settingsService.bulkUpdateUserPreferences(parseInt(userId), dto);
    }
    async updateUserPreference(userId, key, dto) {
        const preference = await this.settingsService.setUserPreference(parseInt(userId), key, dto.value, dto.category);
        return preference;
    }
    async deleteUserPreference(userId, key) {
        const success = await this.settingsService.deleteUserPreference(parseInt(userId), key);
        return { success };
    }
    async initializeDefaultSettings() {
        await this.settingsService.initializeDefaultSettings();
        return { message: 'Paramètres système initialisés avec succès' };
    }
};
exports.SettingsController = SettingsController;
__decorate([
    (0, common_1.Get)('system'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SettingsController.prototype, "getAllSystemSettings", null);
__decorate([
    (0, common_1.Get)('system/object'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SettingsController.prototype, "getSystemSettingsAsObject", null);
__decorate([
    (0, common_1.Get)('system/:key'),
    __param(0, (0, common_1.Param)('key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SettingsController.prototype, "getSystemSetting", null);
__decorate([
    (0, common_1.Get)('system/category/:category'),
    __param(0, (0, common_1.Param)('category')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SettingsController.prototype, "getSystemSettingsByCategory", null);
__decorate([
    (0, common_1.Post)('system'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_settings_dto_1.UpdateSystemSettingsDto]),
    __metadata("design:returntype", Promise)
], SettingsController.prototype, "setSystemSetting", null);
__decorate([
    (0, common_1.Post)('system/bulk'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_settings_dto_1.BulkUpdateSettingsDto]),
    __metadata("design:returntype", Promise)
], SettingsController.prototype, "bulkUpdateSystemSettings", null);
__decorate([
    (0, common_1.Patch)('system/:key'),
    __param(0, (0, common_1.Param)('key')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_settings_dto_1.UpdateSystemSettingsDto]),
    __metadata("design:returntype", Promise)
], SettingsController.prototype, "updateSystemSetting", null);
__decorate([
    (0, common_1.Delete)('system/:key'),
    __param(0, (0, common_1.Param)('key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SettingsController.prototype, "deleteSystemSetting", null);
__decorate([
    (0, common_1.Get)('user/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SettingsController.prototype, "getAllUserPreferences", null);
__decorate([
    (0, common_1.Get)('user/:userId/object'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SettingsController.prototype, "getUserPreferencesAsObject", null);
__decorate([
    (0, common_1.Get)('user/:userId/:key'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Param)('key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], SettingsController.prototype, "getUserPreference", null);
__decorate([
    (0, common_1.Get)('user/:userId/category/:category'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Param)('category')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], SettingsController.prototype, "getUserPreferencesByCategory", null);
__decorate([
    (0, common_1.Post)('user/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_settings_dto_1.UpdateUserPreferencesDto]),
    __metadata("design:returntype", Promise)
], SettingsController.prototype, "setUserPreference", null);
__decorate([
    (0, common_1.Post)('user/:userId/bulk'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_settings_dto_1.BulkUpdateUserPreferencesDto]),
    __metadata("design:returntype", Promise)
], SettingsController.prototype, "bulkUpdateUserPreferences", null);
__decorate([
    (0, common_1.Patch)('user/:userId/:key'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Param)('key')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, update_settings_dto_1.UpdateUserPreferencesDto]),
    __metadata("design:returntype", Promise)
], SettingsController.prototype, "updateUserPreference", null);
__decorate([
    (0, common_1.Delete)('user/:userId/:key'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Param)('key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], SettingsController.prototype, "deleteUserPreference", null);
__decorate([
    (0, common_1.Post)('system/initialize'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SettingsController.prototype, "initializeDefaultSettings", null);
exports.SettingsController = SettingsController = __decorate([
    (0, common_1.Controller)('settings'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [settings_service_1.SettingsService])
], SettingsController);
//# sourceMappingURL=settings.controller.js.map