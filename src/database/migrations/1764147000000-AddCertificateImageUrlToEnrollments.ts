import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCertificateImageUrlToEnrollments1764147000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "enrollments" 
      ADD COLUMN "certificate_image_url" character varying(500)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "enrollments" 
      DROP COLUMN "certificate_image_url"
    `);
  }
}
