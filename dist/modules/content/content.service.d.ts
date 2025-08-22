import { Repository } from 'typeorm';
import { Course } from './entities/course.entity';
export declare class ContentService {
    private readonly courseRepo;
    constructor(courseRepo: Repository<Course>);
    listCourses({ page, limit, subject, type, status }: {
        page?: number;
        limit?: number;
        subject?: string;
        type?: string;
        status?: string;
    }): Promise<{
        items: Course[];
        total: number;
        page: number;
        limit: number;
    }>;
    createCourse(payload: Partial<Course>): Promise<Course>;
    updateCourse(id: number, payload: Partial<Course>): Promise<Course>;
    deleteCourse(id: number): Promise<{
        success: boolean;
    }>;
}
