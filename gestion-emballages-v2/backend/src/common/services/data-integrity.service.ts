import { Injectable, BadRequestException } from '@nestjs/common';
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
  constructor(
    @InjectDataSource()
    private dataSource: DataSource,
  ) {}

  /**
   * Check data integrity before hard delete
   */
  async checkDeleteIntegrity(entityType: string, entityId: string): Promise<DataIntegrityReport> {
    const checks: DataIntegrityCheck[] = [];
    let blockers: DataIntegrityCheck[] = [];
    let warnings: DataIntegrityCheck[] = [];

    switch (entityType.toLowerCase()) {
      case 'station':
        checks.push(...await this.checkStationReferences(entityId));
        break;
      case 'fournisseur':
        checks.push(...await this.checkFournisseurReferences(entityId));
        break;
      case 'article':
        checks.push(...await this.checkArticleReferences(entityId));
        break;
      case 'user':
        checks.push(...await this.checkUserReferences(entityId));
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
      totalReferences
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
      references: ['Users assigned to this station']
    });

    // Check orders
    const orderCount = await this.dataSource.query(
      'SELECT COUNT(*) as count FROM commandes WHERE "stationId" = $1',
      [stationId]
    );
    checks.push({
      entity: 'commandes',
      count: parseInt(orderCount[0].count),
      references: ['Orders placed by this station']
    });

    // Check stock
    const stockCount = await this.dataSource.query(
      'SELECT COUNT(*) as count FROM stock_stations WHERE "stationId" = $1',
      [stationId]
    );
    checks.push({
      entity: 'stock_stations',
      count: parseInt(stockCount[0].count),
      references: ['Stock records for this station']
    });

    // Check transfer requests (as source or destination)
    const transferCount = await this.dataSource.query(
      'SELECT COUNT(*) as count FROM demandes_transfert WHERE "stationSourceId" = $1 OR "stationDestinationId" = $1',
      [stationId]
    );
    checks.push({
      entity: 'demandes_transfert',
      count: parseInt(transferCount[0].count),
      references: ['Transfer requests involving this station']
    });

    return checks;
  }

  private async checkFournisseurReferences(fournisseurId: string): Promise<DataIntegrityCheck[]> {
    const checks: DataIntegrityCheck[] = [];

    // Check users
    const userCount = await this.dataSource.query(
      'SELECT COUNT(*) as count FROM users WHERE "entiteId" = $1 AND "entiteType" = $2',
      [fournisseurId, 'Fournisseur']
    );
    checks.push({
      entity: 'users',
      count: parseInt(userCount[0].count),
      references: ['Users assigned to this supplier']
    });

    // Check article-fournisseur relationships
    const articleCount = await this.dataSource.query(
      'SELECT COUNT(*) as count FROM article_fournisseurs WHERE "fournisseurId" = $1',
      [fournisseurId]
    );
    checks.push({
      entity: 'article_fournisseurs',
      count: parseInt(articleCount[0].count),
      references: ['Articles supplied by this supplier']
    });

    // Check orders
    const orderCount = await this.dataSource.query(
      'SELECT COUNT(*) as count FROM commandes WHERE "fournisseurId" = $1',
      [fournisseurId]
    );
    checks.push({
      entity: 'commandes',
      count: parseInt(orderCount[0].count),
      references: ['Orders placed with this supplier']
    });

    // Check fournisseur sites
    const siteCount = await this.dataSource.query(
      'SELECT COUNT(*) as count FROM fournisseur_sites WHERE "fournisseurId" = $1',
      [fournisseurId]
    );
    checks.push({
      entity: 'fournisseur_sites',
      count: parseInt(siteCount[0].count),
      references: ['Sites belonging to this supplier']
    });

    return checks;
  }

  private async checkArticleReferences(articleId: string): Promise<DataIntegrityCheck[]> {
    const checks: DataIntegrityCheck[] = [];

    // Check article-fournisseur relationships
    const supplierCount = await this.dataSource.query(
      'SELECT COUNT(*) as count FROM article_fournisseurs WHERE "articleId" = $1',
      [articleId]
    );
    checks.push({
      entity: 'article_fournisseurs',
      count: parseInt(supplierCount[0].count),
      references: ['Supplier relationships for this article']
    });

    // Check order items
    const orderItemCount = await this.dataSource.query(
      'SELECT COUNT(*) as count FROM commande_items WHERE "articleId" = $1',
      [articleId]
    );
    checks.push({
      entity: 'commande_items',
      count: parseInt(orderItemCount[0].count),
      references: ['Order items containing this article']
    });

    // Check stock stations
    const stockStationCount = await this.dataSource.query(
      'SELECT COUNT(*) as count FROM stock_stations WHERE "articleId" = $1',
      [articleId]
    );
    checks.push({
      entity: 'stock_stations',
      count: parseInt(stockStationCount[0].count),
      references: ['Station stock records for this article']
    });

    // Check platform stock
    const stockPlatformCount = await this.dataSource.query(
      'SELECT COUNT(*) as count FROM stocks_platform WHERE "articleId" = $1',
      [articleId]
    );
    checks.push({
      entity: 'stocks_platform',
      count: parseInt(stockPlatformCount[0].count),
      references: ['Platform stock records for this article']
    });

    return checks;
  }

  private async checkUserReferences(userId: string): Promise<DataIntegrityCheck[]> {
    const checks: DataIntegrityCheck[] = [];

    // Check created entities (audit trails)
    const createdEntitiesCount = await this.dataSource.query(
      'SELECT COUNT(*) as count FROM (' +
      'SELECT "createdBy" FROM commandes WHERE "createdBy" = $1 ' +
      'UNION ALL ' +
      'SELECT "createdBy" FROM demandes_transfert WHERE "createdBy" = $1 ' +
      'UNION ALL ' +
      'SELECT "createdBy" FROM stock_stations WHERE "createdBy" = $1' +
      ') as created_entities',
      [userId]
    );
    checks.push({
      entity: 'audit_trails',
      count: parseInt(createdEntitiesCount[0].count),
      references: ['Entities created by this user (audit trail)']
    });

    return checks;
  }

  private isBlockingReference(entityType: string): boolean {
    // Define which references should block deletion
    const blockingEntities = [
      'commandes', // Orders should prevent deletion
      'commande_items', // Order items should prevent deletion
      'audit_trails' // Audit trails should prevent deletion
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
        message: `Successfully deleted ${entityType} and ${cascadeCount} related records`
      };

    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private async performCascadeDelete(entityType: string, entityId: string, queryRunner: any): Promise<number> {
    let deleteCount = 0;

    switch (entityType.toLowerCase()) {
      case 'station':
        // Delete station-related data
        await queryRunner.query('DELETE FROM stock_stations WHERE "stationId" = $1', [entityId]);
        await queryRunner.query('DELETE FROM demandes_transfert WHERE "stationSourceId" = $1 OR "stationDestinationId" = $1', [entityId]);
        break;
      
      case 'fournisseur':
        // Delete supplier-related data (but keep historical orders)
        await queryRunner.query('DELETE FROM article_fournisseurs WHERE "fournisseurId" = $1', [entityId]);
        await queryRunner.query('DELETE FROM fournisseur_sites WHERE "fournisseurId" = $1', [entityId]);
        break;
      
      case 'article':
        // Delete article-related data (but keep historical order items)
        await queryRunner.query('DELETE FROM article_fournisseurs WHERE "articleId" = $1', [entityId]);
        await queryRunner.query('DELETE FROM stock_stations WHERE "articleId" = $1', [entityId]);
        await queryRunner.query('DELETE FROM stocks_platform WHERE "articleId" = $1', [entityId]);
        break;
    }

    return deleteCount;
  }

  private async deleteMainEntity(entityType: string, entityId: string, queryRunner: any): Promise<void> {
    const tableMap = {
      'station': 'stations',
      'fournisseur': 'fournisseurs',
      'article': 'articles',
      'user': 'users'
    };

    const tableName = tableMap[entityType.toLowerCase()];
    if (!tableName) {
      throw new BadRequestException(`Unknown entity type: ${entityType}`);
    }

    await queryRunner.query(`DELETE FROM ${tableName} WHERE id = $1`, [entityId]);
  }
}