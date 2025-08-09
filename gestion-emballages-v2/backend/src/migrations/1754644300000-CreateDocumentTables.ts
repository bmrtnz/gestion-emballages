import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateDocumentTables1754644300000 implements MigrationInterface {
  name = 'CreateDocumentTables1754644300000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create document_types enum
    await queryRunner.query(`
      CREATE TYPE "document_type" AS ENUM (
        'PRODUCT_IMAGE',
        'PLATFORM_CERTIFICATION', 
        'SUPPLIER_CERTIFICATION',
        'STATION_CERTIFICATION',
        'QUALITY_CERTIFICATE',
        'SAFETY_CERTIFICATE',
        'PRODUCT_QUALITY_CERTIFICATE',
        'PRODUCT_SAFETY_CERTIFICATE',
        'PRODUCT_COMPLIANCE_CERTIFICATE',
        'PRODUCT_SPECIFICATION_SHEET',
        'PRODUCT_MATERIAL_CERTIFICATE',
        'PRODUCT_TEST_REPORT',
        'DELIVERY_DISCREPANCY_PHOTO',
        'PRODUCT_DISCREPANCY_PHOTO',
        'QUALITY_ISSUE_PHOTO',
        'DAMAGE_REPORT_PHOTO',
        'NON_CONFORMITY_PHOTO',
        'POST_DELIVERY_DAMAGE_PHOTO',
        'POST_DELIVERY_QUALITY_ISSUE_PHOTO',
        'POST_DELIVERY_MISSING_ITEMS_PHOTO',
        'POST_DELIVERY_WRONG_ITEMS_PHOTO',
        'POST_DELIVERY_CONTAMINATION_PHOTO',
        'POST_DELIVERY_SPOILAGE_PHOTO',
        'CUSTOMER_COMPLAINT_PHOTO',
        'PURCHASE_ORDER',
        'SALES_ORDER', 
        'MASTER_ORDER',
        'INVOICE',
        'DELIVERY_NOTE',
        'PACKING_LIST',
        'STOCK_REPORT',
        'SALES_REPORT',
        'PLATFORM_REPORT',
        'CONTRACT',
        'SPECIFICATION',
        'OTHER'
      )
    `);

    // Create document_status enum
    await queryRunner.query(`
      CREATE TYPE "document_status" AS ENUM (
        'DRAFT',
        'ACTIVE', 
        'ARCHIVED',
        'EXPIRED'
      )
    `);

    // Create entity_type enum
    await queryRunner.query(`
      CREATE TYPE "entity_type" AS ENUM (
        'PRODUCT_SUPPLIER',
        'PLATFORM',
        'SUPPLIER',
        'STATION', 
        'PURCHASE_ORDER',
        'SALES_ORDER',
        'MASTER_ORDER',
        'USER',
        'DELIVERY',
        'ORDER_PRODUCT',
        'TRANSFER_REQUEST',
        'STOCK_MOVEMENT'
      )
    `);

    // Create access_type enum
    await queryRunner.query(`
      CREATE TYPE "access_type" AS ENUM (
        'READ',
        'WRITE',
        'DELETE', 
        'ADMIN'
      )
    `);

    // Create access_entity_type enum  
    await queryRunner.query(`
      CREATE TYPE "access_entity_type" AS ENUM (
        'USER',
        'STATION',
        'SUPPLIER',
        'PLATFORM',
        'ROLE'
      )
    `);

    // Create documents table
    await queryRunner.createTable(
      new Table({
        name: 'documents',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          {
            name: 'title',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'document_type',
            type: 'enum',
            enum: [
              'PRODUCT_IMAGE',
              'PLATFORM_CERTIFICATION', 
              'SUPPLIER_CERTIFICATION',
              'STATION_CERTIFICATION',
              'QUALITY_CERTIFICATE',
              'SAFETY_CERTIFICATE',
              'PRODUCT_QUALITY_CERTIFICATE',
              'PRODUCT_SAFETY_CERTIFICATE',
              'PRODUCT_COMPLIANCE_CERTIFICATE',
              'PRODUCT_SPECIFICATION_SHEET',
              'PRODUCT_MATERIAL_CERTIFICATE',
              'PRODUCT_TEST_REPORT',
              'DELIVERY_DISCREPANCY_PHOTO',
              'PRODUCT_DISCREPANCY_PHOTO',
              'QUALITY_ISSUE_PHOTO',
              'DAMAGE_REPORT_PHOTO',
              'NON_CONFORMITY_PHOTO',
              'POST_DELIVERY_DAMAGE_PHOTO',
              'POST_DELIVERY_QUALITY_ISSUE_PHOTO',
              'POST_DELIVERY_MISSING_ITEMS_PHOTO',
              'POST_DELIVERY_WRONG_ITEMS_PHOTO',
              'POST_DELIVERY_CONTAMINATION_PHOTO',
              'POST_DELIVERY_SPOILAGE_PHOTO',
              'CUSTOMER_COMPLAINT_PHOTO',
              'PURCHASE_ORDER',
              'SALES_ORDER', 
              'MASTER_ORDER',
              'INVOICE',
              'DELIVERY_NOTE',
              'PACKING_LIST',
              'STOCK_REPORT',
              'SALES_REPORT',
              'PLATFORM_REPORT',
              'CONTRACT',
              'SPECIFICATION',
              'OTHER'
            ],
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['DRAFT', 'ACTIVE', 'ARCHIVED', 'EXPIRED'],
            default: "'ACTIVE'",
          },
          {
            name: 'entity_type',
            type: 'enum',
            enum: [
              'PRODUCT_SUPPLIER',
              'PLATFORM',
              'SUPPLIER',
              'STATION', 
              'PURCHASE_ORDER',
              'SALES_ORDER',
              'MASTER_ORDER',
              'USER',
              'DELIVERY',
              'ORDER_PRODUCT',
              'TRANSFER_REQUEST',
              'STOCK_MOVEMENT'
            ],
          },
          {
            name: 'entity_id',
            type: 'uuid',
          },
          {
            name: 'file_name',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'original_name',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'mime_type',
            type: 'varchar',
            length: '100',
          },
          {
            name: 'file_size',
            type: 'bigint',
          },
          {
            name: 'file_path',
            type: 'varchar',
            length: '500',
          },
          {
            name: 'minio_bucket',
            type: 'varchar',
            length: '100',
          },
          {
            name: 'is_public',
            type: 'boolean',
            default: false,
          },
          {
            name: 'access_level',
            type: 'varchar',
            length: '20',
            default: "'INTERNAL'",
          },
          {
            name: 'metadata',
            type: 'jsonb',
            default: "'{}'",
          },
          {
            name: 'version',
            type: 'int',
            default: 1,
          },
          {
            name: 'parent_document_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'uploaded_by',
            type: 'uuid',
          },
          {
            name: 'last_accessed_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'download_count',
            type: 'int',
            default: 0,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
          },
        ],
      }),
      true,
    );

    // Create document_access table
    await queryRunner.createTable(
      new Table({
        name: 'document_access',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          {
            name: 'document_id',
            type: 'uuid',
          },
          {
            name: 'access_type',
            type: 'enum',
            enum: ['READ', 'WRITE', 'DELETE', 'ADMIN'],
          },
          {
            name: 'entity_type',
            type: 'enum', 
            enum: ['USER', 'STATION', 'SUPPLIER', 'PLATFORM', 'ROLE'],
          },
          {
            name: 'entity_id',
            type: 'uuid',
          },
          {
            name: 'granted_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'expires_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'granted_by',
            type: 'uuid',
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
          },
          {
            name: 'constraints',
            type: 'jsonb',
            default: "'{}'",
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Create indexes for documents table
    await queryRunner.createIndex('documents', new TableIndex({
      name: 'IDX_documents_entity',
      columnNames: ['entity_type', 'entity_id']
    }));
    await queryRunner.createIndex('documents', new TableIndex({
      name: 'IDX_documents_type',
      columnNames: ['document_type']
    }));
    await queryRunner.createIndex('documents', new TableIndex({
      name: 'IDX_documents_status',
      columnNames: ['status']
    })); 
    await queryRunner.createIndex('documents', new TableIndex({
      name: 'IDX_documents_public',
      columnNames: ['is_public']
    }));
    await queryRunner.createIndex('documents', new TableIndex({
      name: 'IDX_documents_uploaded_by',
      columnNames: ['uploaded_by']
    }));
    await queryRunner.createIndex('documents', new TableIndex({
      name: 'IDX_documents_created_at',
      columnNames: ['created_at']
    }));
    await queryRunner.createIndex('documents', new TableIndex({
      name: 'IDX_documents_file_path',
      columnNames: ['minio_bucket', 'file_path']
    }));

    // Create indexes for document_access table
    await queryRunner.createIndex('document_access', new TableIndex({
      name: 'IDX_document_access_document',
      columnNames: ['document_id']
    }));
    await queryRunner.createIndex('document_access', new TableIndex({
      name: 'IDX_document_access_entity',
      columnNames: ['entity_type', 'entity_id']
    }));
    await queryRunner.createIndex('document_access', new TableIndex({
      name: 'IDX_document_access_type',
      columnNames: ['access_type']
    }));
    await queryRunner.createIndex('document_access', new TableIndex({
      name: 'IDX_document_access_active',
      columnNames: ['is_active']
    }));
    await queryRunner.createIndex('document_access', new TableIndex({
      name: 'IDX_document_access_expires',
      columnNames: ['expires_at']
    }));

    // Create unique constraint for document access
    await queryRunner.createIndex('document_access', new TableIndex({
      name: 'UQ_document_access_unique',
      columnNames: ['document_id', 'entity_type', 'entity_id', 'access_type'],
      isUnique: true
    }));

    // Create foreign keys
    await queryRunner.createForeignKey('documents', new TableForeignKey({
      columnNames: ['uploaded_by'],
      referencedTableName: 'users',
      referencedColumnNames: ['id'],
      onDelete: 'RESTRICT',
    }));

    await queryRunner.createForeignKey('documents', new TableForeignKey({
      columnNames: ['parent_document_id'],
      referencedTableName: 'documents',
      referencedColumnNames: ['id'],
      onDelete: 'SET NULL',
    }));

    await queryRunner.createForeignKey('document_access', new TableForeignKey({
      columnNames: ['document_id'],
      referencedTableName: 'documents',
      referencedColumnNames: ['id'],
      onDelete: 'CASCADE',
    }));

    await queryRunner.createForeignKey('document_access', new TableForeignKey({
      columnNames: ['granted_by'],
      referencedTableName: 'users',
      referencedColumnNames: ['id'],
      onDelete: 'RESTRICT',
    }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign keys
    const documentsTable = await queryRunner.getTable('documents');
    const documentAccessTable = await queryRunner.getTable('document_access');

    if (documentsTable) {
      const uploadedByForeignKey = documentsTable.foreignKeys.find(fk => fk.columnNames.indexOf('uploaded_by') !== -1);
      if (uploadedByForeignKey) {
        await queryRunner.dropForeignKey('documents', uploadedByForeignKey);
      }

      const parentDocumentForeignKey = documentsTable.foreignKeys.find(fk => fk.columnNames.indexOf('parent_document_id') !== -1);
      if (parentDocumentForeignKey) {
        await queryRunner.dropForeignKey('documents', parentDocumentForeignKey);
      }
    }

    if (documentAccessTable) {
      const documentIdForeignKey = documentAccessTable.foreignKeys.find(fk => fk.columnNames.indexOf('document_id') !== -1);
      if (documentIdForeignKey) {
        await queryRunner.dropForeignKey('document_access', documentIdForeignKey);
      }

      const grantedByForeignKey = documentAccessTable.foreignKeys.find(fk => fk.columnNames.indexOf('granted_by') !== -1);
      if (grantedByForeignKey) {
        await queryRunner.dropForeignKey('document_access', grantedByForeignKey);
      }
    }

    // Drop tables
    await queryRunner.dropTable('document_access');
    await queryRunner.dropTable('documents');

    // Drop enums
    await queryRunner.query('DROP TYPE "access_entity_type"');
    await queryRunner.query('DROP TYPE "access_type"');
    await queryRunner.query('DROP TYPE "entity_type"');
    await queryRunner.query('DROP TYPE "document_status"');
    await queryRunner.query('DROP TYPE "document_type"');
  }
}