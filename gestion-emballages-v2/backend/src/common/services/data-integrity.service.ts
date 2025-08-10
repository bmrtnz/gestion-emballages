import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

export interface DataIntegrityCheck {
  entity: string;
  count: number;
  references: string[];
}

export interface DataIntegrityReport {
  canDelete: boolean;
  blockers: DataIntegrityCheck[];
  warnings: DataIntegrityCheck[];
  totalReferences: number;
}

@Injectable()
export class DataIntegrityService {
  private readonly logger = new Logger(DataIntegrityService.name);

  constructor(
    @InjectDataSource()
    private dataSource: DataSource
  ) {}

  /**
   * Check data integrity before hard delete
   */
  async checkDeleteIntegrity(entityType: string, entityId: string): Promise<DataIntegrityReport> {
    const checks: DataIntegrityCheck[] = [];
    const blockers: DataIntegrityCheck[] = [];
    const warnings: DataIntegrityCheck[] = [];

    switch (entityType.toLowerCase()) {
      case 'station':
        checks.push(...(await this.checkStationReferences(entityId)));
        break;
      case 'Supplier':
        checks.push(...(await this.checkFournisseurReferences(entityId)));
        break;
      case 'Product':
        checks.push(...(await this.checkArticleReferences(entityId)));
        break;
      case 'user':
        checks.push(...(await this.checkUserReferences(entityId)));
        break;
      default:
        throw new BadRequestException(`Unsupported entity type: ${entityType}`);
    }

    // Classify checks into blockers and warnings
    for (const check of checks) {
      if (this.isBlockingReference(check.entity)) {
        if (check.count > 0) {
          blockers.push(check);
        }
      } else {
        if (check.count > 0) {
          warnings.push(check);
        }
      }
    }

    const totalReferences = checks.reduce((sum, check) => sum + check.count, 0);

    return {
      canDelete: blockers.length === 0,
      blockers,
      warnings,
      totalReferences,
    };
  }

  private async checkStationReferences(stationId: string): Promise<DataIntegrityCheck[]> {
    const checks: DataIntegrityCheck[] = [];

    // Check users
    const userCount = await this.dataSource.query(
      'SELECT COUNT(*) as count FROM users WHERE "entiteId" = $1 AND "entiteType" = $2',
      [stationId, 'Station']
    );
    checks.push({
      entity: 'users',
      count: parseInt(userCount[0].count),
      references: ['Users assigned to this station'],
    });

    // Check orders
    const orderCount = await this.dataSource.query('SELECT COUNT(*) as count FROM commandes WHERE "stationId" = $1', [
      stationId,
    ]);
    checks.push({
      entity: 'commandes',
      count: parseInt(orderCount[0].count),
      references: ['Orders placed by this station'],
    });

    // Check stock
    const stockCount = await this.dataSource.query(
      'SELECT COUNT(*) as count FROM stock_stations WHERE "stationId" = $1',
      [stationId]
    );
    checks.push({
      entity: 'stock_stations',
      count: parseInt(stockCount[0].count),
      references: ['Stock records for this station'],
    });

    // Check transfer requests (as source or destination)
    const transferCount = await this.dataSource.query(
      'SELECT COUNT(*) as count FROM demandes_transfert WHERE "stationSourceId" = $1 OR "stationDestinationId" = $1',
      [stationId]
    );
    checks.push({
      entity: 'demandes_transfert',
      count: parseInt(transferCount[0].count),
      references: ['Transfer requests involving this station'],
    });

    return checks;
  }

  private async checkFournisseurReferences(fournisseurId: string): Promise<DataIntegrityCheck[]> {
    const checks: DataIntegrityCheck[] = [];

    // Check users
    const userCount = await this.dataSource.query(
      'SELECT COUNT(*) as count FROM users WHERE "entiteId" = $1 AND "entiteType" = $2',
      [fournisseurId, 'Supplier']
    );
    checks.push({
      entity: 'users',
      count: parseInt(userCount[0].count),
      references: ['Users assigned to this supplier'],
    });

    // Check Product-Supplier relationships
    const articleCount = await this.dataSource.query(
      'SELECT COUNT(*) as count FROM article_fournisseurs WHERE "fournisseurId" = $1',
      [fournisseurId]
    );
    checks.push({
      entity: 'article_fournisseurs',
      count: parseInt(articleCount[0].count),
      references: ['Articles supplied by this supplier'],
    });

    // Check orders
    const orderCount = await this.dataSource.query(
      'SELECT COUNT(*) as count FROM commandes WHERE "fournisseurId" = $1',
      [fournisseurId]
    );
    checks.push({
      entity: 'commandes',
      count: parseInt(orderCount[0].count),
      references: ['Orders placed with this supplier'],
    });

    // Check Supplier sites
    const siteCount = await this.dataSource.query(
      'SELECT COUNT(*) as count FROM fournisseur_sites WHERE "fournisseurId" = $1',
      [fournisseurId]
    );
    checks.push({
      entity: 'fournisseur_sites',
      count: parseInt(siteCount[0].count),
      references: ['Sites belonging to this supplier'],
    });

    return checks;
  }

  private async checkArticleReferences(articleId: string): Promise<DataIntegrityCheck[]> {
    const checks: DataIntegrityCheck[] = [];

    // Check Product-Supplier relationships
    const supplierCount = await this.dataSource.query(
      'SELECT COUNT(*) as count FROM article_fournisseurs WHERE "articleId" = $1',
      [articleId]
    );
    checks.push({
      entity: 'article_fournisseurs',
      count: parseInt(supplierCount[0].count),
      references: ['Supplier relationships for this Product'],
    });

    // Check order items
    const orderItemCount = await this.dataSource.query(
      'SELECT COUNT(*) as count FROM commande_items WHERE "articleId" = $1',
      [articleId]
    );
    checks.push({
      entity: 'commande_items',
      count: parseInt(orderItemCount[0].count),
      references: ['Order items containing this Product'],
    });

    // Check stock stations
    const stockStationCount = await this.dataSource.query(
      'SELECT COUNT(*) as count FROM stock_stations WHERE "articleId" = $1',
      [articleId]
    );
    checks.push({
      entity: 'stock_stations',
      count: parseInt(stockStationCount[0].count),
      references: ['Station stock records for this Product'],
    });

    // Check platform stock
    const stockPlatformCount = await this.dataSource.query(
      'SELECT COUNT(*) as count FROM stocks_platform WHERE "articleId" = $1',
      [articleId]
    );
    checks.push({
      entity: 'stocks_platform',
      count: parseInt(stockPlatformCount[0].count),
      references: ['Platform stock records for this Product'],
    });

    return checks;
  }

  private async checkUserReferences(userId: string): Promise<DataIntegrityCheck[]> {
    const checks: DataIntegrityCheck[] = [];

    // Check all tables with audit trail columns
    try {
      // Tables with created_by only
      const createdOnlyTables = ['commandes', 'commandes_globales', 'previsions', 'demandes_transfert', 'liste_achats'];

      // Tables with both created_by and updated_by
      const fullAuditTables = [
        'stations',
        'fournisseurs',
        'articles',
        'platforms',
        'station_groups',
        'station_contacts',
      ];

      // Tables with updated_by only
      const updatedOnlyTables = ['stock_stations', 'stocks_platform'];

      // Build comprehensive audit trail query
      const auditQueries = [
        // created_by checks
        ...createdOnlyTables.map(
          table => `SELECT '${table}' as table_name, COUNT(*) as count FROM ${table} WHERE created_by = $1`
        ),
        ...fullAuditTables.map(
          table => `SELECT '${table}_created' as table_name, COUNT(*) as count FROM ${table} WHERE created_by = $1`
        ),

        // updated_by checks
        ...fullAuditTables.map(
          table => `SELECT '${table}_updated' as table_name, COUNT(*) as count FROM ${table} WHERE updated_by = $1`
        ),
        ...updatedOnlyTables.map(
          table => `SELECT '${table}' as table_name, COUNT(*) as count FROM ${table} WHERE updated_by = $1`
        ),
      ];

      const unionQuery = auditQueries.join(' UNION ALL ');
      const results = await this.dataSource.query(unionQuery, [userId]);

      const totalCount = results.reduce((sum: number, row: { count: string }) => sum + parseInt(row.count), 0);
      const referencingTables = results
        .filter((row: { count: string }) => parseInt(row.count) > 0)
        .map((row: { table_name: string; count: string }) => `${row.table_name}: ${row.count} records`);

      checks.push({
        entity: 'audit_trails',
        count: totalCount,
        references:
          referencingTables.length > 0
            ? ['Entities created or updated by this user:', ...referencingTables]
            : ['No audit trail references found'],
      });
    } catch (error) {
      // If audit trail check fails, skip it but don't block deletion
      this.logger.warn(`Could not check audit trails for user references: ${error.message}`);
      checks.push({
        entity: 'audit_trails',
        count: 0,
        references: ['Audit trail check skipped due to schema mismatch'],
      });
    }

    return checks;
  }

  private isBlockingReference(entityType: string): boolean {
    // Define which references should block deletion
    const blockingEntities = [
      'commandes', // Orders should prevent deletion
      'commande_items', // Order items should prevent deletion
      'audit_trails', // Audit trails should prevent deletion
    ];

    return blockingEntities.includes(entityType);
  }

  /**
   * Perform hard delete with cascade options
   */
  async performHardDelete(
    entityType: string,
    entityId: string,
    options: {
      cascadeDelete?: boolean;
      confirmIntegrityCheck?: boolean;
    } = {}
  ): Promise<{ deleted: boolean; cascadeCount: number; message: string }> {
    // Always check integrity first
    const integrityReport = await this.checkDeleteIntegrity(entityType, entityId);

    if (!integrityReport.canDelete && !options.cascadeDelete) {
      throw new BadRequestException(
        `Cannot delete ${entityType}. Found ${integrityReport.blockers.length} blocking references. ` +
          `Use cascadeDelete option to force deletion.`
      );
    }

    if (options.confirmIntegrityCheck && integrityReport.totalReferences > 0 && !options.cascadeDelete) {
      throw new BadRequestException(
        `Integrity check required. Found ${integrityReport.totalReferences} references. ` +
          `Confirm with cascadeDelete option if you want to proceed.`
      );
    }

    let cascadeCount = 0;
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Perform cascade deletions if requested
      if (options.cascadeDelete) {
        cascadeCount = await this.performCascadeDelete(entityType, entityId, queryRunner);
      }

      // Delete the main entity
      await this.deleteMainEntity(entityType, entityId, queryRunner);

      await queryRunner.commitTransaction();

      return {
        deleted: true,
        cascadeCount,
        message: `Successfully deleted ${entityType} and ${cascadeCount} related records`,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private async performCascadeDelete(
    entityType: string,
    entityId: string,
    queryRunner: { manager: { query: (sql: string, params?: unknown[]) => Promise<unknown[]> } }
  ): Promise<number> {
    const deleteCount = 0;

    switch (entityType.toLowerCase()) {
      case 'station':
        // Delete station-related data
        await queryRunner.query('DELETE FROM stock_stations WHERE "stationId" = $1', [entityId]);
        await queryRunner.query(
          'DELETE FROM demandes_transfert WHERE "stationSourceId" = $1 OR "stationDestinationId" = $1',
          [entityId]
        );
        break;

      case 'Supplier':
        // Delete supplier-related data (but keep historical orders)
        await queryRunner.query('DELETE FROM article_fournisseurs WHERE "fournisseurId" = $1', [entityId]);
        await queryRunner.query('DELETE FROM fournisseur_sites WHERE "fournisseurId" = $1', [entityId]);
        break;

      case 'Product':
        // Delete Product-related data (but keep historical order items)
        await queryRunner.query('DELETE FROM article_fournisseurs WHERE "articleId" = $1', [entityId]);
        await queryRunner.query('DELETE FROM stock_stations WHERE "articleId" = $1', [entityId]);
        await queryRunner.query('DELETE FROM stocks_platform WHERE "articleId" = $1', [entityId]);
        break;
    }

    return deleteCount;
  }

  private async deleteMainEntity(
    entityType: string,
    entityId: string,
    queryRunner: { manager: { query: (sql: string, params?: unknown[]) => Promise<void> } }
  ): Promise<void> {
    const tableMap = {
      station: 'stations',
      Supplier: 'fournisseurs',
      Product: 'articles',
      user: 'users',
    };

    const tableName = tableMap[entityType.toLowerCase()];
    if (!tableName) {
      throw new BadRequestException(`Unknown entity type: ${entityType}`);
    }

    await queryRunner.query(`DELETE FROM ${tableName} WHERE id = $1`, [entityId]);
  }
}
