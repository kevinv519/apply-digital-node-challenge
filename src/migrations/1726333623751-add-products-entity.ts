import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProductsEntity1726333623751 implements MigrationInterface {
  name = 'AddProductsEntity1726333623751';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "product" (
                "id" uuid NOT NULL,
                "contentful_id" character varying NOT NULL,
                "sku" character varying NOT NULL,
                "name" character varying NOT NULL,
                "brand" character varying NOT NULL,
                "model" character varying NOT NULL,
                "category" character varying NOT NULL,
                "color" character varying NOT NULL,
                "price" integer NOT NULL,
                "currency" character varying NOT NULL,
                "stock" integer NOT NULL,
                "created_at" TIMESTAMP NOT NULL,
                "updated_at" TIMESTAMP NOT NULL,
                "deleted_at" TIMESTAMP,
                CONSTRAINT "UQ_0efcc2b9247a20d0e865ec90419" UNIQUE ("contentful_id"),
                CONSTRAINT "UQ_34f6ca1cd897cc926bdcca1ca39" UNIQUE ("sku"),
                CONSTRAINT "PK_bebc9158e480b949565b4dc7a82" PRIMARY KEY ("id")
            )
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP TABLE "product"
        `);
  }
}
