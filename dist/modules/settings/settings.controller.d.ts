import { SettingsService } from './settings.service';
import { UpdateSystemSettingsDto, UpdateUserPreferencesDto, BulkUpdateSettingsDto, BulkUpdateUserPreferencesDto } from './dto/update-settings.dto';
export declare class SettingsController {
    private readonly settingsService;
    constructor(settingsService: SettingsService);
    getAllSystemSettings(): Promise<import("./entities/settings.entity").SystemSettings[]>;
    getSystemSettingsAsObject(): Promise<Record<string, any>>;
    getSystemSetting(key: string): Promise<{
        key: string;
        value: string;
    }>;
    getSystemSettingsByCategory(category: string): Promise<import("./entities/settings.entity").SystemSettings[]>;
    setSystemSetting(dto: UpdateSystemSettingsDto): Promise<import("./entities/settings.entity").SystemSettings>;
    bulkUpdateSystemSettings(dto: BulkUpdateSettingsDto): Promise<import("./entities/settings.entity").SystemSettings[]>;
    updateSystemSetting(key: string, dto: UpdateSystemSettingsDto): Promise<import("./entities/settings.entity").SystemSettings>;
    deleteSystemSetting(key: string): Promise<{
        success: boolean;
    }>;
    getAllUserPreferences(userId: string): Promise<import("./entities/user-preferences.entity").UserPreferences[]>;
    getUserPreferencesAsObject(userId: string): Promise<Record<string, any>>;
    getUserPreference(userId: string, key: string): Promise<{
        key: string;
        value: string;
    }>;
    getUserPreferencesByCategory(userId: string, category: string): Promise<import("./entities/user-preferences.entity").UserPreferences[]>;
    setUserPreference(userId: string, dto: UpdateUserPreferencesDto): Promise<import("./entities/user-preferences.entity").UserPreferences>;
    bulkUpdateUserPreferences(userId: string, dto: BulkUpdateUserPreferencesDto): Promise<import("./entities/user-preferences.entity").UserPreferences[]>;
    updateUserPreference(userId: string, key: string, dto: UpdateUserPreferencesDto): Promise<import("./entities/user-preferences.entity").UserPreferences>;
    deleteUserPreference(userId: string, key: string): Promise<{
        success: boolean;
    }>;
    initializeDefaultSettings(): Promise<{
        message: string;
    }>;
}
