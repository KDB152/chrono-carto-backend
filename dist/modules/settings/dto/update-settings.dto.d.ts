export declare class UpdateSystemSettingsDto {
    key: string;
    value: string;
    category?: string;
    description?: string;
    is_encrypted?: boolean;
}
export declare class UpdateUserPreferencesDto {
    key: string;
    value: string;
    category?: string;
}
export declare class BulkUpdateSettingsDto {
    settings: UpdateSystemSettingsDto[];
}
export declare class BulkUpdateUserPreferencesDto {
    preferences: UpdateUserPreferencesDto[];
}
