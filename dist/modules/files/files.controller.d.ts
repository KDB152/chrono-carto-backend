import { Response } from 'express';
import { FilesService } from './files.service';
import { CreateFileDto } from './dto/create-file.dto';
import { UpdateFileDto } from './dto/update-file.dto';
import { File } from './entities/file.entity';
export declare class FilesController {
    private readonly filesService;
    constructor(filesService: FilesService);
    create(createFileDto: CreateFileDto, req: any): Promise<File>;
    uploadFile(file: Express.Multer.File, title: string, description: string, targetClass: string, req: any): Promise<{
        success: boolean;
        file: File;
        filePath: string;
    }>;
    findAll(req: any, targetClass?: string): Promise<File[]>;
    getStats(req: any): Promise<{
        totalFiles: number;
        totalDownloads: number;
        filesByClass: {
            [key: string]: number;
        };
    }>;
    getAvailableClasses(): Promise<string[]>;
    findOne(id: string, req: any): Promise<File>;
    download(id: string, res: Response, req: any): Promise<void>;
    update(id: string, updateFileDto: UpdateFileDto, req: any): Promise<File>;
    remove(id: string, req: any): Promise<{
        message: string;
    }>;
}
