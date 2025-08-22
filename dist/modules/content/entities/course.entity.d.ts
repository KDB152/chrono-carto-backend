export type CourseStatus = 'Publié' | 'Brouillon';
export declare class Course {
    id: number;
    name: string;
    title?: string;
    type: string;
    subject: string;
    level: string;
    size: string;
    upload_date: Date;
    views: number;
    status: CourseStatus;
    description?: string;
    tags?: string[];
    file_name?: string;
    file_url?: string;
}
