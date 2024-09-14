import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterProductTableUpdateIdAndPriceColumns1726343053425 implements MigrationInterface {
  name = 'AlterProductTableUpdateIdAndPriceColumns1726343053425';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "product"
            ALTER COLUMN "id"
            SET DEFAULT uuid_generate_v4()
        `);
    await queryRunner.query(`
            ALTER TABLE "product"
            ALTER COLUMN "price"
            SET DATA TYPE numeric
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "product"
        ALTER COLUMN "price"
        SET DATA TYPE integer
    `);
    await queryRunner.query(`
            ALTER TABLE "product"
            ALTER COLUMN "id" DROP DEFAULT
        `);
  }
}
