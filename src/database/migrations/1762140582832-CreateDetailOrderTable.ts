import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateDetailOrderTable1762140582832 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "detail_orders" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "course_id" uuid NOT NULL,
        "order_id" uuid NOT NULL,
        "price" numeric NOT NULL,
        "created_at" timestamp NOT NULL DEFAULT now(),
        "updated_at" timestamp NOT NULL DEFAULT now(),
        "deleted_at" timestamp,
        CONSTRAINT "PK_detail_orders" PRIMARY KEY ("id"),
        CONSTRAINT "FK_detail_orders_courses" FOREIGN KEY ("course_id") REFERENCES "courses" ("id") ON DELETE CASCADE,
        CONSTRAINT "FK_detail_orders_orders" FOREIGN KEY ("order_id") REFERENCES "orders" ("id") ON DELETE CASCADE
      )`,
    );

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_detail_orders_course_id" ON "detail_orders" ("course_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_detail_orders_order_id" ON "detail_orders" ("order_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_detail_orders_course_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_detail_orders_order_id"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "detail_orders"`);
  }
}
