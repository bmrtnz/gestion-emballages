import { Injectable } from '@nestjs/common';
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
import { UserRole, EntityType } from '@common/enums/user-role.enum';
import { ProductCategory } from '@common/enums/product-category.enum';

@Injectable()
export class DatabaseSeeder {
  private readonly dataPath = path.join(__dirname, 'data');

  constructor(
    @InjectDataSource()
    private dataSource: DataSource,
  ) {}

  async run(): Promise<void> {
    console.log('🌱 Starting database seeding...');

    try {
      // 1. Clear existing data first (without transaction)
      console.log('🧹 Clearing existing data...');
      await this.clearDatabaseDirectly();

      // 2. Wait a moment for cleanup to complete
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 3. Seed data step by step (each in its own transaction)
      const stationGroups = await this.seedStationGroups();
      console.log(`✅ Created ${stationGroups.length} station groups`);

      const stations = await this.seedStations(stationGroups);
      console.log(`✅ Created ${stations.length} stations`);

      await this.seedStationContacts(stations);
      console.log(`✅ Created station contacts`);

      const fournisseurs = await this.seedFournisseurs();
      console.log(`✅ Created ${fournisseurs.length} suppliers`);

      const platforms = await this.seedPlatforms();
      console.log(`✅ Created ${platforms.length} platforms`);

      const users = await this.seedUsers(stations, fournisseurs);
      console.log(`✅ Created ${users.length} users`);

      const articles = await this.seedArticles();
      console.log(`✅ Created ${articles.length} articles`);

      await this.seedArticleFournisseurs(articles, fournisseurs);
      console.log(`✅ Created Product-supplier relationships`);

      await this.seedInitialStock(articles, stations);
      console.log(`✅ Created initial station stock data`);

      await this.seedPlatformStock(articles, platforms);
      console.log(`✅ Created initial platform stock data`);

      console.log('🎉 Database seeding completed successfully!');

    } catch (error) {
      console.error('❌ Database seeding failed:', error);
      throw error;
    }
  }

  private async clearDatabaseDirectly(): Promise<void> {
    // List of tables to clear in reverse dependency order
    const tablesToClear = [
      'stocks_platform',
      'stock_stations', 
      'article_fournisseurs',
      'products',
      'users',
      'platform_sites',
      'platforms',
      'fournisseur_sites',
      'suppliers',
      'station_contacts',
      'stations',
      'station_groups'
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
        console.log(`✅ Cleared table: ${tableName}`);
      } catch (error) {
        console.log(`⚠️  Skipped table ${tableName}: ${error.message}`);
      }
    }
    
    console.log('🧹 Database cleanup completed');
  }

  private async seedStationGroups(): Promise<StationGroup[]> {
    const stationGroupsData = this.loadJsonData('station-groups.json');
    const stationGroupRepo = this.dataSource.getRepository(StationGroup);
    const stationGroups = await stationGroupRepo.save(stationGroupsData);
    return stationGroups;
  }

  private async seedStations(stationGroups: StationGroup[]): Promise<Station[]> {
    const stationsData = this.loadJsonData('stations.json');
    
    // Create lookup map for station groups by identifiant
    const groupMap = new Map(stationGroups.map(group => [group.identifiant, group.id]));
    
    // Process stations data to resolve group references
    const processedStations = stationsData.map(stationData => {
      const { groupeId, address, mainContact, ...stationInfo } = stationData;
      
      return {
        ...stationInfo,
        groupeId: groupeId && groupMap.has(groupeId) ? groupMap.get(groupeId) : null,
        // Flatten address
        address: address.street,
        city: address.city,
        postalCode: address.postalCode,
        country: address.country,
        // Flatten main contact
        contact: mainContact.name,
        phone: mainContact.phone,
        email: mainContact.email,
      };
    });

    const stationRepo = this.dataSource.getRepository(Station);
    const stations = await stationRepo.save(processedStations);
    return stations;
  }

  private async seedStationContacts(stations: Station[]): Promise<void> {
    const contactsData = this.loadJsonData('station-contacts.json');
    
    // Create lookup map for stations by their identifiant
    const stationMap = new Map(stations.map(station => [station.internalId, station]));
    
    const processedContacts = [];
    
    for (const contactData of contactsData) {
      const { stationIdentifiant, ...contactInfo } = contactData;
      
      const station = stationMap.get(stationIdentifiant);
      if (station) {
        processedContacts.push({
          ...contactInfo,
          stationId: station.id,
        });
      } else {
        console.warn(`⚠️  Station not found for contact: ${stationIdentifiant}`);
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
    for (const fournisseurData of fournisseursData) {
      const { sites, ...fournisseurInfo } = fournisseurData;
      
      // Create supplier
      const supplier = await supplierRepo.save(fournisseurInfo);
      fournisseurs.push(supplier);

      // Create supplier sites
      if (sites && sites.length > 0) {
        for (const siteData of sites) {
          const processedSiteData = {
            supplierId: supplier.id,
            name: siteData.name,
            address: {
              street: siteData.adresse.rue,
              city: siteData.adresse.city,
              postalCode: siteData.adresse.postalCode,
            },
            isPrincipal: siteData.estPrincipal,
          };
          
          await supplierSiteRepo.save(processedSiteData);
        }
      } else {
        // Fallback: create a default principal site if no sites defined
        const siteData = {
          supplierId: supplier.id,
          name: `Site Principal ${supplier.name}`,
          address: {
            street: supplier.address,
            city: supplier.city,
            postalCode: supplier.postalCode,
          },
          isPrincipal: true,
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
    for (const platformData of platformsData) {
      const { site, nom, specialites, ...platformInfo } = platformData;
      
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

    for (const userData of usersData) {
      const { password, entityRef, ...userInfo } = userData;
      
      // Hash the password from JSON file
      const passwordHash = await bcrypt.hash(password, 10);

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
        passwordHash,
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
    
    // French to English category mapping
    const categoryMapping = {
      'Barquette': ProductCategory.TRAY,
      'Cagette': ProductCategory.CRATE,
      'Plateau': ProductCategory.PLATTER,
      'Film Plastique': ProductCategory.PLASTIC_FILM,
      'Carton': ProductCategory.CARDBOARD,
      'Sac Plastique': ProductCategory.PLASTIC_BAG,
      'Sac Papier': ProductCategory.PAPER_BAG,
      'Emballage Isotherme': ProductCategory.ISOTHERMAL_PACKAGING,
      'Étiquette': ProductCategory.LABEL,
      'Autre': ProductCategory.OTHER,
    };
    
    // Convert category strings to enums and map properties
    const processedArticles = articlesData.map(articleData => ({
      productCode: articleData.codeArticle,
      description: articleData.description,
      category: categoryMapping[articleData.categorie] || ProductCategory.OTHER,
      isActive: articleData.isActive !== undefined ? articleData.isActive : true,
    }));

    const productRepo = this.dataSource.getRepository(Product);
    const articles = await productRepo.save(processedArticles);
    return articles;
  }

  private async seedArticleFournisseurs(articles: Product[], fournisseurs: Supplier[]): Promise<void> {
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
          supplierReference: `${supplier.name.substring(0, 3).toUpperCase()}-${product.productCode}`,
          unitPrice: Math.round(finalPrice * 100) / 100,
          packagingUnit: this.getConditionnementForCategory(product.category),
          quantityPerPackage: this.getQuantiteConditionnement(product.category),
          indicativeSupplyDelay: Math.floor(Math.random() * 10) + 5, // 5-14 days
        });
      }
    }

    const productSupplierRepo = this.dataSource.getRepository(ProductSupplier);
    await productSupplierRepo.save(relationships);
  }

  private async seedInitialStock(articles: Product[], stations: Station[]): Promise<void> {
    const stockData = [];

    // Create initial stock for each station and Product combination
    for (const station of stations) {
      // Each station will have stock for 60-80% of articles
      const articlesToStock = this.getRandomElements(articles, Math.floor(articles.length * 0.7));
      
      for (const product of articlesToStock) {
        const quantite = Math.floor(Math.random() * 1000) + 100; // 100-1099 units
        
        stockData.push({
          stationId: station.id,
          articleId: product.id,
          quantiteActuelle: quantite,
          seuilAlerte: Math.floor(quantite * 0.2), // 20% of current stock
          seuilCritique: Math.floor(quantite * 0.1), // 10% of current stock
        });
      }
    }

    const stockStationRepo = this.dataSource.getRepository(StockStation);
    await stockStationRepo.save(stockData);
  }

  private async seedPlatformStock(articles: Product[], platforms: Platform[]): Promise<void> {
    const stockData = [];

    // Create platform stock for each platform and Product combination
    for (const platform of platforms) {
      // Each platform will have stock for 40-60% of articles (platforms have less diverse stock than stations)
      const articlesToStock = this.getRandomElements(articles, Math.floor(articles.length * 0.5));
      
      for (const product of articlesToStock) {
        // Platforms typically have larger quantities than stations
        const quantite = Math.floor(Math.random() * 5000) + 1000; // 1000-5999 units
        
        stockData.push({
          platformId: platform.id,
          articleId: product.id,
          quantite: quantite,
          stockMinimum: Math.floor(quantite * 0.15), // 15% of current stock
          stockMaximum: Math.floor(quantite * 2), // 200% of current stock for restocking
          isPointInTime: false,
        });
      }
    }

    const stockPlatformRepo = this.dataSource.getRepository(StockPlatform);
    await stockPlatformRepo.save(stockData);
  }

  // Helper methods
  private getRandomElements<T>(array: T[], count: number): T[] {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  private getBasePriceForCategory(categorie: ProductCategory): number {
    const prices = {
      [ProductCategory.TRAY]: 0.15,
      [ProductCategory.CRATE]: 0.45,
      [ProductCategory.PLATTER]: 0.25,
      [ProductCategory.PLASTIC_FILM]: 12.50,
      [ProductCategory.CARDBOARD]: 0.35,
      [ProductCategory.PLASTIC_BAG]: 0.08,
      [ProductCategory.PAPER_BAG]: 0.12,
      [ProductCategory.ISOTHERMAL_PACKAGING]: 2.80,
      [ProductCategory.LABEL]: 45.00,
      [ProductCategory.OTHER]: 1.20,
    };
    return prices[categorie] || 1.00;
  }

  private getConditionnementForCategory(categorie: ProductCategory): string {
    const conditionnements = {
      [ProductCategory.TRAY]: 'Carton de 100',
      [ProductCategory.CRATE]: 'Palette de 50',
      [ProductCategory.PLATTER]: 'Carton de 200',
      [ProductCategory.PLASTIC_FILM]: 'Rouleau',
      [ProductCategory.CARDBOARD]: 'Lot de 25',
      [ProductCategory.PLASTIC_BAG]: 'Carton de 500',
      [ProductCategory.PAPER_BAG]: 'Carton de 250',
      [ProductCategory.ISOTHERMAL_PACKAGING]: 'Carton de 20',
      [ProductCategory.LABEL]: 'Rouleau',
      [ProductCategory.OTHER]: 'Unité',
    };
    return conditionnements[categorie] || 'Unité';
  }

  private getQuantiteConditionnement(categorie: ProductCategory): number {
    const quantites = {
      [ProductCategory.TRAY]: 100,
      [ProductCategory.CRATE]: 50,
      [ProductCategory.PLATTER]: 200,
      [ProductCategory.PLASTIC_FILM]: 1,
      [ProductCategory.CARDBOARD]: 25,
      [ProductCategory.PLASTIC_BAG]: 500,
      [ProductCategory.PAPER_BAG]: 250,
      [ProductCategory.ISOTHERMAL_PACKAGING]: 20,
      [ProductCategory.LABEL]: 1000,
      [ProductCategory.OTHER]: 100,
    };
    return quantites[categorie] || 1;
  }

  private loadJsonData(filename: string): any[] {
    try {
      const filePath = path.join(this.dataPath, filename);
      const fileContent = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(fileContent);
    } catch (error) {
      console.error(`Error loading ${filename}:`, error);
      throw new Error(`Failed to load seeding data from ${filename}`);
    }
  }
}