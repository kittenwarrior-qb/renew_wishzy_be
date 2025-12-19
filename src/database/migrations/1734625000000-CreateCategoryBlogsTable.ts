import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCategoryBlogsTable1734625000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
        CREATE TABLE IF NOT EXISTS "category_blogs" (
            "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            "name" VARCHAR(255) NOT NULL,
            "description" TEXT,
            "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "deleted_at" TIMESTAMP
        )
    `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('DROP TABLE IF EXISTS "category_blogs"');
    }
}
