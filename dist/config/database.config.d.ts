import 'reflect-metadata';
import { User } from '../modules/users/entities/user.entity';
export declare const databaseConfig: {
    type: "mysql";
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
    entities: (typeof User)[];
    migrations: string[];
    synchronize: boolean;
    logging: boolean;
};
