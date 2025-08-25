import { ParentsService } from './parents.service';
import { CreateParentDto } from './dto/create-parent.dto';
import { UpdateParentDto } from './dto/update-parent.dto';
export declare class ParentsController {
    private readonly parentsService;
    constructor(parentsService: ParentsService);
    findAll(page?: string, limit?: string): Promise<{
        items: {
            id: number;
            firstName: string;
            lastName: string;
            email: string;
            phoneNumber: string;
            address: string;
            occupation: string;
            role: string;
            isActive: boolean;
            isApproved: boolean;
            createdAt: string;
            notes: string;
        }[];
        total: number;
        page: number;
        limit: number;
    }>;
    findByUserId(userId: string): Promise<{
        id: number;
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
        address: string;
        occupation: string;
        role: string;
        isActive: boolean;
        isApproved: boolean;
        createdAt: string;
    }>;
    findOne(id: string): Promise<import("./entities/parent.entity").Parent>;
    create(dto: CreateParentDto): Promise<import("./entities/parent.entity").Parent>;
    update(id: string, dto: UpdateParentDto): Promise<import("./entities/parent.entity").Parent>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
}
