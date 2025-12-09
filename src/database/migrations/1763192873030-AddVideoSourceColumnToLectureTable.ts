import { MigrationInterface, QueryRunner } from "typeorm";

export class AddVideoSourceColumnToLectureTable1763192873030 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Check if column exists before adding
        const columnExists = await queryRunner.query(`
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name = 'lectures' 
          AND column_name = 'video_sources'
        `);

        if (columnExists.length === 0) {
            await queryRunner.query(`
                ALTER TABLE lectures ADD COLUMN video_sources JSONB
            `)
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE lectures DROP COLUMN IF EXISTS video_sources     
        `)
    }

}
