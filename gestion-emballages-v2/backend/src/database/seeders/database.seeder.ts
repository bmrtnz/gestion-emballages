import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import * as path from 'path';

// Import entities
import { User } from '@modules/users/entities/user.entity';
import { Station } from '@modules/stations/entities/station.entity';
import { Fournisseur } from '@modules/fournisseurs/entities/fournisseur.entity';
import { FournisseurSite } from '@modules/fournisseurs/entities/fournisseur-site.entity';
import { Platform } from '@modules/platforms/entities/platform.entity';
import { PlatformSite } from '@modules/platforms/entities/platform-site.entity';
import { Article } from '@modules/articles/entities/article.entity';
import { ArticleFournisseur } from '@modules/articles/entities/article-fournisseur.entity';
import { StockStation } from '@modules/stocks/entities/stock-station.entity';
import { StockPlatform } from '@modules/stocks/entities/stock-platform.entity';

// Import enums
import { UserRole } from '@common/enums/user-role.enum';
import { EntityType } from '@modules/users/entities/user.entity';
import { ArticleCategory } from '@common/enums/article-category.enum';

@Injectable()
export class DatabaseSeeder {
  private readonly dataPath = path.join(__dirname, 'data');

  constructor(
    @InjectDataSource()
    private dataSource: DataSource,
  ) {}

  async run(): Promise<void> {
    console.log('🌱 Starting database seeding...');

    // Wait for database connection and synchronization
    console.log('⏳ Waiting for database synchronization...');
    await this.dataSource.synchronize();
    console.log('✅ Database synchronized');

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Clear existing data
      await this.clearDatabase(queryRunner);

      // 2. Seed stations first
      const stations = await this.seedStations(queryRunner);
      console.log(`✅ Created ${stations.length} stations`);

      // 3. Seed suppliers
      const fournisseurs = await this.seedFournisseurs(queryRunner);
      console.log(`✅ Created ${fournisseurs.length} suppliers`);

      // 4. Seed platforms
      const platforms = await this.seedPlatforms(queryRunner);
      console.log(`✅ Created ${platforms.length} platforms`);

      // 5. Seed users (depends on stations and suppliers)
      const users = await this.seedUsers(queryRunner, stations, fournisseurs);
      console.log(`✅ Created ${users.length} users`);

      // 6. Seed articles
      const articles = await this.seedArticles(queryRunner);
      console.log(`✅ Created ${articles.length} articles`);

      // 7. Seed article-supplier relationships
      await this.seedArticleFournisseurs(queryRunner, articles, fournisseurs);
      console.log(`✅ Created article-supplier relationships`);

      // 8. Seed initial stock
      await this.seedInitialStock(queryRunner, articles, stations);
      console.log(`✅ Created initial station stock data`);

      // 9. Seed platform stock
      await this.seedPlatformStock(queryRunner, articles, platforms);
      console.log(`✅ Created initial platform stock data`);

      await queryRunner.commitTransaction();
      console.log('🎉 Database seeding completed successfully!');

    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('❌ Database seeding failed:', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private async clearDatabase(queryRunner: any): Promise<void> {
    console.log('🧹 Clearing existing data...');
    
    try {
      // Clear in reverse dependency order, using IF EXISTS to avoid errors for non-existent tables
      const clearQueries = [
        'DELETE FROM stocks_platform',
        'DELETE FROM stock_stations',
        'DELETE FROM article_fournisseurs', 
        'DELETE FROM articles',
        'DELETE FROM users',
        'DELETE FROM platform_sites',
        'DELETE FROM platforms',
        'DELETE FROM fournisseur_sites',
        'DELETE FROM fournisseurs',
        'DELETE FROM stations'
      ];

      for (const query of clearQueries) {
        try {
          await queryRunner.query(query);
        } catch (error) {
          // Ignore errors for non-existent tables - they will be created by TypeORM
          if (error.code === '42P01') {
            console.log(`⚠️  Table doesn't exist yet, will be created: ${query}`);
          } else {
            throw error;
          }
        }
      }

      // Reset sequences only if they exist
      const sequenceResets = [
        'ALTER SEQUENCE IF EXISTS stations_id_seq RESTART WITH 1',
        'ALTER SEQUENCE IF EXISTS fournisseurs_id_seq RESTART WITH 1',
        'ALTER SEQUENCE IF EXISTS platforms_id_seq RESTART WITH 1',
        'ALTER SEQUENCE IF EXISTS users_id_seq RESTART WITH 1',
        'ALTER SEQUENCE IF EXISTS articles_id_seq RESTART WITH 1'
      ];

      for (const query of sequenceResets) {
        try {
          await queryRunner.query(query);
        } catch (error) {
          // Ignore sequence errors - they'll be created when tables are created
          console.log(`⚠️  Sequence reset skipped: ${error.message}`);
        }
      }
    } catch (error) {
      console.log('⚠️  Some cleanup operations skipped - tables will be created fresh');
    }
  }

  private async seedStations(queryRunner: any): Promise<Station[]> {
    const stationsData = this.loadJsonData('stations.json');
    const stations = await queryRunner.manager.save(Station, stationsData);
    return stations;
  }

  private async seedFournisseurs(queryRunner: any): Promise<Fournisseur[]> {
    const fournisseursData = this.loadJsonData('fournisseurs.json');
    const fournisseurs = await queryRunner.manager.save(Fournisseur, fournisseursData);

    // Add sites for each supplier
    for (const fournisseur of fournisseurs) {
      const siteData = {
        fournisseurId: fournisseur.id,
        nom: `Site Principal ${fournisseur.nom}`,
        adresse: fournisseur.adresse,
        ville: fournisseur.ville,
        codePostal: fournisseur.codePostal,
        telephone: fournisseur.telephone,
        email: fournisseur.email,
        contact: fournisseur.contact,
        estPrincipal: true,
        isActive: true,
      };
      
      await queryRunner.manager.save(FournisseurSite, siteData);
    }

    return fournisseurs;
  }

  private async seedPlatforms(queryRunner: any): Promise<Platform[]> {
    const platformsData = this.loadJsonData('platforms.json');
    const platforms = [];

    // Create platforms and their sites from JSON data
    for (const platformData of platformsData) {
      const { site, ...platformInfo } = platformData;
      
      // Create platform
      const platform = await queryRunner.manager.save(Platform, platformInfo);
      platforms.push(platform);

      // Create platform site
      if (site) {
        const siteData = {
          platformId: platform.id,
          ...site,
        };
        await queryRunner.manager.save(PlatformSite, siteData);
      }
    }

    return platforms;
  }

  private async seedUsers(queryRunner: any, stations: Station[], fournisseurs: Fournisseur[]): Promise<User[]> {
    const usersData = this.loadJsonData('users.json');
    const processedUsers = [];

    // Create lookup maps for entities
    const stationMap = new Map(stations.map(station => [station.nom, station]));
    const fournisseurMap = new Map(fournisseurs.map(fournisseur => [fournisseur.nom, fournisseur]));

    for (const userData of usersData) {
      const { password, entiteRef, ...userInfo } = userData;
      
      // Hash the password from JSON file
      const passwordHash = await bcrypt.hash(password, 10);

      // Convert role string to enum
      const roleEnum = userData.role as UserRole;
      
      // Resolve entity ID if needed
      let entiteId = undefined;
      let entiteType = undefined;
      
      if (entiteRef) {
        if (userData.entiteType === 'Station') {
          const station = stationMap.get(entiteRef);
          if (station) {
            entiteId = station.id;
            entiteType = EntityType.STATION;
          }
        } else if (userData.entiteType === 'Fournisseur') {
          const fournisseur = fournisseurMap.get(entiteRef);
          if (fournisseur) {
            entiteId = fournisseur.id;
            entiteType = EntityType.FOURNISSEUR;
          }
        }
      }

      processedUsers.push({
        ...userInfo,
        passwordHash,
        role: roleEnum,
        entiteId,
        entiteType,
      });
    }

    const users = await queryRunner.manager.save(User, processedUsers);
    return users;
  }

  private async seedArticles(queryRunner: any): Promise<Article[]> {
    const articlesData = this.loadJsonData('articles.json');
    
    // Convert category strings to enums
    const processedArticles = articlesData.map(articleData => ({
      ...articleData,
      categorie: articleData.categorie as ArticleCategory,
    }));

    const articles = await queryRunner.manager.save(Article, processedArticles);
    return articles;
  }

  private async seedArticleFournisseurs(queryRunner: any, articles: Article[], fournisseurs: Fournisseur[]): Promise<void> {
    const relationships = [];

    // Create relationships between articles and suppliers with realistic pricing
    for (const article of articles) {
      // Each article will have 1-3 suppliers
      const numSuppliers = Math.floor(Math.random() * 3) + 1;
      const selectedSuppliers = this.getRandomElements(fournisseurs, numSuppliers);

      for (let i = 0; i < selectedSuppliers.length; i++) {
        const supplier = selectedSuppliers[i];
        const basePrice = this.getBasePriceForCategory(article.categorie);
        // Add some price variation between suppliers
        const priceVariation = (Math.random() - 0.5) * 0.3; // ±15%
        const finalPrice = basePrice * (1 + priceVariation);

        relationships.push({
          articleId: article.id,
          fournisseurId: supplier.id,
          referenceFournisseur: `${supplier.nom.substring(0, 3).toUpperCase()}-${article.codeArticle}`,
          prixUnitaire: Math.round(finalPrice * 100) / 100,
          uniteConditionnement: this.getConditionnementForCategory(article.categorie),
          quantiteParConditionnement: this.getQuantiteConditionnement(article.categorie),
          delaiIndicatifApprovisionnement: Math.floor(Math.random() * 10) + 5, // 5-14 days
        });
      }
    }

    await queryRunner.manager.save(ArticleFournisseur, relationships);
  }

  private async seedInitialStock(queryRunner: any, articles: Article[], stations: Station[]): Promise<void> {
    const stockData = [];

    // Create initial stock for each station and article combination
    for (const station of stations) {
      // Each station will have stock for 60-80% of articles
      const articlesToStock = this.getRandomElements(articles, Math.floor(articles.length * 0.7));
      
      for (const article of articlesToStock) {
        const quantite = Math.floor(Math.random() * 1000) + 100; // 100-1099 units
        
        stockData.push({
          stationId: station.id,
          articleId: article.id,
          quantiteDisponible: quantite,
          seuilAlerte: Math.floor(quantite * 0.2), // 20% of current stock
          seuilCritique: Math.floor(quantite * 0.1), // 10% of current stock
        });
      }
    }

    await queryRunner.manager.save(StockStation, stockData);
  }

  private async seedPlatformStock(queryRunner: any, articles: Article[], platforms: Platform[]): Promise<void> {
    const stockData = [];

    // Create platform stock for each platform and article combination
    for (const platform of platforms) {
      // Each platform will have stock for 40-60% of articles (platforms have less diverse stock than stations)
      const articlesToStock = this.getRandomElements(articles, Math.floor(articles.length * 0.5));
      
      for (const article of articlesToStock) {
        // Platforms typically have larger quantities than stations
        const quantite = Math.floor(Math.random() * 5000) + 1000; // 1000-5999 units
        
        stockData.push({
          platformId: platform.id,
          articleId: article.id,
          quantite: quantite,
          stockMinimum: Math.floor(quantite * 0.15), // 15% of current stock
          stockMaximum: Math.floor(quantite * 2), // 200% of current stock for restocking
          isPointInTime: false,
        });
      }
    }

    await queryRunner.manager.save(StockPlatform, stockData);
  }

  // Helper methods
  private getRandomElements<T>(array: T[], count: number): T[] {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  private getBasePriceForCategory(categorie: ArticleCategory): number {
    const prices = {
      [ArticleCategory.BARQUETTE]: 0.15,
      [ArticleCategory.CAGETTE]: 0.45,
      [ArticleCategory.PLATEAU]: 0.25,
      [ArticleCategory.FILM_PLASTIQUE]: 12.50,
      [ArticleCategory.CARTON]: 0.35,
      [ArticleCategory.SAC_PLASTIQUE]: 0.08,
      [ArticleCategory.SAC_PAPIER]: 0.12,
      [ArticleCategory.EMBALLAGE_ISOTHERME]: 2.80,
      [ArticleCategory.ETIQUETTE]: 45.00,
      [ArticleCategory.AUTRE]: 1.20,
    };
    return prices[categorie] || 1.00;
  }

  private getConditionnementForCategory(categorie: ArticleCategory): string {
    const conditionnements = {
      [ArticleCategory.BARQUETTE]: 'Carton de 100',
      [ArticleCategory.CAGETTE]: 'Palette de 50',
      [ArticleCategory.PLATEAU]: 'Carton de 200',
      [ArticleCategory.FILM_PLASTIQUE]: 'Rouleau',
      [ArticleCategory.CARTON]: 'Lot de 25',
      [ArticleCategory.SAC_PLASTIQUE]: 'Carton de 500',
      [ArticleCategory.SAC_PAPIER]: 'Carton de 250',
      [ArticleCategory.EMBALLAGE_ISOTHERME]: 'Carton de 20',
      [ArticleCategory.ETIQUETTE]: 'Rouleau',
      [ArticleCategory.AUTRE]: 'Unité',
    };
    return conditionnements[categorie] || 'Unité';
  }

  private getQuantiteConditionnement(categorie: ArticleCategory): number {
    const quantites = {
      [ArticleCategory.BARQUETTE]: 100,
      [ArticleCategory.CAGETTE]: 50,
      [ArticleCategory.PLATEAU]: 200,
      [ArticleCategory.FILM_PLASTIQUE]: 1,
      [ArticleCategory.CARTON]: 25,
      [ArticleCategory.SAC_PLASTIQUE]: 500,
      [ArticleCategory.SAC_PAPIER]: 250,
      [ArticleCategory.EMBALLAGE_ISOTHERME]: 20,
      [ArticleCategory.ETIQUETTE]: 1000,
      [ArticleCategory.AUTRE]: 100,
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