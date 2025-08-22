import { Repository } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
export declare class UsersService {
    private readonly usersRepository;
    constructor(usersRepository: Repository<User>);
    createUser(data: {
        email: string;
        password: string;
        first_name?: string;
        last_name?: string;
        role?: UserRole;
        is_approved?: boolean;
    }): Promise<User>;
    findByEmail(email: string): Promise<User | null>;
    findAll(): Promise<User[]>;
    findById(id: number): Promise<User | null>;
    update(id: number, data: Partial<User>): Promise<User>;
    remove(id: number): Promise<{
        success: boolean;
    }>;
}
