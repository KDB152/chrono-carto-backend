import { MigrationInterface, QueryRunner } from "typeorm";
export declare class UpdateClassLevelToEnum1734444800000 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
