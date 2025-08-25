import { Repository } from 'typeorm';
import { SystemSettings } from './entities/settings.entity';
import { UserPreferences } from './entities/user-preferences.entity';
import { BulkUpdateSettingsDto, BulkUpdateUserPreferencesDto } from './dto/update-settings.dto';
export declare class SettingsService {
    private readonly systemSettingsRepository;
    private readonly userPreferencesRepository;
    constructor(systemSettingsRepository: Repository<SystemSettings>, userPreferencesRepository: Repository<UserPreferences>);
    getSystemSetting(key: string): Promise<string | null>;
    setSystemSetting(key: string, value: string, category?: string, description?: string, isEncrypted?: boolean): Promise<SystemSettings>;
    getSystemSettingsByCategory(category: string): Promise<SystemSettings[]>;
    getAllSystemSettings(): Promise<SystemSettings[]>;
    bulkUpdateSystemSettings(bulkDto: BulkUpdateSettingsDto): Promise<SystemSettings[]>;
    deleteSystemSetting(key: string): Promise<boolean>;
    getUserPreference(userId: number, key: string): Promise<string | null>;
    setUserPreference(userId: number, key: string, value: string, category?: string): Promise<UserPreferences>;
    getUserPreferencesByCategory(userId: number, category: string): Promise<UserPreferences[]>;
    getAllUserPreferences(userId: number): Promise<UserPreferences[]>;
    bulkUpdateUserPreferences(userId: number, bulkDto: BulkUpdateUserPreferencesDto): Promise<UserPreferences[]>;
    deleteUserPreference(userId: number, key: string): Promise<boolean>;
    getSystemSettingsAsObject(): Promise<Record<string, any>>;
    getUserPreferencesAsObject(userId: number): Promise<Record<string, any>>;
    initializeDefaultSettings(): Promise<void>;
}
