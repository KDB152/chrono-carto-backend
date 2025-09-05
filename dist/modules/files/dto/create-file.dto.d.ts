export declare class CreateFileDto {
    title: string;
    description?: string;
    fileName: string;
    storedName: string;
    filePath: string;
    fileType: string;
    fileSize: number;
    targetClass: string | string[];
    targetClasses?: string[];
    isPublic?: boolean;
}
