import { FilesService } from './files.service';
export declare class FilesTestController {
    private readonly filesService;
    constructor(filesService: FilesService);
    testEndpoint(): Promise<{
        message: string;
        timestamp: string;
        filesCount: number;
    }>;
    getAvailableClasses(): Promise<string[]>;
    getStats(): Promise<{
        totalFiles: number;
        totalDownloads: number;
        filesByClass: {
            [key: string]: number;
        };
    }>;
}
