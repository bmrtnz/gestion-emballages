import { MigrationInterface, QueryRunner } from "typeorm";

export class InitializeCompleteSchema1754768491804 implements MigrationInterface {
    name = 'InitializeCompleteSchema1754768491804'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // First, drop all existing tables if they exist (in dependency order)
        const existingTables = [
            'document_access',
            'documents',
            'forecasts', 
            'shopping_cart_items',
            'liste_achat_items',
            'shopping_carts',
            'liste_achats',
            'transfer_request_products',
            'demande_transfert_articles',
            'transfer_requests',
            'stock_suppliers',
            'stock_fournisseurs',
            'stock_platforms',
            'stocks_platform',
            'stock_stations',
            'sales_order_products',
            'purchase_order_products',
            'commande_articles',
            'sales_orders',
            'purchase_orders',
            'orders',
            'master_orders',
            'global_orders',
            'product_suppliers',
            'article_fournisseurs',
            'products',
            'users',
            'supplier_contacts',
            'supplier_sites',
            'fournisseur_sites',
            'suppliers',
            'station_contacts',
            'stations',
            'platform_contacts',
            'platform_sites',
            'platforms',
            'station_groups'
        ];

        // Drop tables in reverse dependency order
        for (const table of existingTables) {
            await queryRunner.query(`DROP TABLE IF EXISTS "${table}" CASCADE`);
        }

        // Drop all existing enums
        const existingEnums = [
            'access_entity_type',
            'access_type', 
            'document_entity_type',
            'document_status',
            'document_type',
            'transfer_status',
            'order_status',
            'product_category',
            'conditioning_unit',
            'entity_type',
            'user_role',
            'article_category',
            'commande_status'
        ];

        for (const enumType of existingEnums) {
            await queryRunner.query(`DROP TYPE IF EXISTS "${enumType}" CASCADE`);
        }

        // Now create all enums
        await queryRunner.query(`CREATE TYPE "user_role" AS ENUM('admin', 'manager', 'user', 'viewer')`);
        await queryRunner.query(`CREATE TYPE "entity_type" AS ENUM('platform', 'station', 'supplier')`);
        await queryRunner.query(`CREATE TYPE "product_category" AS ENUM('boxes', 'trays', 'films', 'bags', 'labels', 'other')`);
        await queryRunner.query(`CREATE TYPE "conditioning_unit" AS ENUM('piece', 'unit', 'box_of_25', 'box_of_50', 'box_of_100', 'box_of_200', 'box_of_250', 'box_of_500', 'box_of_1000', 'pallet_of_20', 'pallet_of_25', 'pallet_of_50', 'pallet_of_100', 'roll', 'roll_of_100m', 'roll_of_200m', 'roll_of_500m', 'bundle', 'bundle_of_10', 'bundle_of_25', 'bundle_of_50', 'kg', 'bag_of_5kg', 'bag_of_10kg', 'bag_of_25kg', 'set', 'pair', 'dozen')`);
        await queryRunner.query(`CREATE TYPE "order_status" AS ENUM('Enregistrée', 'Confirmée', 'Expédiée', 'Réceptionnée', 'Clôturée', 'Facturée', 'Archivée')`);
        await queryRunner.query(`CREATE TYPE "transfer_status" AS ENUM('draft', 'submitted', 'approved', 'rejected', 'in_transit', 'delivered', 'cancelled')`);
        
        // Contract management enums
        await queryRunner.query(`CREATE TYPE "contract_type" AS ENUM('ANNUAL', 'MULTI_YEAR', 'SEASONAL', 'SPOT')`);
        await queryRunner.query(`CREATE TYPE "contract_status" AS ENUM('DRAFT', 'ACTIVE', 'SUSPENDED', 'EXPIRED', 'TERMINATED')`);
        await queryRunner.query(`CREATE TYPE "metric_type" AS ENUM('DELIVERY_PERFORMANCE', 'QUALITY_PERFORMANCE', 'QUANTITY_ACCURACY', 'ORDER_FULFILLMENT_RATE', 'RESPONSE_TIME')`);
        await queryRunner.query(`CREATE TYPE "performance_status" AS ENUM('EXCELLENT', 'GOOD', 'WARNING', 'BREACH', 'CRITICAL')`);
        await queryRunner.query(`CREATE TYPE "measurement_period" AS ENUM('DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'ANNUAL')`);
        
        // Document management enums
        await queryRunner.query(`CREATE TYPE "document_type" AS ENUM(
            'PRODUCT_IMAGE', 'PLATFORM_CERTIFICATION', 'SUPPLIER_CERTIFICATION', 'STATION_CERTIFICATION',
            'QUALITY_CERTIFICATE', 'SAFETY_CERTIFICATE', 'PRODUCT_QUALITY_CERTIFICATE', 'PRODUCT_SAFETY_CERTIFICATE',
            'PRODUCT_COMPLIANCE_CERTIFICATE', 'PRODUCT_SPECIFICATION_SHEET', 'PRODUCT_MATERIAL_CERTIFICATE', 'PRODUCT_TEST_REPORT',
            'DELIVERY_DISCREPANCY_PHOTO', 'PRODUCT_DISCREPANCY_PHOTO', 'QUALITY_ISSUE_PHOTO', 'DAMAGE_REPORT_PHOTO',
            'NON_CONFORMITY_PHOTO', 'POST_DELIVERY_DAMAGE_PHOTO', 'POST_DELIVERY_QUALITY_ISSUE_PHOTO', 
            'POST_DELIVERY_MISSING_ITEMS_PHOTO', 'POST_DELIVERY_WRONG_ITEMS_PHOTO', 'POST_DELIVERY_CONTAMINATION_PHOTO',
            'POST_DELIVERY_SPOILAGE_PHOTO', 'CUSTOMER_COMPLAINT_PHOTO', 'PURCHASE_ORDER', 'SALES_ORDER', 'MASTER_ORDER',
            'INVOICE', 'DELIVERY_NOTE', 'PACKING_LIST', 'STOCK_REPORT', 'SALES_REPORT', 'PLATFORM_REPORT', 'CONTRACT', 'SPECIFICATION', 'OTHER'
        )`);
        await queryRunner.query(`CREATE TYPE "document_status" AS ENUM('DRAFT', 'ACTIVE', 'ARCHIVED', 'EXPIRED')`);
        await queryRunner.query(`CREATE TYPE "document_entity_type" AS ENUM(
            'PRODUCT_SUPPLIER', 'PLATFORM', 'SUPPLIER', 'STATION', 'PURCHASE_ORDER', 'SALES_ORDER', 'MASTER_ORDER', 
            'USER', 'DELIVERY', 'PURCHASE_ORDER_PRODUCT', 'SALES_ORDER_PRODUCT', 'TRANSFER_REQUEST', 'STOCK_MOVEMENT'
        )`);
        await queryRunner.query(`CREATE TYPE "access_type" AS ENUM('read', 'write', 'delete', 'admin')`);
        await queryRunner.query(`CREATE TYPE "access_entity_type" AS ENUM('USER', 'STATION', 'SUPPLIER', 'PLATFORM', 'ROLE')`);

        // Create base tables in dependency order
        
        // Station Groups (no dependencies)
        await queryRunner.query(`CREATE TABLE "station_groups" (
            "id" uuid NOT NULL DEFAULT gen_random_uuid(),
            "name" character varying NOT NULL,
            "description" text,
            "created_at" TIMESTAMP NOT NULL DEFAULT now(),
            "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
            "is_active" boolean NOT NULL DEFAULT true,
            CONSTRAINT "PK_station_groups" PRIMARY KEY ("id")
        )`);

        // Platforms (no dependencies)
        await queryRunner.query(`CREATE TABLE "platforms" (
            "id" uuid NOT NULL DEFAULT gen_random_uuid(),
            "name" character varying NOT NULL,
            "address" character varying,
            "city" character varying,
            "postal_code" character varying,
            "country" character varying DEFAULT 'France',
            "phone" character varying,
            "email" character varying,
            "website" character varying,
            "description" text,
            "specialties" text,
            "created_at" TIMESTAMP NOT NULL DEFAULT now(),
            "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
            "is_active" boolean NOT NULL DEFAULT true,
            CONSTRAINT "PK_platforms" PRIMARY KEY ("id")
        )`);

        // Platform Sites (depends on platforms)
        await queryRunner.query(`CREATE TABLE "platform_sites" (
            "id" uuid NOT NULL DEFAULT gen_random_uuid(),
            "platform_id" uuid NOT NULL,
            "name" character varying NOT NULL,
            "address" character varying,
            "city" character varying,
            "postal_code" character varying,
            "country" character varying DEFAULT 'France',
            "phone" character varying,
            "email" character varying,
            "is_primary" boolean DEFAULT false,
            "created_at" TIMESTAMP NOT NULL DEFAULT now(),
            "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
            "is_active" boolean NOT NULL DEFAULT true,
            CONSTRAINT "PK_platform_sites" PRIMARY KEY ("id")
        )`);

        // Platform Contacts (depends on platforms)
        await queryRunner.query(`CREATE TABLE "platform_contacts" (
            "id" uuid NOT NULL DEFAULT gen_random_uuid(),
            "platform_id" uuid NOT NULL,
            "name" character varying NOT NULL,
            "email" character varying,
            "phone" character varying,
            "position" character varying,
            "is_primary" boolean DEFAULT false,
            "created_at" TIMESTAMP NOT NULL DEFAULT now(),
            "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
            "is_active" boolean NOT NULL DEFAULT true,
            CONSTRAINT "PK_platform_contacts" PRIMARY KEY ("id")
        )`);

        // Stations (depends on station_groups only)
        await queryRunner.query(`CREATE TABLE "stations" (
            "id" uuid NOT NULL DEFAULT gen_random_uuid(),
            "station_group_id" uuid,
            "name" character varying NOT NULL,
            "code" character varying,
            "address" character varying,
            "city" character varying,
            "postal_code" character varying,
            "country" character varying DEFAULT 'France',
            "coordinates" jsonb,
            "created_at" TIMESTAMP NOT NULL DEFAULT now(),
            "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
            "is_active" boolean NOT NULL DEFAULT true,
            CONSTRAINT "PK_stations" PRIMARY KEY ("id"),
            CONSTRAINT "UQ_stations_code" UNIQUE ("code")
        )`);

        // Station Contacts (depends on stations)
        await queryRunner.query(`CREATE TABLE "station_contacts" (
            "id" uuid NOT NULL DEFAULT gen_random_uuid(),
            "station_id" uuid NOT NULL,
            "name" character varying NOT NULL,
            "email" character varying,
            "phone" character varying,
            "position" character varying,
            "is_primary" boolean DEFAULT false,
            "created_at" TIMESTAMP NOT NULL DEFAULT now(),
            "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
            "is_active" boolean NOT NULL DEFAULT true,
            CONSTRAINT "PK_station_contacts" PRIMARY KEY ("id")
        )`);

        // Suppliers (no dependencies)
        await queryRunner.query(`CREATE TABLE "suppliers" (
            "id" uuid NOT NULL DEFAULT gen_random_uuid(),
            "name" character varying NOT NULL,
            "siret" character varying,
            "address" character varying,
            "city" character varying,
            "postal_code" character varying,
            "country" character varying DEFAULT 'France',
            "phone" character varying,
            "email" character varying,
            "website" character varying,
            "specialties" text,
            "created_at" TIMESTAMP NOT NULL DEFAULT now(),
            "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
            "is_active" boolean NOT NULL DEFAULT true,
            CONSTRAINT "PK_suppliers" PRIMARY KEY ("id"),
            CONSTRAINT "UQ_suppliers_siret" UNIQUE ("siret")
        )`);

        // Supplier Sites (depends on suppliers)
        await queryRunner.query(`CREATE TABLE "supplier_sites" (
            "id" uuid NOT NULL DEFAULT gen_random_uuid(),
            "supplier_id" uuid NOT NULL,
            "name" character varying NOT NULL,
            "address" character varying,
            "city" character varying,
            "postal_code" character varying,
            "country" character varying DEFAULT 'France',
            "phone" character varying,
            "email" character varying,
            "is_primary" boolean DEFAULT false,
            "created_at" TIMESTAMP NOT NULL DEFAULT now(),
            "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
            "is_active" boolean NOT NULL DEFAULT true,
            CONSTRAINT "PK_supplier_sites" PRIMARY KEY ("id")
        )`);

        // Supplier Contacts (depends on suppliers)
        await queryRunner.query(`CREATE TABLE "supplier_contacts" (
            "id" uuid NOT NULL DEFAULT gen_random_uuid(),
            "supplier_id" uuid NOT NULL,
            "name" character varying NOT NULL,
            "email" character varying,
            "phone" character varying,
            "position" character varying,
            "is_primary" boolean DEFAULT false,
            "created_at" TIMESTAMP NOT NULL DEFAULT now(),
            "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
            "is_active" boolean NOT NULL DEFAULT true,
            CONSTRAINT "PK_supplier_contacts" PRIMARY KEY ("id")
        )`);

        // Users (depends on platforms, stations, suppliers via entity_type/entity_id)
        await queryRunner.query(`CREATE TABLE "users" (
            "id" uuid NOT NULL DEFAULT gen_random_uuid(),
            "email" character varying NOT NULL,
            "hashed_password" character varying NOT NULL,
            "full_name" character varying NOT NULL,
            "phone" character varying,
            "role" "user_role" NOT NULL DEFAULT 'user',
            "entity_type" "entity_type",
            "entity_id" uuid,
            "reset_token" character varying,
            "reset_token_expiry" TIMESTAMP,
            "created_at" TIMESTAMP NOT NULL DEFAULT now(),
            "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
            "is_active" boolean NOT NULL DEFAULT true,
            CONSTRAINT "PK_users" PRIMARY KEY ("id"),
            CONSTRAINT "UQ_users_email" UNIQUE ("email")
        )`);

        // Products (no dependencies)
        await queryRunner.query(`CREATE TABLE "products" (
            "id" uuid NOT NULL DEFAULT gen_random_uuid(),
            "product_code" character varying(100) NOT NULL,
            "name" character varying(255),
            "description" text NOT NULL,
            "category" "product_category" NOT NULL,
            "created_by" uuid,
            "updated_by" uuid,
            "created_at" TIMESTAMP NOT NULL DEFAULT now(),
            "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
            "is_active" boolean NOT NULL DEFAULT true,
            CONSTRAINT "PK_products" PRIMARY KEY ("id"),
            CONSTRAINT "UQ_products_product_code" UNIQUE ("product_code")
        )`);

        // Product Suppliers (depends on products, suppliers)
        await queryRunner.query(`CREATE TABLE "product_suppliers" (
            "id" uuid NOT NULL DEFAULT gen_random_uuid(),
            "product_id" uuid NOT NULL,
            "supplier_id" uuid NOT NULL,
            "supplier_product_code" character varying(100),
            "conditioning_price" decimal(10,2) NOT NULL,
            "conditioning_unit" "conditioning_unit",
            "quantity_per_conditioning" integer,
            "indicative_supply_delay" integer,
            "image_url" character varying(500),
            "created_at" TIMESTAMP NOT NULL DEFAULT now(),
            "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
            CONSTRAINT "PK_product_suppliers" PRIMARY KEY ("id"),
            CONSTRAINT "UQ_product_supplier" UNIQUE ("product_id", "supplier_id")
        )`);

        // Master Orders (depends on stations, platforms, users)
        await queryRunner.query(`CREATE TABLE "master_orders" (
            "id" uuid NOT NULL DEFAULT gen_random_uuid(),
            "order_number" character varying NOT NULL,
            "customer_station_id" uuid NOT NULL,
            "customer_platform_id" uuid NOT NULL,
            "status" "order_status" NOT NULL DEFAULT 'Enregistrée',
            "total_amount" decimal(10,2),
            "currency" character varying DEFAULT 'EUR',
            "notes" text,
            "created_by" uuid NOT NULL,
            "created_at" TIMESTAMP NOT NULL DEFAULT now(),
            "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
            "is_active" boolean NOT NULL DEFAULT true,
            CONSTRAINT "PK_master_orders" PRIMARY KEY ("id"),
            CONSTRAINT "UQ_master_order_number" UNIQUE ("order_number")
        )`);

        // Purchase Orders (depends on master_orders, suppliers, stations, platforms, users)
        await queryRunner.query(`CREATE TABLE "purchase_orders" (
            "id" uuid NOT NULL DEFAULT gen_random_uuid(),
            "po_number" character varying(100) NOT NULL,
            "master_order_id" uuid,
            "buyer_type" character varying(50) NOT NULL,
            "station_id" uuid,
            "supplier_id" uuid,
            "is_internal_supplier" boolean NOT NULL DEFAULT false,
            "delivery_location_type" character varying(50) NOT NULL,
            "platform_id" uuid,
            "delivery_station_id" uuid,
            "delivery_address" text,
            "status" "order_status" NOT NULL DEFAULT 'Enregistrée',
            "total_amount_excluding_tax" decimal(12,2) NOT NULL DEFAULT 0,
            "tax_amount" decimal(12,2) NOT NULL DEFAULT 0,
            "total_amount_including_tax" decimal(12,2) NOT NULL DEFAULT 0,
            "currency" character varying(3) NOT NULL DEFAULT 'EUR',
            "requested_delivery_date" date,
            "confirmed_delivery_date" date,
            "actual_delivery_date" date,
            "linked_sales_order_id" uuid,
            "notes" text,
            "payment_terms" character varying,
            "created_by" uuid,
            "approved_by" uuid,
            "approved_at" TIMESTAMP,
            "delivered_at" TIMESTAMP,
            "created_at" TIMESTAMP NOT NULL DEFAULT now(),
            "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
            CONSTRAINT "PK_purchase_orders" PRIMARY KEY ("id"),
            CONSTRAINT "UQ_purchase_orders_po_number" UNIQUE ("po_number")
        )`);

        // Sales Orders (depends on purchase_orders, stations, platforms, users)
        await queryRunner.query(`CREATE TABLE "sales_orders" (
            "id" uuid NOT NULL DEFAULT gen_random_uuid(),
            "so_number" character varying(100) NOT NULL,
            "seller_name" character varying NOT NULL DEFAULT 'Blue Whale',
            "customer_station_id" uuid NOT NULL,
            "customer_po_number" character varying(100) NOT NULL,
            "fulfillment_platform_id" uuid NOT NULL,
            "delivery_address" text NOT NULL,
            "status" "order_status" NOT NULL DEFAULT 'Enregistrée',
            "subtotal_amount" decimal(12,2) NOT NULL DEFAULT 0,
            "platform_fees" decimal(12,2) NOT NULL DEFAULT 0,
            "total_amount_excluding_tax" decimal(12,2) NOT NULL DEFAULT 0,
            "tax_amount" decimal(12,2) NOT NULL DEFAULT 0,
            "total_amount_including_tax" decimal(12,2) NOT NULL DEFAULT 0,
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
            "created_at" TIMESTAMP NOT NULL DEFAULT now(),
            "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
            CONSTRAINT "PK_sales_orders" PRIMARY KEY ("id"),
            CONSTRAINT "UQ_sales_orders_so_number" UNIQUE ("so_number")
        )`);

        // Purchase Order Products (depends on purchase_orders, products, product_suppliers)
        await queryRunner.query(`CREATE TABLE "purchase_order_products" (
            "id" uuid NOT NULL DEFAULT gen_random_uuid(),
            "purchase_order_id" uuid NOT NULL,
            "product_id" uuid NOT NULL,
            "product_supplier_id" uuid,
            "ordered_quantity" integer NOT NULL,
            "unit_price" decimal(10,2) NOT NULL,
            "discount_percent" decimal(5,2) NOT NULL DEFAULT 0,
            "discount_amount" decimal(10,2) NOT NULL DEFAULT 0,
            "line_total" decimal(12,2) NOT NULL,
            "tax_rate" decimal(5,2) NOT NULL DEFAULT 20,
            "tax_amount" decimal(10,2) NOT NULL,
            "line_total_with_tax" decimal(12,2) NOT NULL,
            "delivered_quantity" integer NOT NULL DEFAULT 0,
            "fulfillment_status" character varying(50) NOT NULL DEFAULT 'PENDING',
            "expected_delivery_date" date,
            "actual_delivery_date" date,
            "notes" text,
            "created_at" TIMESTAMP NOT NULL DEFAULT now(),
            "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
            CONSTRAINT "PK_purchase_order_products" PRIMARY KEY ("id")
        )`);

        // Sales Order Products (depends on sales_orders, products)
        await queryRunner.query(`CREATE TABLE "sales_order_products" (
            "id" uuid NOT NULL DEFAULT gen_random_uuid(),
            "sales_order_id" uuid NOT NULL,
            "product_id" uuid NOT NULL,
            "line_number" integer NOT NULL,
            "quantity" integer NOT NULL,
            "unit_price" decimal(10,2) NOT NULL,
            "discount_percent" decimal(5,2) NOT NULL DEFAULT 0,
            "discount_amount" decimal(10,2) NOT NULL DEFAULT 0,
            "line_total" decimal(12,2) NOT NULL,
            "tax_rate" decimal(5,2) NOT NULL DEFAULT 20,
            "tax_amount" decimal(10,2) NOT NULL,
            "line_total_with_tax" decimal(12,2) NOT NULL,
            "stock_location" character varying(100),
            "batch_number" character varying(100),
            "expiry_date" date,
            "quantity_shipped" integer NOT NULL DEFAULT 0,
            "quantity_delivered" integer NOT NULL DEFAULT 0,
            "fulfillment_status" character varying(50) NOT NULL DEFAULT 'PENDING',
            "notes" text,
            "created_at" TIMESTAMP NOT NULL DEFAULT now(),
            "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
            CONSTRAINT "PK_sales_order_products" PRIMARY KEY ("id")
        )`);

        // Stock Stations (depends on stations, products)
        await queryRunner.query(`CREATE TABLE "stock_stations" (
            "id" uuid NOT NULL DEFAULT gen_random_uuid(),
            "station_id" uuid NOT NULL,
            "product_id" uuid NOT NULL,
            "quantity" integer NOT NULL DEFAULT 0,
            "reserved_quantity" integer NOT NULL DEFAULT 0,
            "minimum_stock" integer DEFAULT 0,
            "maximum_stock" integer,
            "last_updated_by" uuid,
            "created_at" TIMESTAMP NOT NULL DEFAULT now(),
            "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
            "is_active" boolean NOT NULL DEFAULT true,
            CONSTRAINT "PK_stock_stations" PRIMARY KEY ("id"),
            CONSTRAINT "UQ_stock_station_product" UNIQUE ("station_id", "product_id")
        )`);

        // Stock Platforms (depends on platforms, products)
        await queryRunner.query(`CREATE TABLE "stock_platforms" (
            "id" uuid NOT NULL DEFAULT gen_random_uuid(),
            "platform_id" uuid NOT NULL,
            "product_id" uuid NOT NULL,
            "quantity" integer NOT NULL DEFAULT 0,
            "reserved_quantity" integer NOT NULL DEFAULT 0,
            "minimum_stock" integer DEFAULT 0,
            "maximum_stock" integer,
            "cost_per_unit" decimal(10,2),
            "last_updated_by" uuid,
            "created_at" TIMESTAMP NOT NULL DEFAULT now(),
            "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
            "is_active" boolean NOT NULL DEFAULT true,
            CONSTRAINT "PK_stock_platforms" PRIMARY KEY ("id"),
            CONSTRAINT "UQ_stock_platform_product" UNIQUE ("platform_id", "product_id")
        )`);

        // Stock Suppliers (depends on suppliers, products)
        await queryRunner.query(`CREATE TABLE "stock_suppliers" (
            "id" uuid NOT NULL DEFAULT gen_random_uuid(),
            "supplier_id" uuid NOT NULL,
            "product_id" uuid NOT NULL,
            "quantity" integer NOT NULL DEFAULT 0,
            "reserved_quantity" integer NOT NULL DEFAULT 0,
            "last_updated_by" uuid,
            "created_at" TIMESTAMP NOT NULL DEFAULT now(),
            "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
            "is_active" boolean NOT NULL DEFAULT true,
            CONSTRAINT "PK_stock_suppliers" PRIMARY KEY ("id"),
            CONSTRAINT "UQ_stock_supplier_product" UNIQUE ("supplier_id", "product_id")
        )`);

        // Transfer Requests (depends on stations, users)
        await queryRunner.query(`CREATE TABLE "transfer_requests" (
            "id" uuid NOT NULL DEFAULT gen_random_uuid(),
            "request_number" character varying NOT NULL,
            "from_station_id" uuid NOT NULL,
            "to_station_id" uuid NOT NULL,
            "status" "transfer_status" NOT NULL DEFAULT 'draft',
            "reason" text,
            "requested_by" uuid NOT NULL,
            "approved_by" uuid,
            "approved_at" TIMESTAMP,
            "completed_at" TIMESTAMP,
            "notes" text,
            "created_at" TIMESTAMP NOT NULL DEFAULT now(),
            "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
            "is_active" boolean NOT NULL DEFAULT true,
            CONSTRAINT "PK_transfer_requests" PRIMARY KEY ("id"),
            CONSTRAINT "UQ_transfer_request_number" UNIQUE ("request_number")
        )`);

        // Transfer Request Products (depends on transfer_requests, products)
        await queryRunner.query(`CREATE TABLE "transfer_request_products" (
            "id" uuid NOT NULL DEFAULT gen_random_uuid(),
            "transfer_request_id" uuid NOT NULL,
            "product_id" uuid NOT NULL,
            "requested_quantity" integer NOT NULL,
            "approved_quantity" integer,
            "transferred_quantity" integer DEFAULT 0,
            "notes" text,
            "created_at" TIMESTAMP NOT NULL DEFAULT now(),
            "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
            CONSTRAINT "PK_transfer_request_products" PRIMARY KEY ("id")
        )`);

        // Shopping Carts (depends on users, stations)
        await queryRunner.query(`CREATE TABLE "shopping_carts" (
            "id" uuid NOT NULL DEFAULT gen_random_uuid(),
            "user_id" uuid NOT NULL,
            "station_id" uuid NOT NULL,
            "name" character varying,
            "status" character varying DEFAULT 'active',
            "total_amount" decimal(10,2),
            "currency" character varying DEFAULT 'EUR',
            "notes" text,
            "created_at" TIMESTAMP NOT NULL DEFAULT now(),
            "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
            "is_active" boolean NOT NULL DEFAULT true,
            CONSTRAINT "PK_shopping_carts" PRIMARY KEY ("id")
        )`);

        // Shopping Cart Items (depends on shopping_carts, products, product_suppliers)
        await queryRunner.query(`CREATE TABLE "shopping_cart_items" (
            "id" uuid NOT NULL DEFAULT gen_random_uuid(),
            "shopping_cart_id" uuid NOT NULL,
            "product_id" uuid NOT NULL,
            "product_supplier_id" uuid NOT NULL,
            "quantity" integer NOT NULL,
            "unit_price" decimal(10,2),
            "total_price" decimal(10,2),
            "notes" text,
            "created_at" TIMESTAMP NOT NULL DEFAULT now(),
            "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
            CONSTRAINT "PK_shopping_cart_items" PRIMARY KEY ("id")
        )`);

        // Forecasts (depends on products, suppliers, users)
        await queryRunner.query(`CREATE TABLE "forecasts" (
            "id" uuid NOT NULL DEFAULT gen_random_uuid(),
            "product_id" uuid NOT NULL,
            "supplier_id" uuid,
            "period" character varying NOT NULL,
            "period_start" date NOT NULL,
            "period_end" date NOT NULL,
            "predicted_demand" integer NOT NULL,
            "confidence_level" decimal(3,2),
            "notes" text,
            "created_by" uuid NOT NULL,
            "created_at" TIMESTAMP NOT NULL DEFAULT now(),
            "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
            "is_active" boolean NOT NULL DEFAULT true,
            CONSTRAINT "PK_forecasts" PRIMARY KEY ("id")
        )`);

        // Master Contracts (depends on suppliers)
        await queryRunner.query(`CREATE TABLE "master_contracts" (
            "id" uuid NOT NULL DEFAULT gen_random_uuid(),
            "contract_number" character varying NOT NULL,
            "contract_name" character varying NOT NULL,
            "supplier_id" uuid NOT NULL,
            "contract_type" "contract_type" NOT NULL,
            "status" "contract_status" NOT NULL DEFAULT 'DRAFT',
            "valid_from" date NOT NULL,
            "valid_until" date NOT NULL,
            "description" text,
            "payment_terms" text,
            "delivery_terms" text,
            "default_delivery_sla_days" integer DEFAULT 7,
            "default_quality_tolerance_percent" decimal(5,2) DEFAULT 2.0,
            "default_delivery_tolerance_percent" decimal(5,2) DEFAULT 5.0,
            "volume_commitment" integer,
            "minimum_order_value" decimal(10,2),
            "currency" character varying DEFAULT 'EUR',
            "late_delivery_penalty_percent" decimal(5,2) DEFAULT 0.5,
            "quality_issue_penalty_percent" decimal(5,2) DEFAULT 1.0,
            "delivery_excellence_bonus_percent" decimal(5,2) DEFAULT 0.0,
            "quality_excellence_bonus_percent" decimal(5,2) DEFAULT 0.0,
            "metadata" jsonb DEFAULT '{}',
            "next_review_date" date,
            "last_reviewed_at" TIMESTAMP,
            "review_notes" text,
            "created_at" TIMESTAMP NOT NULL DEFAULT now(),
            "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
            CONSTRAINT "PK_master_contracts" PRIMARY KEY ("id"),
            CONSTRAINT "UQ_master_contract_number" UNIQUE ("contract_number")
        )`);

        // Contract Product SLAs (depends on master_contracts, products)
        await queryRunner.query(`CREATE TABLE "contract_product_slas" (
            "id" uuid NOT NULL DEFAULT gen_random_uuid(),
            "master_contract_id" uuid NOT NULL,
            "product_id" uuid NOT NULL,
            "delivery_sla_days" integer,
            "delivery_tolerance_percent" decimal(5,2),
            "max_delivery_delay_days" integer,
            "quality_tolerance_percent" decimal(5,2),
            "max_quality_defect_rate" decimal(5,2),
            "critical_quality_threshold" decimal(5,2),
            "quantity_accuracy_threshold" decimal(5,2),
            "packaging_compliance_rate" decimal(5,2),
            "late_delivery_penalty_percent" decimal(5,2),
            "quality_issue_penalty_percent" decimal(5,2),
            "quantity_shortage_penalty_percent" decimal(5,2),
            "delivery_excellence_bonus_percent" decimal(5,2),
            "quality_excellence_bonus_percent" decimal(5,2),
            "minimum_order_fulfillment_rate" decimal(5,2) DEFAULT 95.0,
            "maximum_response_time_hours" integer,
            "required_lead_time_days" integer,
            "seasonal_adjustments" jsonb DEFAULT '{}',
            "special_requirements" jsonb DEFAULT '{}',
            "escalation_rules" jsonb DEFAULT '{}',
            "measurement_period_days" integer DEFAULT 30,
            "grace_period_days" integer DEFAULT 5,
            "effective_from" date NOT NULL,
            "effective_until" date,
            "is_suspended" boolean DEFAULT false,
            "suspension_reason" text,
            "created_by" uuid NOT NULL,
            "last_reviewed_at" TIMESTAMP,
            "last_reviewed_by" uuid,
            "review_notes" text,
            "created_at" TIMESTAMP NOT NULL DEFAULT now(),
            "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
            CONSTRAINT "PK_contract_product_slas" PRIMARY KEY ("id"),
            CONSTRAINT "UQ_contract_product_sla" UNIQUE ("master_contract_id", "product_id")
        )`);

        // Contract Performance Metrics (depends on master_contracts, products, users)
        await queryRunner.query(`CREATE TABLE "contract_performance_metrics" (
            "id" uuid NOT NULL DEFAULT gen_random_uuid(),
            "master_contract_id" uuid NOT NULL,
            "product_id" uuid,
            "metric_type" "metric_type" NOT NULL,
            "measurement_period" "measurement_period" NOT NULL,
            "period_start" date NOT NULL,
            "period_end" date NOT NULL,
            "target_value" decimal(10,2) NOT NULL,
            "actual_value" decimal(10,2) NOT NULL,
            "variance" decimal(10,2) NOT NULL,
            "variance_percent" decimal(5,2) NOT NULL,
            "status" "performance_status" NOT NULL,
            "performance_score" decimal(5,2) NOT NULL DEFAULT 0,
            "sample_size" integer NOT NULL DEFAULT 0,
            "total_events" integer NOT NULL DEFAULT 0,
            "successful_events" integer NOT NULL DEFAULT 0,
            "failed_events" integer NOT NULL DEFAULT 0,
            "penalties_applied" decimal(10,2) DEFAULT 0,
            "bonuses_earned" decimal(10,2) DEFAULT 0,
            "net_financial_impact" decimal(10,2) DEFAULT 0,
            "calculation_method" character varying,
            "data_sources" text[],
            "escalation_triggered" boolean DEFAULT false,
            "escalation_level" integer,
            "escalation_notes" text,
            "requires_action" boolean DEFAULT false,
            "action_plan" text,
            "action_deadline" date,
            "calculation_timestamp" TIMESTAMP NOT NULL,
            "calculated_by" uuid NOT NULL,
            "created_at" TIMESTAMP NOT NULL DEFAULT now(),
            "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
            CONSTRAINT "PK_contract_performance_metrics" PRIMARY KEY ("id")
        )`);

        // Document Management Tables (depends on users)
        await queryRunner.query(`CREATE TABLE "documents" (
            "id" uuid NOT NULL DEFAULT gen_random_uuid(),
            "title" character varying(255) NOT NULL,
            "description" text,
            "document_type" "document_type" NOT NULL,
            "status" "document_status" NOT NULL DEFAULT 'ACTIVE',
            "entity_type" "document_entity_type" NOT NULL,
            "entity_id" uuid NOT NULL,
            "file_name" character varying(255) NOT NULL,
            "original_name" character varying(255) NOT NULL,
            "mime_type" character varying(100) NOT NULL,
            "file_size" bigint NOT NULL,
            "file_path" character varying(500) NOT NULL,
            "minio_bucket" character varying(100) NOT NULL,
            "is_public" boolean NOT NULL DEFAULT false,
            "access_level" character varying(20) NOT NULL DEFAULT 'INTERNAL',
            "metadata" jsonb DEFAULT '{}',
            "version" integer NOT NULL DEFAULT 1,
            "parent_document_id" uuid,
            "uploaded_by" uuid NOT NULL,
            "last_accessed_at" TIMESTAMP,
            "download_count" integer NOT NULL DEFAULT 0,
            "created_at" TIMESTAMP NOT NULL DEFAULT now(),
            "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
            "is_active" boolean NOT NULL DEFAULT true,
            CONSTRAINT "PK_documents" PRIMARY KEY ("id")
        )`);

        await queryRunner.query(`CREATE TABLE "document_access" (
            "id" uuid NOT NULL DEFAULT gen_random_uuid(),
            "document_id" uuid NOT NULL,
            "access_type" "access_type" NOT NULL,
            "entity_type" "access_entity_type" NOT NULL,
            "entity_id" uuid NOT NULL,
            "granted_at" TIMESTAMP NOT NULL DEFAULT now(),
            "expires_at" TIMESTAMP,
            "granted_by" uuid NOT NULL,
            "is_active" boolean NOT NULL DEFAULT true,
            "constraints" jsonb DEFAULT '{}',
            "created_at" TIMESTAMP NOT NULL DEFAULT now(),
            "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
            CONSTRAINT "PK_document_access" PRIMARY KEY ("id")
        )`);

        // Create indexes for performance
        await queryRunner.query(`CREATE INDEX "IDX_stations_group" ON "stations" ("station_group_id")`);
        await queryRunner.query(`CREATE INDEX "IDX_users_entity" ON "users" ("entity_type", "entity_id")`);
        await queryRunner.query(`CREATE INDEX "IDX_users_email" ON "users" ("email")`);
        await queryRunner.query(`CREATE INDEX "IDX_users_role" ON "users" ("role")`);
        await queryRunner.query(`CREATE INDEX "IDX_products_category" ON "products" ("category")`);
        await queryRunner.query(`CREATE INDEX "IDX_product_suppliers_product" ON "product_suppliers" ("product_id")`);
        await queryRunner.query(`CREATE INDEX "IDX_product_suppliers_supplier" ON "product_suppliers" ("supplier_id")`);
        await queryRunner.query(`CREATE INDEX "IDX_purchase_orders_supplier" ON "purchase_orders" ("supplier_id")`);
        await queryRunner.query(`CREATE INDEX "IDX_purchase_orders_master" ON "purchase_orders" ("master_order_id")`);
        await queryRunner.query(`CREATE INDEX "IDX_sales_orders_customer" ON "sales_orders" ("customer_station_id")`);
        await queryRunner.query(`CREATE INDEX "IDX_sales_orders_platform" ON "sales_orders" ("fulfillment_platform_id")`);
        await queryRunner.query(`CREATE INDEX "IDX_stock_stations_station" ON "stock_stations" ("station_id")`);
        await queryRunner.query(`CREATE INDEX "IDX_stock_platforms_platform" ON "stock_platforms" ("platform_id")`);
        await queryRunner.query(`CREATE INDEX "IDX_stock_suppliers_supplier" ON "stock_suppliers" ("supplier_id")`);
        await queryRunner.query(`CREATE INDEX "IDX_documents_entity" ON "documents" ("entity_type", "entity_id")`);
        await queryRunner.query(`CREATE INDEX "IDX_documents_type" ON "documents" ("document_type")`);
        await queryRunner.query(`CREATE INDEX "IDX_document_access_document" ON "document_access" ("document_id")`);
        
        // Contract management indexes
        await queryRunner.query(`CREATE INDEX "IDX_master_contracts_supplier" ON "master_contracts" ("supplier_id")`);
        await queryRunner.query(`CREATE INDEX "IDX_master_contracts_status" ON "master_contracts" ("status")`);
        await queryRunner.query(`CREATE INDEX "IDX_master_contracts_valid_dates" ON "master_contracts" ("valid_from", "valid_until")`);
        await queryRunner.query(`CREATE INDEX "IDX_contract_product_slas_contract" ON "contract_product_slas" ("master_contract_id")`);
        await queryRunner.query(`CREATE INDEX "IDX_contract_product_slas_product" ON "contract_product_slas" ("product_id")`);
        await queryRunner.query(`CREATE INDEX "IDX_contract_product_slas_effective" ON "contract_product_slas" ("effective_from", "effective_until")`);
        await queryRunner.query(`CREATE INDEX "IDX_contract_performance_contract" ON "contract_performance_metrics" ("master_contract_id")`);
        await queryRunner.query(`CREATE INDEX "IDX_contract_performance_product" ON "contract_performance_metrics" ("product_id")`);
        await queryRunner.query(`CREATE INDEX "IDX_contract_performance_period" ON "contract_performance_metrics" ("period_start", "period_end")`);
        await queryRunner.query(`CREATE INDEX "IDX_contract_performance_status" ON "contract_performance_metrics" ("status")`);
        await queryRunner.query(`CREATE INDEX "IDX_contract_performance_escalation" ON "contract_performance_metrics" ("escalation_triggered", "requires_action")`);

        // Create foreign key constraints
        await queryRunner.query(`ALTER TABLE "platform_sites" ADD CONSTRAINT "FK_platform_sites_platform" FOREIGN KEY ("platform_id") REFERENCES "platforms"("id") ON DELETE CASCADE`);
        await queryRunner.query(`ALTER TABLE "platform_contacts" ADD CONSTRAINT "FK_platform_contacts_platform" FOREIGN KEY ("platform_id") REFERENCES "platforms"("id") ON DELETE CASCADE`);
        await queryRunner.query(`ALTER TABLE "stations" ADD CONSTRAINT "FK_stations_group" FOREIGN KEY ("station_group_id") REFERENCES "station_groups"("id") ON DELETE SET NULL`);
        await queryRunner.query(`ALTER TABLE "station_contacts" ADD CONSTRAINT "FK_station_contacts_station" FOREIGN KEY ("station_id") REFERENCES "stations"("id") ON DELETE CASCADE`);
        await queryRunner.query(`ALTER TABLE "supplier_sites" ADD CONSTRAINT "FK_supplier_sites_supplier" FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("id") ON DELETE CASCADE`);
        await queryRunner.query(`ALTER TABLE "supplier_contacts" ADD CONSTRAINT "FK_supplier_contacts_supplier" FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("id") ON DELETE CASCADE`);
        await queryRunner.query(`ALTER TABLE "products" ADD CONSTRAINT "FK_products_created_by" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL`);
        await queryRunner.query(`ALTER TABLE "products" ADD CONSTRAINT "FK_products_updated_by" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE SET NULL`);
        await queryRunner.query(`ALTER TABLE "product_suppliers" ADD CONSTRAINT "FK_product_suppliers_product" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE`);
        await queryRunner.query(`ALTER TABLE "product_suppliers" ADD CONSTRAINT "FK_product_suppliers_supplier" FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("id") ON DELETE CASCADE`);
        await queryRunner.query(`ALTER TABLE "master_orders" ADD CONSTRAINT "FK_master_orders_station" FOREIGN KEY ("customer_station_id") REFERENCES "stations"("id") ON DELETE RESTRICT`);
        await queryRunner.query(`ALTER TABLE "master_orders" ADD CONSTRAINT "FK_master_orders_platform" FOREIGN KEY ("customer_platform_id") REFERENCES "platforms"("id") ON DELETE RESTRICT`);
        await queryRunner.query(`ALTER TABLE "master_orders" ADD CONSTRAINT "FK_master_orders_created_by" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT`);
        await queryRunner.query(`ALTER TABLE "purchase_orders" ADD CONSTRAINT "FK_purchase_orders_master" FOREIGN KEY ("master_order_id") REFERENCES "master_orders"("id") ON DELETE SET NULL`);
        await queryRunner.query(`ALTER TABLE "purchase_orders" ADD CONSTRAINT "FK_purchase_orders_supplier" FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("id") ON DELETE RESTRICT`);
        await queryRunner.query(`ALTER TABLE "purchase_orders" ADD CONSTRAINT "FK_purchase_orders_station" FOREIGN KEY ("station_id") REFERENCES "stations"("id") ON DELETE RESTRICT`);
        await queryRunner.query(`ALTER TABLE "purchase_orders" ADD CONSTRAINT "FK_purchase_orders_platform" FOREIGN KEY ("platform_id") REFERENCES "platforms"("id") ON DELETE RESTRICT`);
        await queryRunner.query(`ALTER TABLE "purchase_orders" ADD CONSTRAINT "FK_purchase_orders_delivery_station" FOREIGN KEY ("delivery_station_id") REFERENCES "stations"("id") ON DELETE SET NULL`);
        await queryRunner.query(`ALTER TABLE "purchase_orders" ADD CONSTRAINT "FK_purchase_orders_created_by" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT`);
        await queryRunner.query(`ALTER TABLE "purchase_orders" ADD CONSTRAINT "FK_purchase_orders_approved_by" FOREIGN KEY ("approved_by") REFERENCES "users"("id") ON DELETE SET NULL`);
        await queryRunner.query(`ALTER TABLE "sales_orders" ADD CONSTRAINT "FK_sales_orders_customer_station" FOREIGN KEY ("customer_station_id") REFERENCES "stations"("id") ON DELETE RESTRICT`);
        await queryRunner.query(`ALTER TABLE "sales_orders" ADD CONSTRAINT "FK_sales_orders_fulfillment_platform" FOREIGN KEY ("fulfillment_platform_id") REFERENCES "platforms"("id") ON DELETE RESTRICT`);
        await queryRunner.query(`ALTER TABLE "sales_orders" ADD CONSTRAINT "FK_sales_orders_created_by" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT`);
        await queryRunner.query(`ALTER TABLE "sales_orders" ADD CONSTRAINT "FK_sales_orders_fulfilled_by" FOREIGN KEY ("fulfilled_by") REFERENCES "users"("id") ON DELETE SET NULL`);
        await queryRunner.query(`ALTER TABLE "purchase_order_products" ADD CONSTRAINT "FK_purchase_order_products_purchase_order" FOREIGN KEY ("purchase_order_id") REFERENCES "purchase_orders"("id") ON DELETE CASCADE`);
        await queryRunner.query(`ALTER TABLE "purchase_order_products" ADD CONSTRAINT "FK_purchase_order_products_product" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT`);
        await queryRunner.query(`ALTER TABLE "purchase_order_products" ADD CONSTRAINT "FK_purchase_order_products_product_supplier" FOREIGN KEY ("product_supplier_id") REFERENCES "product_suppliers"("id") ON DELETE SET NULL`);
        await queryRunner.query(`ALTER TABLE "sales_order_products" ADD CONSTRAINT "FK_sales_order_products_sales_order" FOREIGN KEY ("sales_order_id") REFERENCES "sales_orders"("id") ON DELETE CASCADE`);
        await queryRunner.query(`ALTER TABLE "sales_order_products" ADD CONSTRAINT "FK_sales_order_products_product" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT`);
        await queryRunner.query(`ALTER TABLE "stock_stations" ADD CONSTRAINT "FK_stock_stations_station" FOREIGN KEY ("station_id") REFERENCES "stations"("id") ON DELETE CASCADE`);
        await queryRunner.query(`ALTER TABLE "stock_stations" ADD CONSTRAINT "FK_stock_stations_product" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE`);
        await queryRunner.query(`ALTER TABLE "stock_platforms" ADD CONSTRAINT "FK_stock_platforms_platform" FOREIGN KEY ("platform_id") REFERENCES "platforms"("id") ON DELETE CASCADE`);
        await queryRunner.query(`ALTER TABLE "stock_platforms" ADD CONSTRAINT "FK_stock_platforms_product" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE`);
        await queryRunner.query(`ALTER TABLE "stock_suppliers" ADD CONSTRAINT "FK_stock_suppliers_supplier" FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("id") ON DELETE CASCADE`);
        await queryRunner.query(`ALTER TABLE "stock_suppliers" ADD CONSTRAINT "FK_stock_suppliers_product" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE`);
        await queryRunner.query(`ALTER TABLE "transfer_requests" ADD CONSTRAINT "FK_transfer_requests_from_station" FOREIGN KEY ("from_station_id") REFERENCES "stations"("id") ON DELETE RESTRICT`);
        await queryRunner.query(`ALTER TABLE "transfer_requests" ADD CONSTRAINT "FK_transfer_requests_to_station" FOREIGN KEY ("to_station_id") REFERENCES "stations"("id") ON DELETE RESTRICT`);
        await queryRunner.query(`ALTER TABLE "transfer_requests" ADD CONSTRAINT "FK_transfer_requests_requested_by" FOREIGN KEY ("requested_by") REFERENCES "users"("id") ON DELETE RESTRICT`);
        await queryRunner.query(`ALTER TABLE "transfer_request_products" ADD CONSTRAINT "FK_transfer_request_products_transfer" FOREIGN KEY ("transfer_request_id") REFERENCES "transfer_requests"("id") ON DELETE CASCADE`);
        await queryRunner.query(`ALTER TABLE "transfer_request_products" ADD CONSTRAINT "FK_transfer_request_products_product" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT`);
        await queryRunner.query(`ALTER TABLE "shopping_carts" ADD CONSTRAINT "FK_shopping_carts_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE`);
        await queryRunner.query(`ALTER TABLE "shopping_carts" ADD CONSTRAINT "FK_shopping_carts_station" FOREIGN KEY ("station_id") REFERENCES "stations"("id") ON DELETE CASCADE`);
        await queryRunner.query(`ALTER TABLE "shopping_cart_items" ADD CONSTRAINT "FK_shopping_cart_items_cart" FOREIGN KEY ("shopping_cart_id") REFERENCES "shopping_carts"("id") ON DELETE CASCADE`);
        await queryRunner.query(`ALTER TABLE "shopping_cart_items" ADD CONSTRAINT "FK_shopping_cart_items_product" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT`);
        await queryRunner.query(`ALTER TABLE "shopping_cart_items" ADD CONSTRAINT "FK_shopping_cart_items_product_supplier" FOREIGN KEY ("product_supplier_id") REFERENCES "product_suppliers"("id") ON DELETE RESTRICT`);
        await queryRunner.query(`ALTER TABLE "forecasts" ADD CONSTRAINT "FK_forecasts_product" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE`);
        await queryRunner.query(`ALTER TABLE "forecasts" ADD CONSTRAINT "FK_forecasts_supplier" FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("id") ON DELETE SET NULL`);
        await queryRunner.query(`ALTER TABLE "forecasts" ADD CONSTRAINT "FK_forecasts_created_by" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT`);
        await queryRunner.query(`ALTER TABLE "documents" ADD CONSTRAINT "FK_documents_uploaded_by" FOREIGN KEY ("uploaded_by") REFERENCES "users"("id") ON DELETE RESTRICT`);
        await queryRunner.query(`ALTER TABLE "documents" ADD CONSTRAINT "FK_documents_parent" FOREIGN KEY ("parent_document_id") REFERENCES "documents"("id") ON DELETE SET NULL`);
        await queryRunner.query(`ALTER TABLE "document_access" ADD CONSTRAINT "FK_document_access_document" FOREIGN KEY ("document_id") REFERENCES "documents"("id") ON DELETE CASCADE`);
        await queryRunner.query(`ALTER TABLE "document_access" ADD CONSTRAINT "FK_document_access_granted_by" FOREIGN KEY ("granted_by") REFERENCES "users"("id") ON DELETE RESTRICT`);
        
        // Contract management foreign keys
        await queryRunner.query(`ALTER TABLE "master_contracts" ADD CONSTRAINT "FK_master_contracts_supplier" FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("id") ON DELETE RESTRICT`);
        await queryRunner.query(`ALTER TABLE "contract_product_slas" ADD CONSTRAINT "FK_contract_product_slas_contract" FOREIGN KEY ("master_contract_id") REFERENCES "master_contracts"("id") ON DELETE CASCADE`);
        await queryRunner.query(`ALTER TABLE "contract_product_slas" ADD CONSTRAINT "FK_contract_product_slas_product" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE`);
        await queryRunner.query(`ALTER TABLE "contract_product_slas" ADD CONSTRAINT "FK_contract_product_slas_created_by" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT`);
        await queryRunner.query(`ALTER TABLE "contract_performance_metrics" ADD CONSTRAINT "FK_contract_performance_contract" FOREIGN KEY ("master_contract_id") REFERENCES "master_contracts"("id") ON DELETE CASCADE`);
        await queryRunner.query(`ALTER TABLE "contract_performance_metrics" ADD CONSTRAINT "FK_contract_performance_product" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE SET NULL`);
        await queryRunner.query(`ALTER TABLE "contract_performance_metrics" ADD CONSTRAINT "FK_contract_performance_calculated_by" FOREIGN KEY ("calculated_by") REFERENCES "users"("id") ON DELETE RESTRICT`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop all tables in reverse dependency order
        const allTables = [
            'document_access',
            'documents',
            'contract_performance_metrics',
            'contract_product_slas',
            'master_contracts',
            'forecasts',
            'shopping_cart_items',
            'shopping_carts',
            'transfer_request_products',
            'transfer_requests',
            'stock_suppliers',
            'stock_platforms',
            'stock_stations',
            'sales_order_products',
            'purchase_order_products',
            'sales_orders',
            'purchase_orders',
            'master_orders',
            'product_suppliers',
            'products',
            'users',
            'supplier_contacts',
            'supplier_sites',
            'suppliers',
            'station_contacts',
            'stations',
            'platform_contacts',
            'platform_sites',
            'platforms',
            'station_groups'
        ];

        for (const table of allTables) {
            await queryRunner.query(`DROP TABLE IF EXISTS "${table}" CASCADE`);
        }

        // Drop all enums
        const allEnums = [
            'access_entity_type',
            'access_type',
            'document_entity_type', 
            'document_status',
            'document_type',
            'measurement_period',
            'performance_status',
            'metric_type',
            'contract_status',
            'contract_type',
            'transfer_status',
            'order_status',
            'product_category',
            'conditioning_unit',
            'entity_type',
            'user_role'
        ];

        for (const enumType of allEnums) {
            await queryRunner.query(`DROP TYPE IF EXISTS "${enumType}" CASCADE`);
        }
    }

}
