import { MigrationInterface, QueryRunner } from 'typeorm';

export class RefactorToEnglish1704000003 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Step 1: Rename tables to English names
    await queryRunner.query(`ALTER TABLE "articles" RENAME TO "products"`);
    await queryRunner.query(`ALTER TABLE "articles_fournisseurs" RENAME TO "products_suppliers"`);
    await queryRunner.query(`ALTER TABLE "commandes" RENAME TO "orders"`);
    await queryRunner.query(`ALTER TABLE "commandes_articles" RENAME TO "orders_products"`);
    await queryRunner.query(`ALTER TABLE "commandes_globales" RENAME TO "global_orders"`);
    await queryRunner.query(`ALTER TABLE "fournisseurs" RENAME TO "suppliers"`);
    await queryRunner.query(`ALTER TABLE "fournisseurs_sites" RENAME TO "supplier_sites"`);
    await queryRunner.query(`ALTER TABLE "fournisseur_contacts" RENAME TO "supplier_contacts"`);
    await queryRunner.query(`ALTER TABLE "listes_achat" RENAME TO "shopping_carts"`);
    await queryRunner.query(`ALTER TABLE "listes_achat_items" RENAME TO "shopping_cart_items"`);
    await queryRunner.query(`ALTER TABLE "previsions" RENAME TO "forecasts"`);
    await queryRunner.query(`ALTER TABLE "demandes_transfert" RENAME TO "transfer_requests"`);
    await queryRunner.query(`ALTER TABLE "demandes_transfert_articles" RENAME TO "transfer_request_products"`);
    await queryRunner.query(`ALTER TABLE "stocks_fournisseurs" RENAME TO "stocks_suppliers"`);

    // Step 2: Rename foreign key columns to English names
    
    // Products table
    await queryRunner.query(`ALTER TABLE "products_suppliers" RENAME COLUMN "article_id" TO "product_id"`);
    await queryRunner.query(`ALTER TABLE "products_suppliers" RENAME COLUMN "fournisseur_id" TO "supplier_id"`);

    // Orders tables
    await queryRunner.query(`ALTER TABLE "orders" RENAME COLUMN "fournisseur_id" TO "supplier_id"`);
    await queryRunner.query(`ALTER TABLE "orders_products" RENAME COLUMN "article_id" TO "product_id"`);
    await queryRunner.query(`ALTER TABLE "orders_products" RENAME COLUMN "commande_id" TO "order_id"`);

    // Supplier related tables
    await queryRunner.query(`ALTER TABLE "supplier_sites" RENAME COLUMN "fournisseur_id" TO "supplier_id"`);
    await queryRunner.query(`ALTER TABLE "supplier_contacts" RENAME COLUMN "fournisseur_id" TO "supplier_id"`);

    // Shopping cart tables
    await queryRunner.query(`ALTER TABLE "shopping_cart_items" RENAME COLUMN "liste_achat_id" TO "shopping_cart_id"`);
    await queryRunner.query(`ALTER TABLE "shopping_cart_items" RENAME COLUMN "article_id" TO "product_id"`);

    // Forecasts table
    await queryRunner.query(`ALTER TABLE "forecasts" RENAME COLUMN "article_id" TO "product_id"`);
    await queryRunner.query(`ALTER TABLE "forecasts" RENAME COLUMN "fournisseur_id" TO "supplier_id"`);

    // Transfer tables
    await queryRunner.query(`ALTER TABLE "transfer_request_products" RENAME COLUMN "demande_transfert_id" TO "transfer_request_id"`);
    await queryRunner.query(`ALTER TABLE "transfer_request_products" RENAME COLUMN "article_id" TO "product_id"`);

    // Stock tables
    await queryRunner.query(`ALTER TABLE "stocks_station" RENAME COLUMN "article_id" TO "product_id"`);
    await queryRunner.query(`ALTER TABLE "stocks_suppliers" RENAME COLUMN "article_id" TO "product_id"`);
    await queryRunner.query(`ALTER TABLE "stocks_suppliers" RENAME COLUMN "fournisseur_id" TO "supplier_id"`);
    await queryRunner.query(`ALTER TABLE "stocks_platform" RENAME COLUMN "article_id" TO "product_id"`);

    // Step 3: Update indexes and constraints names if needed
    // (Most databases handle this automatically, but we can be explicit)
    
    // Step 4: Update any remaining references in other tables
    // Handle polymorphic relationships and other references that might exist
    await queryRunner.query(`
      UPDATE users SET entite_type = 'Supplier' WHERE entite_type = 'Fournisseur'
    `);

    // Step 5: Create new indexes for the renamed tables if needed
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_products_code" ON "products" ("code_article")
    `);
    
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_orders_status" ON "orders" ("statut")
    `);
    
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_suppliers_siret" ON "suppliers" ("siret")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Reverse all operations in reverse order
    
    // Drop created indexes
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_products_code"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_orders_status"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_suppliers_siret"`);

    // Revert user entity type changes
    await queryRunner.query(`
      UPDATE users SET entite_type = 'Fournisseur' WHERE entite_type = 'Supplier'
    `);

    // Revert column renames
    await queryRunner.query(`ALTER TABLE "stocks_platform" RENAME COLUMN "product_id" TO "article_id"`);
    await queryRunner.query(`ALTER TABLE "stocks_suppliers" RENAME COLUMN "supplier_id" TO "fournisseur_id"`);
    await queryRunner.query(`ALTER TABLE "stocks_suppliers" RENAME COLUMN "product_id" TO "article_id"`);
    await queryRunner.query(`ALTER TABLE "stocks_station" RENAME COLUMN "product_id" TO "article_id"`);

    await queryRunner.query(`ALTER TABLE "transfer_request_products" RENAME COLUMN "product_id" TO "article_id"`);
    await queryRunner.query(`ALTER TABLE "transfer_request_products" RENAME COLUMN "transfer_request_id" TO "demande_transfert_id"`);

    await queryRunner.query(`ALTER TABLE "forecasts" RENAME COLUMN "supplier_id" TO "fournisseur_id"`);
    await queryRunner.query(`ALTER TABLE "forecasts" RENAME COLUMN "product_id" TO "article_id"`);

    await queryRunner.query(`ALTER TABLE "shopping_cart_items" RENAME COLUMN "product_id" TO "article_id"`);
    await queryRunner.query(`ALTER TABLE "shopping_cart_items" RENAME COLUMN "shopping_cart_id" TO "liste_achat_id"`);

    await queryRunner.query(`ALTER TABLE "supplier_contacts" RENAME COLUMN "supplier_id" TO "fournisseur_id"`);
    await queryRunner.query(`ALTER TABLE "supplier_sites" RENAME COLUMN "supplier_id" TO "fournisseur_id"`);

    await queryRunner.query(`ALTER TABLE "orders_products" RENAME COLUMN "order_id" TO "commande_id"`);
    await queryRunner.query(`ALTER TABLE "orders_products" RENAME COLUMN "product_id" TO "article_id"`);
    await queryRunner.query(`ALTER TABLE "orders" RENAME COLUMN "supplier_id" TO "fournisseur_id"`);

    await queryRunner.query(`ALTER TABLE "products_suppliers" RENAME COLUMN "supplier_id" TO "fournisseur_id"`);
    await queryRunner.query(`ALTER TABLE "products_suppliers" RENAME COLUMN "product_id" TO "article_id"`);

    // Revert table renames
    await queryRunner.query(`ALTER TABLE "stocks_suppliers" RENAME TO "stocks_fournisseurs"`);
    await queryRunner.query(`ALTER TABLE "transfer_request_products" RENAME TO "demandes_transfert_articles"`);
    await queryRunner.query(`ALTER TABLE "transfer_requests" RENAME TO "demandes_transfert"`);
    await queryRunner.query(`ALTER TABLE "forecasts" RENAME TO "previsions"`);
    await queryRunner.query(`ALTER TABLE "shopping_cart_items" RENAME TO "listes_achat_items"`);
    await queryRunner.query(`ALTER TABLE "shopping_carts" RENAME TO "listes_achat"`);
    await queryRunner.query(`ALTER TABLE "supplier_contacts" RENAME TO "fournisseur_contacts"`);
    await queryRunner.query(`ALTER TABLE "supplier_sites" RENAME TO "fournisseurs_sites"`);
    await queryRunner.query(`ALTER TABLE "suppliers" RENAME TO "fournisseurs"`);
    await queryRunner.query(`ALTER TABLE "global_orders" RENAME TO "commandes_globales"`);
    await queryRunner.query(`ALTER TABLE "orders_products" RENAME TO "commandes_articles"`);
    await queryRunner.query(`ALTER TABLE "orders" RENAME TO "commandes"`);
    await queryRunner.query(`ALTER TABLE "products_suppliers" RENAME TO "articles_fournisseurs"`);
    await queryRunner.query(`ALTER TABLE "products" RENAME TO "articles"`);
  }
}