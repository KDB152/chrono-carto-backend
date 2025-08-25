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
exports.SettingsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const settings_entity_1 = require("./entities/settings.entity");
const user_preferences_entity_1 = require("./entities/user-preferences.entity");
let SettingsService = class SettingsService {
    constructor(systemSettingsRepository, userPreferencesRepository) {
        this.systemSettingsRepository = systemSettingsRepository;
        this.userPreferencesRepository = userPreferencesRepository;
    }
    async getSystemSetting(key) {
        const setting = await this.systemSettingsRepository.findOne({ where: { key } });
        return setting ? setting.value : null;
    }
    async setSystemSetting(key, value, category, description, isEncrypted = false) {
        let setting = await this.systemSettingsRepository.findOne({ where: { key } });
        if (setting) {
            setting.value = value;
            if (category)
                setting.category = category;
            if (description)
                setting.description = description;
            setting.is_encrypted = isEncrypted;
            return this.systemSettingsRepository.save(setting);
        }
        else {
            setting = this.systemSettingsRepository.create({
                key,
                value,
                category,
                description,
                is_encrypted: isEncrypted,
            });
            return this.systemSettingsRepository.save(setting);
        }
    }
    async getSystemSettingsByCategory(category) {
        return this.systemSettingsRepository.find({ where: { category } });
    }
    async getAllSystemSettings() {
        return this.systemSettingsRepository.find();
    }
    async bulkUpdateSystemSettings(bulkDto) {
        const results = [];
        for (const settingDto of bulkDto.settings) {
            const setting = await this.setSystemSetting(settingDto.key, settingDto.value, settingDto.category, settingDto.description, settingDto.is_encrypted);
            results.push(setting);
        }
        return results;
    }
    async deleteSystemSetting(key) {
        const result = await this.systemSettingsRepository.delete({ key });
        return result.affected > 0;
    }
    async getUserPreference(userId, key) {
        const preference = await this.userPreferencesRepository.findOne({
            where: { user_id: userId, key }
        });
        return preference ? preference.value : null;
    }
    async setUserPreference(userId, key, value, category) {
        let preference = await this.userPreferencesRepository.findOne({
            where: { user_id: userId, key }
        });
        if (preference) {
            preference.value = value;
            if (category)
                preference.category = category;
            return this.userPreferencesRepository.save(preference);
        }
        else {
            preference = this.userPreferencesRepository.create({
                user_id: userId,
                key,
                value,
                category,
            });
            return this.userPreferencesRepository.save(preference);
        }
    }
    async getUserPreferencesByCategory(userId, category) {
        return this.userPreferencesRepository.find({
            where: { user_id: userId, category }
        });
    }
    async getAllUserPreferences(userId) {
        return this.userPreferencesRepository.find({
            where: { user_id: userId }
        });
    }
    async bulkUpdateUserPreferences(userId, bulkDto) {
        const results = [];
        for (const prefDto of bulkDto.preferences) {
            const preference = await this.setUserPreference(userId, prefDto.key, prefDto.value, prefDto.category);
            results.push(preference);
        }
        return results;
    }
    async deleteUserPreference(userId, key) {
        const result = await this.userPreferencesRepository.delete({
            user_id: userId,
            key
        });
        return result.affected > 0;
    }
    async getSystemSettingsAsObject() {
        const settings = await this.getAllSystemSettings();
        const result = {};
        for (const setting of settings) {
            try {
                result[setting.key] = JSON.parse(setting.value);
            }
            catch {
                result[setting.key] = setting.value;
            }
        }
        return result;
    }
    async getUserPreferencesAsObject(userId) {
        const preferences = await this.getAllUserPreferences(userId);
        const result = {};
        for (const preference of preferences) {
            try {
                result[preference.key] = JSON.parse(preference.value);
            }
            catch {
                result[preference.key] = preference.value;
            }
        }
        return result;
    }
    async initializeDefaultSettings() {
        const defaultSettings = [
            {
                key: 'site.name',
                value: 'Chrono-Carto',
                category: 'general',
                description: 'Nom du site'
            },
            {
                key: 'site.description',
                value: 'Plateforme pédagogique pour l\'Histoire-Géographie',
                category: 'general',
                description: 'Description du site'
            },
            {
                key: 'site.url',
                value: 'https://chronocarto.fr',
                category: 'general',
                description: 'URL du site'
            },
            {
                key: 'site.admin_email',
                value: 'admin@chronocarto.fr',
                category: 'general',
                description: 'Email administrateur'
            },
            {
                key: 'site.timezone',
                value: 'Europe/Paris',
                category: 'general',
                description: 'Fuseau horaire'
            },
            {
                key: 'site.language',
                value: 'fr',
                category: 'general',
                description: 'Langue par défaut'
            },
            {
                key: 'security.enable_two_factor',
                value: 'true',
                category: 'security',
                description: 'Activer l\'authentification à deux facteurs'
            },
            {
                key: 'security.session_timeout',
                value: '30',
                category: 'security',
                description: 'Délai d\'expiration de session (minutes)'
            },
            {
                key: 'security.max_login_attempts',
                value: '5',
                category: 'security',
                description: 'Nombre maximum de tentatives de connexion'
            },
            {
                key: 'security.password_min_length',
                value: '8',
                category: 'security',
                description: 'Longueur minimale du mot de passe'
            },
            {
                key: 'notifications.email',
                value: 'true',
                category: 'notifications',
                description: 'Activer les notifications par email'
            },
            {
                key: 'notifications.sms',
                value: 'false',
                category: 'notifications',
                description: 'Activer les notifications par SMS'
            },
            {
                key: 'notifications.push',
                value: 'true',
                category: 'notifications',
                description: 'Activer les notifications push'
            },
            {
                key: 'appearance.theme',
                value: 'dark',
                category: 'appearance',
                description: 'Thème par défaut'
            },
            {
                key: 'appearance.primary_color',
                value: '#3B82F6',
                category: 'appearance',
                description: 'Couleur primaire'
            },
            {
                key: 'storage.max_file_size',
                value: '100',
                category: 'storage',
                description: 'Taille maximale des fichiers (MB)'
            },
            {
                key: 'storage.allowed_file_types',
                value: JSON.stringify(['pdf', 'doc', 'docx', 'ppt', 'pptx', 'mp4', 'avi', 'mov']),
                category: 'storage',
                description: 'Types de fichiers autorisés'
            }
        ];
        for (const setting of defaultSettings) {
            await this.setSystemSetting(setting.key, setting.value, setting.category, setting.description);
        }
    }
};
exports.SettingsService = SettingsService;
exports.SettingsService = SettingsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(settings_entity_1.SystemSettings)),
    __param(1, (0, typeorm_1.InjectRepository)(user_preferences_entity_1.UserPreferences)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], SettingsService);
//# sourceMappingURL=settings.service.js.map