import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePurchaseOrderAndSalesOrderTables1754644100000 implements MigrationInterface {
    name = 'CreatePurchaseOrderAndSalesOrderTables1754644100000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create purchase_orders table (replaces orders)
        await queryRunner.query(`
            CREATE TABLE "purchase_orders" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "is_active" boolean NOT NULL DEFAULT true,
                "po_number" character varying(100) NOT NULL,
                "global_order_id" uuid,
                "buyer_type" character varying(50) NOT NULL,
                "station_id" uuid,
                "supplier_id" uuid,
                "is_internal_supplier" boolean NOT NULL DEFAULT false,
                "delivery_location_type" character varying(50) NOT NULL,
                "platform_id" uuid,
                "delivery_station_id" uuid,
                "delivery_address" text,
                "status" "order_status_enum" NOT NULL DEFAULT 'ENREGISTREE',
                "total_amount_excluding_tax" numeric(12,2) NOT NULL DEFAULT '0',
                "total_amount_including_tax" numeric(12,2) NOT NULL DEFAULT '0',
                "currency" character varying(3) NOT NULL DEFAULT 'EUR',
                "order_date" date NOT NULL,
                "requested_delivery_date" date,
                "confirmed_delivery_date" date,
                "actual_delivery_date" date,
                "linked_sales_order_id" uuid,
                "notes" text,
                "payment_terms" character varying,
                "created_by" uuid,
                "approved_by" uuid,
                "approved_at" TIMESTAMP,
                CONSTRAINT "PK_purchase_orders" PRIMARY KEY ("id"),
                CONSTRAINT "UQ_purchase_orders_po_number" UNIQUE ("po_number")
            )
        `);

        // Create sales_orders table
        await queryRunner.query(`
            CREATE TABLE "sales_orders" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "is_active" boolean NOT NULL DEFAULT true,
                "so_number" character varying(100) NOT NULL,
                "seller_name" character varying DEFAULT 'Blue Whale',
                "customer_station_id" uuid NOT NULL,
                "customer_po_number" character varying(100) NOT NULL,
                "fulfillment_platform_id" uuid NOT NULL,
                "delivery_address" text NOT NULL,
                "status" "order_status_enum" NOT NULL DEFAULT 'ENREGISTREE',
                "subtotal_amount" numeric(12,2) NOT NULL DEFAULT '0',
                "platform_fees" numeric(12,2) NOT NULL DEFAULT '0',
                "total_amount_excluding_tax" numeric(12,2) NOT NULL DEFAULT '0',
                "tax_amount" numeric(12,2) NOT NULL DEFAULT '0',
                "total_amount_including_tax" numeric(12,2) NOT NULL DEFAULT '0',
                "currency" character varying(3) NOT NULL DEFAULT 'EUR',
                "order_date" date NOT NULL,
                "promised_delivery_date" date,
                "actual_ship_date" date,
                "actual_delivery_date" date,
                "invoice_number" character varying(100),
                "invoice_date" date,
                "invoice_status" character varying(50),
                "payment_due_date" date,
                "payment_received_date" date,
                "picking_list_number" character varying(100),
                "shipping_tracking_number" character varying(200),
                "carrier_name" character varying(100),
                "notes" text,
                "payment_terms" character varying,
                "created_by" uuid,
                "fulfilled_by" uuid,
                "fulfilled_at" TIMESTAMP,
                CONSTRAINT "PK_sales_orders" PRIMARY KEY ("id"),
                CONSTRAINT "UQ_sales_orders_so_number" UNIQUE ("so_number")
            )
        `);

        // Create sales_order_products table
        await queryRunner.query(`
            CREATE TABLE "sales_order_products" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "is_active" boolean NOT NULL DEFAULT true,
                "sales_order_id" uuid NOT NULL,
                "product_id" uuid NOT NULL,
                "line_number" integer NOT NULL,
                "quantity" integer NOT NULL,
                "unit_price" numeric(10,2) NOT NULL,
                "discount_percent" numeric(5,2) NOT NULL DEFAULT '0',
                "discount_amount" numeric(10,2) NOT NULL DEFAULT '0',
                "line_total" numeric(12,2) NOT NULL,
                "tax_rate" numeric(5,2) NOT NULL DEFAULT '20',
                "tax_amount" numeric(10,2) NOT NULL,
                "line_total_with_tax" numeric(12,2) NOT NULL,
                "stock_location" character varying(100),
                "batch_number" character varying(100),
                "expiry_date" date,
                "quantity_shipped" integer NOT NULL DEFAULT '0',
                "quantity_delivered" integer NOT NULL DEFAULT '0',
                "fulfillment_status" character varying(50) NOT NULL DEFAULT 'PENDING',
                "notes" text,
                CONSTRAINT "PK_sales_order_products" PRIMARY KEY ("id")
            )
        `);

        // Rename commande_articles to purchase_order_products and update structure
        await queryRunner.query(`ALTER TABLE "commande_articles" RENAME TO "purchase_order_products"`);
        await queryRunner.query(`ALTER TABLE "purchase_order_products" RENAME COLUMN "order_id" TO "purchase_order_id"`);

        // Add foreign key constraints for purchase_orders
        await queryRunner.query(`
            ALTER TABLE "purchase_orders" 
            ADD CONSTRAINT "FK_purchase_orders_global_order" 
            FOREIGN KEY ("global_order_id") REFERENCES "global_orders"("id") ON DELETE SET NULL ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE "purchase_orders" 
            ADD CONSTRAINT "FK_purchase_orders_station" 
            FOREIGN KEY ("station_id") REFERENCES "stations"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE "purchase_orders" 
            ADD CONSTRAINT "FK_purchase_orders_supplier" 
            FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE "purchase_orders" 
            ADD CONSTRAINT "FK_purchase_orders_platform" 
            FOREIGN KEY ("platform_id") REFERENCES "platforms"("id") ON DELETE SET NULL ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE "purchase_orders" 
            ADD CONSTRAINT "FK_purchase_orders_delivery_station" 
            FOREIGN KEY ("delivery_station_id") REFERENCES "stations"("id") ON DELETE SET NULL ON UPDATE NO ACTION
        `);

        // Add foreign key constraints for sales_orders
        await queryRunner.query(`
            ALTER TABLE "sales_orders" 
            ADD CONSTRAINT "FK_sales_orders_customer_station" 
            FOREIGN KEY ("customer_station_id") REFERENCES "stations"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE "sales_orders" 
            ADD CONSTRAINT "FK_sales_orders_fulfillment_platform" 
            FOREIGN KEY ("fulfillment_platform_id") REFERENCES "platforms"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);

        // Add foreign key constraints for sales_order_products
        await queryRunner.query(`
            ALTER TABLE "sales_order_products" 
            ADD CONSTRAINT "FK_sales_order_products_sales_order" 
            FOREIGN KEY ("sales_order_id") REFERENCES "sales_orders"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE "sales_order_products" 
            ADD CONSTRAINT "FK_sales_order_products_product" 
            FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);

        // Update purchase_order_products foreign key
        await queryRunner.query(`
            ALTER TABLE "purchase_order_products" 
            DROP CONSTRAINT IF EXISTS "FK_commande_articles_order"
        `);

        await queryRunner.query(`
            ALTER TABLE "purchase_order_products" 
            ADD CONSTRAINT "FK_purchase_order_products_purchase_order" 
            FOREIGN KEY ("purchase_order_id") REFERENCES "purchase_orders"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);

        // Create cross-reference between PO and SO
        await queryRunner.query(`
            ALTER TABLE "purchase_orders" 
            ADD CONSTRAINT "FK_purchase_orders_linked_sales_order" 
            FOREIGN KEY ("linked_sales_order_id") REFERENCES "sales_orders"("id") ON DELETE SET NULL ON UPDATE NO ACTION
        `);

        // Drop old orders table (backup data if needed first)
        await queryRunner.query(`DROP TABLE IF EXISTS "orders"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Recreate orders table
        await queryRunner.query(`
            CREATE TABLE "orders" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "is_active" boolean NOT NULL DEFAULT true,
                "order_number" character varying(100) NOT NULL,
                "global_order_id" uuid,
                "station_id" uuid NOT NULL,
                "supplier_id" uuid NOT NULL,
                "platform_id" uuid,
                "is_platform_delivery" boolean NOT NULL DEFAULT false,
                "status" "order_status_enum" NOT NULL DEFAULT 'ENREGISTREE',
                "total_amount_excluding_tax" numeric(12,2) NOT NULL DEFAULT '0',
                "expected_delivery_date" date,
                "actual_delivery_date" date,
                "created_by" uuid,
                CONSTRAINT "PK_orders" PRIMARY KEY ("id"),
                CONSTRAINT "UQ_orders_order_number" UNIQUE ("order_number")
            )
        `);

        // Drop new tables
        await queryRunner.query(`DROP TABLE "sales_order_products"`);
        await queryRunner.query(`DROP TABLE "sales_orders"`);
        
        // Rename back purchase_order_products to commande_articles
        await queryRunner.query(`ALTER TABLE "purchase_order_products" RENAME COLUMN "purchase_order_id" TO "order_id"`);
        await queryRunner.query(`ALTER TABLE "purchase_order_products" RENAME TO "commande_articles"`);
        
        await queryRunner.query(`DROP TABLE "purchase_orders"`);
    }
}