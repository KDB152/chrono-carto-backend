import 'reflect-metadata';
import { DataSource } from 'typeorm';
export declare const databaseConfig: {
    type: "mysql";
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
    entities: string[];
    migrations: string[];
    synchronize: boolean;
    logging: boolean;
    dropSchema: boolean;
    migrationsRun: boolean;
};
declare const _default: DataSource;
export default _default;
