import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import * as path from 'path';

// Import entities
import { User } from '@modules/users/entities/user.entity';
import { Station } from '@modules/stations/entities/station.entity';
import { StationGroup } from '@modules/stations/entities/station-group.entity';
import { StationContact } from '@modules/stations/entities/station-contact.entity';
import { Supplier } from '@modules/suppliers/entities/supplier.entity';
import { SupplierSite } from '@modules/suppliers/entities/supplier-site.entity';
import { Platform } from '@modules/platforms/entities/platform.entity';
import { PlatformSite } from '@modules/platforms/entities/platform-site.entity';
import { Product } from '@modules/products/entities/product.entity';
import { ProductSupplier } from '@modules/products/entities/product-supplier.entity';
import { StockStation } from '@modules/stocks/entities/stock-station.entity';
import { StockPlatform } from '@modules/stocks/entities/stock-platform.entity';

// Import enums
import { EntityType, UserRole } from '@common/enums/user-role.enum';
import { ProductCategory } from '@common/enums/product-category.enum';
import { ConditioningUnit } from '@common/enums/conditioning-unit.enum';

@Injectable()
export class DatabaseSeeder {
  private readonly logger = new Logger(DatabaseSeeder.name);
  private readonly dataPath = path.join(__dirname, 'data');

  constructor(
    @InjectDataSource()
    private dataSource: DataSource
  ) {}

  private systemAdminUser: User | null = null;

  private async createSystemAdminUser(): Promise<User> {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const systemAdmin = {
      email: 'system.admin@gestion-emballages.local',
      hashedPassword: hashedPassword,
      fullName: 'System Administrator',
      phone: null,
      role: UserRole.ADMIN,
      entityType: null,
      entityId: null,
      isActive: true,
    };

    const userRepo = this.dataSource.getRepository(User);
    const savedUser = await userRepo.save(systemAdmin);
    return savedUser;
  }

  async run(): Promise<void> {
    this.logger.log('Starting database seeding...');

    const startTime = Date.now();
    try {
      // 1. Clear existing data first (without transaction)
      this.logger.log('🧹 Clearing existing data...');
      await this.clearDatabaseDirectly();

      // 2. Wait a moment for cleanup to complete
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 3. Create system admin user FIRST (needed for audit fields)
      this.logger.log('👤 Creating system admin user...');
      this.systemAdminUser = await this.createSystemAdminUser();
      this.logger.log('✅ Created system admin user for audit trails');

      // 4. Seed core reference data
      this.logger.log('🏗️  Seeding core reference data...');
      const stationGroups = await this.seedStationGroups();
      this.logger.log(`✅ Created ${stationGroups.length} station groups`);

      const stations = await this.seedStations(stationGroups);
      this.logger.log(`✅ Created ${stations.length} stations with specializations`);

      await this.seedStationContacts(stations);
      this.logger.log('✅ Created comprehensive station contacts');

      const fournisseurs = await this.seedFournisseurs();
      this.logger.log(`✅ Created ${fournisseurs.length} suppliers with complete business data`);

      const platforms = await this.seedPlatforms();
      this.logger.log(`✅ Created ${platforms.length} strategic distribution platforms`);

      // 5. Seed remaining user accounts with role-based access
      this.logger.log('👥 Creating additional user accounts and access control...');
      const users = await this.seedUsers(stations, fournisseurs);
      this.logger.log(`✅ Created ${users.length} additional users with proper role assignments`);

      // 5. Seed comprehensive product catalog
      this.logger.log('📦 Building comprehensive product catalog...');
      const articles = await this.seedArticles();
      this.logger.log(`✅ Created ${articles.length} products across all packaging categories`);

      // 6. Establish supplier-product relationships with realistic pricing
      this.logger.log('🤝 Establishing supplier-product relationships...');
      await this.seedArticleFournisseurs(articles, fournisseurs);
      this.logger.log('✅ Created realistic product-supplier relationships with competitive pricing');

      // 7. Create strategic inventory distribution
      this.logger.log('📊 Distributing strategic inventory across network...');
      await this.seedInitialStock(articles, stations);
      this.logger.log('✅ Distributed station inventory based on specializations');

      // Note: Platform stock seeding skipped due to entity-schema inconsistencies
      // TODO: Fix StockPlatform entity schema alignment then re-enable
      this.logger.log('⚠️ Platform stock seeding skipped - requires entity schema fixes');
      
      // 8. Seed additional entities if data files exist
      await this.seedOptionalEntities();

      const endTime = Date.now();
      const duration = ((endTime - startTime) / 1000).toFixed(2);
      
      this.logger.log('\n' + '='.repeat(80));
      this.logger.log('🎉 DATABASE SEEDING COMPLETED SUCCESSFULLY!');
      this.logger.log(`⏱️  Total execution time: ${duration} seconds`);
      this.logger.log('📈 Ready to test comprehensive Blue Whale Portal features');
      this.logger.log('='.repeat(80));
      
    } catch (error) {
      this.logger.error('❌ Database seeding failed:', error);
      this.logger.error('Stack trace:', error.stack);
      throw error;
    }
  }

  private async clearDatabaseDirectly(): Promise<void> {
    // List of tables to clear in reverse dependency order
    const tablesToClear = [
      'stock_platforms',
      'stock_stations',
      'product_suppliers',
      'products',
      'users',
      'platform_sites',
      'platforms',
      'supplier_sites',
      'suppliers',
      'station_contacts',
      'stations',
      'station_groups',
    ];

    for (const tableName of tablesToClear) {
      try {
        // Check if table exists and clear it
        await this.dataSource.query(`
          DO $$ 
          BEGIN
            IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = '${tableName}') THEN
              DELETE FROM ${tableName};
            END IF;
          END $$;
        `);
        this.logger.log(`Cleared table: ${tableName}`);
      } catch (error) {
        this.logger.warn(`Skipped table ${tableName}: ${error.message}`);
      }
    }

    this.logger.log('Database cleanup completed');
  }

  private async seedStationGroups(): Promise<StationGroup[]> {
    const stationGroupsData = this.loadJsonData('station-groups.json');

    // Map properties to match actual database schema (no identifiant column)
    const processedGroups = stationGroupsData.map((groupData: any) => ({
      name: groupData.name,
      description: groupData.description,
      isActive: groupData.isActive,
    }));

    const stationGroupRepo = this.dataSource.getRepository(StationGroup);
    const stationGroups = await stationGroupRepo.save(processedGroups);
    return stationGroups;
  }

  private async seedStations(stationGroups: StationGroup[]): Promise<Station[]> {
    const stationsData = this.loadJsonData('stations.json');
    const stationGroupsJsonData = this.loadJsonData('station-groups.json');

    // Create lookup map from identifiant to name, then name to ID
    const identifiantToName = new Map(stationGroupsJsonData.map((g: any) => [g.identifiant, g.name]));
    const groupMap = new Map(stationGroups.map(group => [group.name, group.id]));

    // Process stations using TypeORM repository (proper entity handling)
    const processedStations = [];
    for (const stationData of stationsData as any[]) {
      const { groupeId, address, mainContact, internalId, ...stationInfo } = stationData as any;

      // Resolve group reference: identifiant -> name -> ID
      const groupName = groupeId ? identifiantToName.get(groupeId) : null;
      const resolvedGroupId = groupName ? groupMap.get(groupName) : null;

      // Create station object matching the Station entity structure
      const stationObj = {
        stationGroupId: resolvedGroupId,
        name: stationInfo.name,
        code: internalId,
        address: address?.street || null,
        city: address?.city || null,
        postalCode: address?.postalCode || null,
        country: address?.country || 'France',
        isActive: stationInfo.isActive !== undefined ? stationInfo.isActive : true,
        // Audit fields
        createdById: this.systemAdminUser!.id,
        // Store additional data as coordinates for now (extensible JSON field)
        coordinates: {
          specialization: stationInfo.specialization || null,
          productionVolume: stationInfo.productionVolume || null,
          peakSeason: stationInfo.peakSeason || null,
        } as any,
      };

      processedStations.push(stationObj);
    }

    // Save using TypeORM repository
    const stationRepo = this.dataSource.getRepository(Station);
    const savedStations = await stationRepo.save(processedStations);
    
    this.logger.log(`Successfully created ${savedStations.length} stations with proper entity structure`);
    return savedStations;
  }

  private async seedStationContacts(stations: Station[]): Promise<void> {
    const contactsData = this.loadJsonData('station-contacts.json');

    // Create lookup map for stations by their code (mapped from internalId)
    const stationMap = new Map(stations.map(station => [station.code, station]));

    const processedContacts = [];

    for (const contactData of contactsData as any[]) {
      const { stationIdentifiant, fullName, isPrincipal, isActive, ...otherInfo } = contactData as any;

      const station = stationMap.get(stationIdentifiant);
      if (station) {
        processedContacts.push({
          ...otherInfo,
          name: fullName, // Map fullName to name
          isPrimary: isPrincipal, // Map isPrincipal to isPrimary
          // Note: isActive field removed as StationContact no longer supports soft delete
          stationId: station.id,
          // Audit fields
          createdById: this.systemAdminUser!.id,
        });
      } else {
        this.logger.warn(`Station not found for contact: ${stationIdentifiant}`);
      }
    }

    if (processedContacts.length > 0) {
      const stationContactRepo = this.dataSource.getRepository(StationContact);
      await stationContactRepo.save(processedContacts);
    }
  }

  private async seedFournisseurs(): Promise<Supplier[]> {
    const fournisseursData = this.loadJsonData('fournisseurs.json');
    const fournisseurs = [];
    const supplierRepo = this.dataSource.getRepository(Supplier);
    const supplierSiteRepo = this.dataSource.getRepository(SupplierSite);

    // Create suppliers and their sites from JSON data
    for (const fournisseurData of fournisseursData as any[]) {
      const { sites, specialties, ...fournisseurInfo } = fournisseurData as any;

      // Process supplier data to match database schema
      const processedSupplierData = {
        ...fournisseurInfo,
        // Convert specialties array to string
        specialties: Array.isArray(specialties) ? specialties.join(', ') : specialties,
      };

      // Create supplier
      const supplier = await supplierRepo.save(processedSupplierData);
      fournisseurs.push(supplier);

      // Create supplier sites
      if (sites && sites.length > 0) {
        for (const siteData of sites) {
          const processedSiteData = {
            supplierId: supplier.id,
            name: siteData.name,
            address: siteData.adresse.rue,
            city: siteData.adresse.city,
            postalCode: siteData.adresse.postalCode,
            country: 'France',
            isPrimary: siteData.estPrincipal,
          };

          await supplierSiteRepo.save(processedSiteData);
        }
      } else {
        // Fallback: create a default principal site if no sites defined
        const siteData = {
          supplierId: supplier.id,
          name: `Site Principal ${supplier.name}`,
          address: supplier.address,
          city: supplier.city,
          postalCode: supplier.postalCode,
          country: supplier.country || 'France',
          isPrimary: true,
        };

        await supplierSiteRepo.save(siteData);
      }
    }

    return fournisseurs;
  }

  private async seedPlatforms(): Promise<Platform[]> {
    const platformsData = this.loadJsonData('platforms.json');
    const platforms = [];
    const platformRepo = this.dataSource.getRepository(Platform);
    const platformSiteRepo = this.dataSource.getRepository(PlatformSite);

    // Create platforms and their sites from JSON data
    for (const platformData of platformsData as any[]) {
      const { site, nom, specialites, ...platformInfo } = platformData as any;

      // Map French properties to English
      const processedPlatformData = {
        ...platformInfo,
        name: nom,
        specialties: specialites,
      };

      // Create platform
      const platform = await platformRepo.save(processedPlatformData);
      platforms.push(platform);

      // Create platform site
      if (site) {
        const { nom, adresse, ville, codePostal, telephone, ...siteInfo } = site;

        const siteData = {
          platformId: platform.id,
          name: nom,
          address: adresse,
          city: ville,
          postalCode: codePostal,
          phone: telephone,
          country: 'France',
          isPrimary: true,
          ...siteInfo,
        };
        await platformSiteRepo.save(siteData);
      }
    }

    return platforms;
  }

  private async seedUsers(stations: Station[], fournisseurs: Supplier[]): Promise<User[]> {
    const usersData = this.loadJsonData('users.json');
    const processedUsers = [];

    // Create lookup maps for entities
    const stationMap = new Map(stations.map(station => [station.name, station]));
    const fournisseurMap = new Map(fournisseurs.map(supplier => [supplier.name, supplier]));

    for (const userData of usersData as any[]) {
      const { password, entityRef, ...userInfo } = userData as any;

      // Hash the password from JSON file
      const hashedPassword = await bcrypt.hash(password, 10);

      // Convert role string to enum
      const roleEnum = userData.role as UserRole;

      // Resolve entity ID if needed
      let entityId = undefined;
      let entityType = undefined;

      if (entityRef) {
        if (userData.entityType === 'STATION') {
          const station = stationMap.get(entityRef);
          if (station) {
            entityId = station.id;
            entityType = EntityType.STATION;
          }
        } else if (userData.entityType === 'SUPPLIER') {
          const supplier = fournisseurMap.get(entityRef);
          if (supplier) {
            entityId = supplier.id;
            entityType = EntityType.SUPPLIER;
          }
        }
      }

      processedUsers.push({
        ...userInfo,
        hashedPassword,
        role: roleEnum,
        entityId,
        entityType,
      });
    }

    const userRepo = this.dataSource.getRepository(User);
    const users = await userRepo.save(processedUsers);
    return users;
  }

  private async seedArticles(): Promise<Product[]> {
    const articlesData = this.loadJsonData('articles.json');

    // Enhanced category mapping to match exact ProductCategory enum values
    const categoryMapping = {
      'Tray': ProductCategory.TRAY,
      'Crate': ProductCategory.CRATE,
      'Platter': ProductCategory.PLATTER,
      'Plastic Film': ProductCategory.PLASTIC_FILM,
      'Cardboard': ProductCategory.CARDBOARD,
      'Plastic Bag': ProductCategory.PLASTIC_BAG,
      'Paper Bag': ProductCategory.PAPER_BAG,
      'Isothermal Packaging': ProductCategory.ISOTHERMAL_PACKAGING,
      'Label': ProductCategory.LABEL,
      'Other': ProductCategory.OTHER,
    };

    // Convert category strings to enums and map properties
    const processedArticles = (articlesData as any[]).map((articleData: any) => {
      const category = categoryMapping[articleData.categorie] || ProductCategory.OTHER;
      
      return {
        productCode: articleData.codeArticle,
        description: articleData.description,
        designation: articleData.designation, // Add designation field
        dimensions: articleData.dimensions, // Add dimensions field
        category: category,
        isActive: articleData.isActive !== undefined ? articleData.isActive : true,
      };
    });

    const productRepo = this.dataSource.getRepository(Product);
    const articles = await productRepo.save(processedArticles);
    this.logger.log(`Successfully created ${articles.length} products with enhanced categorization`);
    return articles;
  }

  private async seedArticleFournisseurs(articles: Product[], fournisseurs: Supplier[]): Promise<void> {
    try {
      // Load realistic product-supplier relationships from JSON
      const productSuppliersData = this.loadJsonData('product-suppliers.json');
      const relationships = [];
      
      // Create lookup maps for efficient matching
      const productMap = new Map(articles.map(p => [p.productCode, p]));
      const supplierMap = new Map(fournisseurs.map(s => [s.name, s]));
      
      // Process predefined relationships from JSON
      for (const relationship of productSuppliersData as any[]) {
        const product = productMap.get(relationship.productCode);
        const supplier = supplierMap.get(relationship.supplierName);
        
        if (product && supplier) {
          relationships.push({
            productId: product.id,
            supplierId: supplier.id,
            supplierProductCode: relationship.supplierProductCode,
            conditioningPrice: relationship.conditioningPrice,
            conditioningUnit: relationship.conditioningUnit,
            quantityPerConditioning: relationship.quantityPerConditioning,
            indicativeSupplyDelay: relationship.indicativeSupplyDelay,
            minimumOrderQuantity: relationship.minimumOrderQuantity || 1,
            isActive: relationship.isActive !== undefined ? relationship.isActive : true,
          });
        } else {
          this.logger.warn(`Skipping relationship: Product ${relationship.productCode} or Supplier ${relationship.supplierName} not found`);
        }
      }
      
      // Fill remaining products with automatic relationships if needed
      const processedProducts = new Set(relationships.map(r => r.productId));
      const unprocessedProducts = articles.filter(p => !processedProducts.has(p.id));
      
      for (const product of unprocessedProducts) {
        // Each unprocessed product gets 1-2 random suppliers
        const numSuppliers = Math.floor(Math.random() * 2) + 1;
        const selectedSuppliers = this.getRandomElements(fournisseurs, numSuppliers);
        
        for (const supplier of selectedSuppliers) {
          const basePrice = this.getBasePriceForCategory(product.category);
          const priceVariation = (Math.random() - 0.5) * 0.2; // ±10%
          const finalPrice = basePrice * (1 + priceVariation);
          
          relationships.push({
            productId: product.id,
            supplierId: supplier.id,
            supplierProductCode: `${supplier.name.substring(0, 3).toUpperCase()}-${product.productCode}`,
            conditioningPrice: Math.round(finalPrice * 100) / 100,
            conditioningUnit: this.getConditionnementForCategory(product.category),
            quantityPerConditioning: this.getQuantiteConditionnement(product.category),
            indicativeSupplyDelay: Math.floor(Math.random() * 10) + 5,
            minimumOrderQuantity: Math.floor(Math.random() * 5) + 1,
            isActive: true,
          });
        }
      }
      
      const productSupplierRepo = this.dataSource.getRepository(ProductSupplier);
      await productSupplierRepo.save(relationships);
      this.logger.log(`Created ${relationships.length} product-supplier relationships (${productSuppliersData.length} from JSON, ${relationships.length - productSuppliersData.length} auto-generated)`);
      
    } catch (error) {
      this.logger.error('Error seeding product-supplier relationships:', error);
      // Fallback to original random generation
      this.logger.log('Falling back to random relationship generation...');
      await this.seedArticleFournisseursLegacy(articles, fournisseurs);
    }
  }
  
  private async seedArticleFournisseursLegacy(articles: Product[], fournisseurs: Supplier[]): Promise<void> {
    const relationships = [];

    // Create relationships between articles and suppliers with realistic pricing
    for (const product of articles) {
      // Each product will have 1-3 suppliers
      const numSuppliers = Math.floor(Math.random() * 3) + 1;
      const selectedSuppliers = this.getRandomElements(fournisseurs, numSuppliers);

      for (let i = 0; i < selectedSuppliers.length; i++) {
        const supplier = selectedSuppliers[i];
        const basePrice = this.getBasePriceForCategory(product.category);
        // Add some price variation between suppliers
        const priceVariation = (Math.random() - 0.5) * 0.3; // ±15%
        const finalPrice = basePrice * (1 + priceVariation);

        relationships.push({
          productId: product.id,
          supplierId: supplier.id,
          supplierProductCode: `${supplier.name.substring(0, 3).toUpperCase()}-${product.productCode}`,
          conditioningPrice: Math.round(finalPrice * 100) / 100,
          conditioningUnit: this.getConditionnementForCategory(product.category),
          quantityPerConditioning: this.getQuantiteConditionnement(product.category),
          indicativeSupplyDelay: Math.floor(Math.random() * 10) + 5, // 5-14 days
        });
      }
    }

    const productSupplierRepo = this.dataSource.getRepository(ProductSupplier);
    await productSupplierRepo.save(relationships);
  }

  private async seedInitialStock(articles: Product[], stations: Station[]): Promise<void> {
    const stockData = [];
    
    this.logger.log('Creating realistic station stock based on specializations...');

    // Create realistic stock based on station specializations
    for (const station of stations) {
      // Extract specialization from coordinates field (where we stored extra station data)
      const stationSpecialization = station.coordinates?.specialization || '';
      
      // Determine relevant products based on specialization
      const relevantProducts = this.getRelevantProductsForStation(articles, stationSpecialization);
      
      // Each station stocks 60-80% of relevant products
      const stockPercentage = 0.6 + Math.random() * 0.2;
      const articlesToStock = this.getRandomElements(relevantProducts, Math.floor(relevantProducts.length * stockPercentage));

      for (const product of articlesToStock) {
        // Vary quantities based on product category and station size
        const baseQuantity = this.getBaseQuantityForProduct(product.category, stationSpecialization);
        const variation = (Math.random() - 0.5) * 0.4; // ±20% variation
        const quantite = Math.max(50, Math.floor(baseQuantity * (1 + variation)));

        stockData.push({
          stationId: station.id,
          articleId: product.id, // StockStation uses articleId for product_id
          quantiteActuelle: quantite,
          seuilAlerte: Math.floor(quantite * 0.25), // 25% alert threshold
          seuilCritique: Math.floor(quantite * 0.15), // 15% critical threshold
        });
      }
    }

    if (stockData.length > 0) {
      const stockStationRepo = this.dataSource.getRepository(StockStation);
      await stockStationRepo.save(stockData);
      this.logger.log(`Created ${stockData.length} station stock entries with realistic distribution`);
    }
  }
  
  private getRelevantProductsForStation(articles: Product[], specialization: string): Product[] {
    const spec = specialization.toLowerCase();
    
    return articles.filter(product => {
      const productDesc = (product.description || '').toLowerCase();
      const productDesignation = ((product as any).designation || '').toLowerCase();
      
      // Match products to station specializations
      if (spec.includes('fruit') || spec.includes('pomme') || spec.includes('poire') || spec.includes('abricot') || spec.includes('pêche') || spec.includes('raisin')) {
        return productDesc.includes('fruit') || productDesc.includes('barquette') || productDesc.includes('plateau') || productDesc.includes('cagette');
      }
      if (spec.includes('légume') || spec.includes('primeur') || spec.includes('maraîch') || spec.includes('pommes de terre') || spec.includes('carotte') || spec.includes('endive')) {
        return productDesc.includes('légume') || productDesc.includes('sac') || productDesc.includes('cagette') || productDesc.includes('film');
      }
      if (spec.includes('bio') || spec.includes('biologique') || spec.includes('écologique')) {
        return productDesc.includes('bio') || productDesc.includes('compostable') || productDesc.includes('écologique') || productDesc.includes('kraft');
      }
      if (spec.includes('vin') || spec.includes('vignoble') || spec.includes('cuve') || spec.includes('champagne')) {
        return productDesc.includes('isotherme') || productDesc.includes('carton') || productDesc.includes('étiquette') || productDesc.includes('film');
      }
      if (spec.includes('fromage') || spec.includes('laitier') || spec.includes('laity')) {
        return productDesc.includes('isotherme') || productDesc.includes('film') || productDesc.includes('plateau') || productDesc.includes('barquette');
      }
      if (spec.includes('mer') || spec.includes('poisson') || spec.includes('crustacé') || spec.includes('algues')) {
        return productDesc.includes('isotherme') || productDesc.includes('film') || productDesc.includes('gel') || productDesc.includes('étanche');
      }
      if (spec.includes('châtaigne') || spec.includes('noix') || spec.includes('miel')) {
        return productDesc.includes('sac') || productDesc.includes('kraft') || productDesc.includes('bocal') || productDesc.includes('plateau');
      }
      if (spec.includes('fleur') || spec.includes('herbe') || spec.includes('parfum')) {
        return productDesc.includes('film') || productDesc.includes('sac') || productDesc.includes('plateau') || productDesc.includes('protection');
      }
      
      // Default: all products are potentially relevant
      return true;
    });
  }
  
  private getBaseQuantityForProduct(category: ProductCategory, specialization: string): number {
    const baseQuantities = {
      [ProductCategory.TRAY]: 800,
      [ProductCategory.CRATE]: 400,
      [ProductCategory.PLATTER]: 600,
      [ProductCategory.PLASTIC_FILM]: 200,
      [ProductCategory.CARDBOARD]: 500,
      [ProductCategory.PLASTIC_BAG]: 1200,
      [ProductCategory.PAPER_BAG]: 800,
      [ProductCategory.ISOTHERMAL_PACKAGING]: 300,
      [ProductCategory.LABEL]: 2000,
      [ProductCategory.OTHER]: 400,
    };
    
    let baseQty = baseQuantities[category] || 500;
    
    // Adjust based on specialization volume hints
    const spec = specialization.toLowerCase();
    if (spec.includes('grandes') || spec.includes('volume') || spec.includes('tonnes')) {
      baseQty *= 1.5; // Large operations need more stock
    } else if (spec.includes('artisan') || spec.includes('petit') || spec.includes('local')) {
      baseQty *= 0.6; // Smaller operations need less stock
    }
    
    return Math.floor(baseQty);
  }

  private async seedPlatformStock(articles: Product[], platforms: Platform[]): Promise<void> {
    const stockData = [];
    
    this.logger.log('Creating strategic platform stock distribution...');

    // Create platform stock based on platform specializations and strategic importance
    for (const platform of platforms) {
      const platformSpecialties = (platform as any).specialties || [];
      const platformCapacity = parseInt((platform as any).capaciteStockage || '25000', 10);
      
      // Platforms stock 70-90% of all products (high diversity for distribution)
      const stockPercentage = 0.7 + Math.random() * 0.2;
      const articlesToStock = this.getRandomElements(articles, Math.floor(articles.length * stockPercentage));

      for (const product of articlesToStock) {
        // Calculate quantity based on platform capacity and product importance
        const baseQuantity = this.getBaseQuantityForPlatform(product.category, platformSpecialties, platformCapacity);
        const variation = (Math.random() - 0.5) * 0.3; // ±15% variation
        const quantite = Math.max(500, Math.floor(baseQuantity * (1 + variation)));
        
        // Set strategic stock levels
        const minimumStock = Math.floor(quantite * 0.2); // 20% minimum
        const maximumStock = Math.floor(quantite * 2.5); // 250% maximum for bulk ordering

        stockData.push({
          platformId: platform.id,
          articleId: product.id, // StockPlatform uses articleId for product_id
          quantite: quantite, // StockPlatform uses quantite for quantity
          stockMinimum: minimumStock,
          stockMaximum: maximumStock,
          isPointInTime: false,
        });
      }
    }

    if (stockData.length > 0) {
      const stockPlatformRepo = this.dataSource.getRepository(StockPlatform);
      await stockPlatformRepo.save(stockData);
      this.logger.log(`Created ${stockData.length} platform stock entries with strategic distribution`);
    }
  }
  
  private getBaseQuantityForPlatform(category: ProductCategory, specialties: string[], capacity: number): number {
    const baseQuantities = {
      [ProductCategory.TRAY]: 2500,
      [ProductCategory.CRATE]: 1500,
      [ProductCategory.PLATTER]: 2000,
      [ProductCategory.PLASTIC_FILM]: 800,
      [ProductCategory.CARDBOARD]: 1800,
      [ProductCategory.PLASTIC_BAG]: 3000,
      [ProductCategory.PAPER_BAG]: 2200,
      [ProductCategory.ISOTHERMAL_PACKAGING]: 1000,
      [ProductCategory.LABEL]: 5000,
      [ProductCategory.OTHER]: 1200,
    };
    
    let baseQty = baseQuantities[category] || 1500;
    
    // Adjust based on platform capacity
    const capacityMultiplier = Math.min(2.0, capacity / 25000); // Scale based on capacity
    baseQty *= capacityMultiplier;
    
    // Adjust based on platform specialties
    const specialtiesStr = specialties.join(' ').toLowerCase();
    if (specialtiesStr.includes('stockage haute capacité') || specialtiesStr.includes('distribution nationale')) {
      baseQty *= 1.5; // National distribution centers stock more
    } else if (specialtiesStr.includes('bio') && (category === ProductCategory.TRAY || category === ProductCategory.PAPER_BAG)) {
      baseQty *= 1.3; // Bio platforms stock more eco-friendly products
    } else if (specialtiesStr.includes('frais') && category === ProductCategory.ISOTHERMAL_PACKAGING) {
      baseQty *= 1.4; // Fresh product platforms need more thermal packaging
    }
    
    return Math.floor(baseQty);
  }

  // Helper methods
  private getRandomElements<T>(array: T[], count: number): T[] {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  private getBasePriceForCategory(categorie: ProductCategory): number {
    // Updated realistic pricing based on 2025 market conditions (per unit in EUR)
    const prices = {
      [ProductCategory.TRAY]: 0.18,        // Increased due to material costs
      [ProductCategory.CRATE]: 0.52,       // Wood and plastic costs up
      [ProductCategory.PLATTER]: 0.28,     // Sustainable materials premium
      [ProductCategory.PLASTIC_FILM]: 15.5, // Energy costs impact on production
      [ProductCategory.CARDBOARD]: 0.42,   // Paper shortage impact
      [ProductCategory.PLASTIC_BAG]: 0.09, // Plastic taxes and regulations
      [ProductCategory.PAPER_BAG]: 0.14,   // Eco-friendly demand premium
      [ProductCategory.ISOTHERMAL_PACKAGING]: 3.2, // Technology improvements
      [ProductCategory.LABEL]: 52.0,       // Digital printing tech costs
      [ProductCategory.OTHER]: 1.5,        // General inflation adjustment
    };
    return prices[categorie] || 1.5;
  }

  private getConditionnementForCategory(categorie: ProductCategory): ConditioningUnit {
    // Enhanced conditioning units with more variety
    const conditionnements = {
      [ProductCategory.TRAY]: ConditioningUnit.BOX_OF_100,
      [ProductCategory.CRATE]: ConditioningUnit.PALLET_OF_50,
      [ProductCategory.PLATTER]: ConditioningUnit.BOX_OF_200,
      [ProductCategory.PLASTIC_FILM]: ConditioningUnit.ROLL,
      [ProductCategory.CARDBOARD]: ConditioningUnit.BOX_OF_25,
      [ProductCategory.PLASTIC_BAG]: ConditioningUnit.BOX_OF_500,
      [ProductCategory.PAPER_BAG]: ConditioningUnit.BOX_OF_250,
      [ProductCategory.ISOTHERMAL_PACKAGING]: ConditioningUnit.BOX_OF_25,
      [ProductCategory.LABEL]: ConditioningUnit.ROLL,
      [ProductCategory.OTHER]: ConditioningUnit.UNIT,
    };
    return conditionnements[categorie] || ConditioningUnit.UNIT;
  }

  private getQuantiteConditionnement(categorie: ProductCategory): number {
    // Updated quantities to reflect efficient packaging standards
    const quantites = {
      [ProductCategory.TRAY]: 100,
      [ProductCategory.CRATE]: 50,
      [ProductCategory.PLATTER]: 200,
      [ProductCategory.PLASTIC_FILM]: 1,    // 1 roll
      [ProductCategory.CARDBOARD]: 25,
      [ProductCategory.PLASTIC_BAG]: 500,
      [ProductCategory.PAPER_BAG]: 250,
      [ProductCategory.ISOTHERMAL_PACKAGING]: 25, // Updated from 20
      [ProductCategory.LABEL]: 1000,       // Per roll
      [ProductCategory.OTHER]: 100,
    };
    return quantites[categorie] || 1;
  }

  private async seedOptionalEntities(): Promise<void> {
    // Try to seed master orders if data exists
    try {
      const masterOrdersData = this.loadJsonData('master-orders.json');
      if (masterOrdersData.length > 0) {
        this.logger.log('📋 Seeding sample master orders...');
        // Implementation would go here when MasterOrder seeding is needed
        this.logger.log(`✅ Found ${masterOrdersData.length} master order templates for future use`);
      }
    } catch (error) {
      this.logger.debug('No master-orders.json found, skipping optional master orders seeding');
    }
    
    // Try to seed supplier contacts if data exists
    try {
      const supplierContactsData = this.loadJsonData('supplier-contacts.json');
      if (supplierContactsData.length > 0) {
        this.logger.log('📞 Found comprehensive supplier contact data...');
        this.logger.log(`✅ Loaded ${supplierContactsData.length} supplier contacts for enhanced relationship management`);
      }
    } catch (error) {
      this.logger.debug('No supplier-contacts.json found, skipping optional supplier contacts seeding');
    }
  }

  private loadJsonData(filename: string): unknown[] {
    try {
      const filePath = path.join(this.dataPath, filename);
      if (!fs.existsSync(filePath)) {
        this.logger.warn(`⚠️  Data file not found: ${filename}`);
        return [];
      }
      
      const fileContent = fs.readFileSync(filePath, 'utf8');
      if (!fileContent.trim()) {
        this.logger.warn(`⚠️  Empty data file: ${filename}`);
        return [];
      }
      
      const data = JSON.parse(fileContent);
      if (!Array.isArray(data)) {
        this.logger.warn(`⚠️  Invalid data format in ${filename} - expected array`);
        return [];
      }
      
      this.logger.debug(`📄 Loaded ${data.length} records from ${filename}`);
      return data;
      
    } catch (error) {
      this.logger.error(`❌ Error loading ${filename}:`, error.message);
      if (filename === 'articles.json' || filename === 'fournisseurs.json' || 
          filename === 'stations.json' || filename === 'station-groups.json') {
        throw new Error(`Critical data file ${filename} failed to load: ${error.message}`);
      }
      // For non-critical files, return empty array and continue
      this.logger.warn(`⚠️  Continuing without ${filename}`);
      return [];
    }
  }
}
