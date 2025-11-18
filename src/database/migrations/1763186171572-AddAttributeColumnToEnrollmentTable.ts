import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAttributeColumnToEnrollmentTable1763186171572 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE enrollments ADD COLUMN attributes JSONB
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE DROP COLUMN attributes     
        `)
    }

}
