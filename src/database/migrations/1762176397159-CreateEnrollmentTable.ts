import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateEnrollmentTable1762176397159 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "enrollments" (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID NOT NULL,
            course_id UUID NOT NULL,
            detail_order_id UUID NOT NULL,
            enrollment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            status VARCHAR(100) CHECK ("status" IN ('not_started', 'ongoing', 'completed')) DEFAULT 'not_started',
            progress DECIMAL(5,2) DEFAULT 0.00,
            last_access TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            certificate_url VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT "fk_enrollment_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT,
            CONSTRAINT "fk_enrollment_course" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE RESTRICT,
            CONSTRAINT "fk_enrollment_detail_order" FOREIGN KEY ("detail_order_id") REFERENCES "detail_orders"("id") ON DELETE RESTRICT
        )`,
    );

    await queryRunner.query(`
        CREATE INDEX IF NOT EXISTS "idx_enrollments_id" ON "enrollments"("id")
    `);

    await queryRunner.query(`
        CREATE INDEX IF NOT EXISTS "idx_enrollments_user_id" ON "enrollments"("user_id")
    `);

    await queryRunner.query(`
        CREATE INDEX IF NOT EXISTS "idx_enrollments_course_id" ON "enrollments"("course_id")
    `);

    await queryRunner.query(`
        CREATE INDEX IF NOT EXISTS "idx_enrollments_detail_order_id" ON "enrollments"("detail_order_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_enrollments_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_enrollments_user_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_enrollments_course_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_enrollments_detail_order_id"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "enrollments"`);
  }
}
