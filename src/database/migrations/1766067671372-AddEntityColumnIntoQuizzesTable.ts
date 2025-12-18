import { MigrationInterface, QueryRunner } from "typeorm";

export class AddEntityColumnIntoQuizzesTable1766067671372 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "quizzes" ADD COLUMN IF NOT EXISTS "entity_id" uuid`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "quizzes" DROP COLUMN IF EXISTS "entity_id"`);
    }

}
