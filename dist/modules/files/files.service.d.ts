import { Repository } from 'typeorm';
import { File } from './entities/file.entity';
export declare class FilesService {
    private fileRepository;
    constructor(fileRepository: Repository<File>);
    findAll({ page, limit, type, category }: {
        page?: number;
        limit?: number;
        type?: string;
        category?: string;
    }): Promise<{
        items: File[];
        total: number;
        page: number;
        limit: number;
    }>;
    findOne(id: number): Promise<File>;
    uploadFile(file: Express.Multer.File, body: any): Promise<File>;
    update(id: number, updateData: any): Promise<File>;
    remove(id: number): Promise<import("typeorm").DeleteResult>;
    getCategories(): Promise<any[]>;
    getFileTypes(): Promise<any[]>;
    bulkDelete(ids: number[]): Promise<import("typeorm").DeleteResult>;
    bulkMove(ids: number[], category: string): Promise<import("typeorm").UpdateResult>;
    searchFiles(query: string): Promise<File[]>;
    getFileStats(): Promise<{
        totalFiles: number;
        totalSize: number;
        categories: {
            category: any;
            count: number;
        }[];
    }>;
    downloadFile(id: number): Promise<{
        path: string;
        filename: string;
        type: string;
    }>;
    shareFile(id: number, users: number[]): Promise<{
        success: boolean;
        sharedWith: number;
    }>;
}
