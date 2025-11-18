import { MigrationInterface, QueryRunner } from "typeorm";

export class AddVideoSourceColumnToLectureTable1763192873030 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE lectures ADD COLUMN video_sources JSONB
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE lectures DROP COLUMN video_sources     
        `)
    }

}
