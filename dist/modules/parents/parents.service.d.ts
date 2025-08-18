import { Repository } from 'typeorm';
import { Parent } from './entities/parent.entity';
export declare class ParentsService {
    private parentsRepository;
    constructor(parentsRepository: Repository<Parent>);
    createParent(userId: number, phone?: string): Promise<Parent>;
}
