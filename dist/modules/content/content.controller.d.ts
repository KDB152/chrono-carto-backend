import { ContentService } from './content.service';
export declare class ContentController {
    private readonly contentService;
    constructor(contentService: ContentService);
    listCourses(page?: string, limit?: string, subject?: string, type?: string, status?: string): Promise<{
        items: import("./entities/course.entity").Course[];
        total: number;
        page: number;
        limit: number;
    }>;
    createCourse(body: any): Promise<import("./entities/course.entity").Course>;
    updateCourse(id: string, body: any): Promise<import("./entities/course.entity").Course>;
    deleteCourse(id: string): Promise<{
        success: boolean;
    }>;
}
