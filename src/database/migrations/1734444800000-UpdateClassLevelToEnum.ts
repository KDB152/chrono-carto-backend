import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateClassLevelToEnum1734444800000 implements MigrationInterface {
    name = 'UpdateClassLevelToEnum1734444800000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Créer l'enum s'il n'existe pas
        await queryRunner.query(`
            CREATE TYPE IF NOT EXISTS enum_students_class_level AS ENUM (
                'Terminale groupe 1',
                'Terminale groupe 2', 
                'Terminale groupe 3',
                'Terminale groupe 4',
                '1ère groupe 1',
                '1ère groupe 2',
                '1ère groupe 3'
            )
        `);

        // Pour MySQL, nous utilisons ENUM directement
        await queryRunner.query(`
            ALTER TABLE students 
            MODIFY COLUMN class_level ENUM(
                'Terminale groupe 1',
                'Terminale groupe 2',
                'Terminale groupe 3', 
                'Terminale groupe 4',
                '1ère groupe 1',
                '1ère groupe 2',
                '1ère groupe 3'
            ) NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Revenir au type VARCHAR
        await queryRunner.query(`
            ALTER TABLE students 
            MODIFY COLUMN class_level VARCHAR(255) NULL
        `);
    }
}
