import { User } from '../../users/entities/user.entity';
export declare class File {
    id: number;
    title: string;
    description: string;
    fileName: string;
    storedName: string;
    filePath: string;
    fileType: string;
    fileSize: number;
    targetClass: string;
    uploadedBy: number;
    isPublic: boolean;
    isActive: boolean;
    downloadCount: number;
    createdAt: Date;
    updatedAt: Date;
    uploader: User;
}
