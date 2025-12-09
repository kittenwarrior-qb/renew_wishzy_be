import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAttributeColumnToEnrollmentTable1763186171572 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Check if column exists before adding
        const columnExists = await queryRunner.query(`
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name = 'enrollments' 
          AND column_name = 'attributes'
        `);

        if (columnExists.length === 0) {
            await queryRunner.query(`
                ALTER TABLE enrollments ADD COLUMN attributes JSONB
            `)
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE enrollments DROP COLUMN IF EXISTS attributes     
        `)
    }

}
