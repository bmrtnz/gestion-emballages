import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameGlobalOrderToMasterOrder1754644200000 implements MigrationInterface {
  name = 'RenameGlobalOrderToMasterOrder1754644200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Rename the global_orders table to master_orders
    await queryRunner.query(`ALTER TABLE "global_orders" RENAME TO "master_orders"`);

    // 2. Rename the reference_globale column to reference_master
    await queryRunner.query(`ALTER TABLE "master_orders" RENAME COLUMN "reference_globale" TO "reference_master"`);

    // 3. Update the PurchaseOrder table to rename global_order_id to master_order_id
    await queryRunner.query(`ALTER TABLE "purchase_orders" RENAME COLUMN "global_order_id" TO "master_order_id"`);

    // 4. Drop and recreate foreign key constraint with new column name
    // First, find the existing constraint name
    await queryRunner.query(`
      ALTER TABLE "purchase_orders" 
      DROP CONSTRAINT IF EXISTS "FK_purchase_orders_global_order_id"
    `);

    // Create new foreign key constraint
    await queryRunner.query(`
      ALTER TABLE "purchase_orders" 
      ADD CONSTRAINT "FK_purchase_orders_master_order_id" 
      FOREIGN KEY ("master_order_id") REFERENCES "master_orders"("id") ON DELETE CASCADE
    `);

    // 5. Update any indexes that might reference the old column name
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_global_orders_reference_globale"`);
    await queryRunner.query(`CREATE UNIQUE INDEX "IDX_master_orders_reference_master" ON "master_orders" ("reference_master")`);

    // 6. Update any other constraints or indexes as needed
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_purchase_orders_global_order_id"`);
    await queryRunner.query(`CREATE INDEX "IDX_purchase_orders_master_order_id" ON "purchase_orders" ("master_order_id")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Reverse all the changes made in up()
    
    // 1. Drop new indexes
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_master_orders_reference_master"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_purchase_orders_master_order_id"`);

    // 2. Drop new foreign key constraint
    await queryRunner.query(`
      ALTER TABLE "purchase_orders" 
      DROP CONSTRAINT IF EXISTS "FK_purchase_orders_master_order_id"
    `);

    // 3. Rename master_order_id back to global_order_id in purchase_orders
    await queryRunner.query(`ALTER TABLE "purchase_orders" RENAME COLUMN "master_order_id" TO "global_order_id"`);

    // 4. Rename reference_master back to reference_globale
    await queryRunner.query(`ALTER TABLE "master_orders" RENAME COLUMN "reference_master" TO "reference_globale"`);

    // 5. Rename master_orders table back to global_orders
    await queryRunner.query(`ALTER TABLE "master_orders" RENAME TO "global_orders"`);

    // 6. Recreate original foreign key constraint
    await queryRunner.query(`
      ALTER TABLE "purchase_orders" 
      ADD CONSTRAINT "FK_purchase_orders_global_order_id" 
      FOREIGN KEY ("global_order_id") REFERENCES "global_orders"("id") ON DELETE CASCADE
    `);

    // 7. Recreate original indexes
    await queryRunner.query(`CREATE UNIQUE INDEX "IDX_global_orders_reference_globale" ON "global_orders" ("reference_globale")`);
    await queryRunner.query(`CREATE INDEX "IDX_purchase_orders_global_order_id" ON "purchase_orders" ("global_order_id")`);
  }
}