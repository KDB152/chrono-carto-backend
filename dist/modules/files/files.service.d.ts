import { Repository } from 'typeorm';
import { File } from './entities/file.entity';
import { CreateFileDto } from './dto/create-file.dto';
import { UpdateFileDto } from './dto/update-file.dto';
export declare class FilesService {
    private filesRepository;
    constructor(filesRepository: Repository<File>);
    create(createFileDto: CreateFileDto, uploadedBy: number): Promise<File>;
    findAll(): Promise<File[]>;
    findByClass(targetClass: string): Promise<File[]>;
    findOne(id: number): Promise<File>;
    update(id: number, updateFileDto: UpdateFileDto): Promise<File>;
    remove(id: number): Promise<void>;
    incrementDownloadCount(id: number): Promise<void>;
    getFilesByUserClass(userClass: string): Promise<File[]>;
    getAvailableClasses(): Promise<string[]>;
    getFileStats(): Promise<{
        totalFiles: number;
        totalDownloads: number;
        filesByClass: {
            [key: string]: number;
        };
    }>;
}
