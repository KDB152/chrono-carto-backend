import { Repository } from 'typeorm';
import { Parent } from './entities/parent.entity';
export declare class ParentsService {
    private parentsRepository;
    findByUserId(userId: number): Promise<Parent | null>;
    constructor(parentsRepository: Repository<Parent>);
    createParent(userId: number, phone?: string): Promise<Parent>;
}
