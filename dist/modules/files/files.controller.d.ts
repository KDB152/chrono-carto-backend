import { FilesService } from './files.service';
export declare class FilesController {
    private readonly filesService;
    constructor(filesService: FilesService);
    getAllFiles(page?: string, limit?: string, type?: string, category?: string): Promise<{
        items: import("./entities/file.entity").File[];
        total: number;
        page: number;
        limit: number;
    }>;
    getFile(id: string): Promise<import("./entities/file.entity").File>;
    uploadFile(file: Express.Multer.File, body: any): Promise<import("./entities/file.entity").File>;
    updateFile(id: string, updateData: any): Promise<import("./entities/file.entity").File>;
    deleteFile(id: string): Promise<import("typeorm").DeleteResult>;
    getCategories(): Promise<any[]>;
    getFileTypes(): Promise<any[]>;
    bulkDelete(body: {
        ids: number[];
    }): Promise<import("typeorm").DeleteResult>;
    bulkMove(body: {
        ids: number[];
        category: string;
    }): Promise<import("typeorm").UpdateResult>;
    searchFiles(query: string): Promise<import("./entities/file.entity").File[]>;
    getFileStats(): Promise<{
        totalFiles: number;
        totalSize: number;
        categories: {
            category: any;
            count: number;
        }[];
    }>;
    downloadFile(id: string): Promise<{
        path: string;
        filename: string;
        type: string;
    }>;
    shareFile(id: string, body: {
        users: number[];
    }): Promise<{
        success: boolean;
        sharedWith: number;
    }>;
}
