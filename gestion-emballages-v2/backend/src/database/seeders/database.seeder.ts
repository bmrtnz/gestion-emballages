import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';

// Import entities
import { User } from '@modules/users/entities/user.entity';
import { Station } from '@modules/stations/entities/station.entity';
import { Fournisseur } from '@modules/fournisseurs/entities/fournisseur.entity';
import { FournisseurSite } from '@modules/fournisseurs/entities/fournisseur-site.entity';
import { Article } from '@modules/articles/entities/article.entity';
import { ArticleFournisseur } from '@modules/articles/entities/article-fournisseur.entity';
import { StockStation } from '@modules/stocks/entities/stock-station.entity';

// Import enums
import { UserRole } from '@common/enums/user-role.enum';
import { EntityType } from '@modules/users/entities/user.entity';
import { ArticleCategory } from '@common/enums/article-category.enum';

@Injectable()
export class DatabaseSeeder {
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

      // 4. Seed users (depends on stations and suppliers)
      const users = await this.seedUsers(queryRunner, stations, fournisseurs);
      console.log(`✅ Created ${users.length} users`);

      // 5. Seed articles
      const articles = await this.seedArticles(queryRunner);
      console.log(`✅ Created ${articles.length} articles`);

      // 6. Seed article-supplier relationships
      await this.seedArticleFournisseurs(queryRunner, articles, fournisseurs);
      console.log(`✅ Created article-supplier relationships`);

      // 7. Seed initial stock
      await this.seedInitialStock(queryRunner, articles, stations);
      console.log(`✅ Created initial stock data`);

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
        'DELETE FROM stock_stations',
        'DELETE FROM article_fournisseurs', 
        'DELETE FROM articles',
        'DELETE FROM users',
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
    const stationsData = [
      {
        nom: 'Station Val-de-Garonne',
        adresse: '123 Route des Vignes',
        ville: 'Marmande',
        codePostal: '47200',
        telephone: '05 53 64 12 34',
        email: 'contact@valdegaronne.coop',
        contact: 'Jean Martin',
        identifiantInterne: 'VDG001',
        isActive: true,
      },
      {
        nom: 'Coopérative des Pyrénées',
        adresse: '456 Avenue du Gave',
        ville: 'Pau',
        codePostal: '64000',
        telephone: '05 59 27 45 67',
        email: 'info@coop-pyrenees.fr',
        contact: 'Marie Lebrun',
        identifiantInterne: 'PYR002',
        isActive: true,
      },
      {
        nom: 'Station Agricole Bordeaux',
        adresse: '789 Quai des Chartrons',
        ville: 'Bordeaux',
        codePostal: '33000',
        telephone: '05 56 44 78 90',
        email: 'bordeaux@agri-station.fr',
        contact: 'Pierre Dubois',
        identifiantInterne: 'BDX003',
        isActive: true,
      },
      {
        nom: 'Coop Atlantique',
        adresse: '321 Boulevard de la Côte',
        ville: 'Biarritz',
        codePostal: '64200',
        telephone: '05 59 23 56 78',
        email: 'atlantique@coop.fr',
        contact: 'Sophie Bernard',
        identifiantInterne: 'ATL004',
        isActive: true,
      },
    ];

    const stations = await queryRunner.manager.save(Station, stationsData);
    return stations;
  }

  private async seedFournisseurs(queryRunner: any): Promise<Fournisseur[]> {
    const fournisseursData = [
      {
        nom: 'Emballages du Sud-Ouest',
        adresse: '12 Zone Industrielle Nord',
        ville: 'Toulouse',
        codePostal: '31000',
        telephone: '05 61 23 45 67',
        email: 'contact@emballages-so.fr',
        contact: 'François Martinez',
        siret: '12345678901234',
        specialites: ['Carton', 'Plastique'],
        isActive: true,
      },
      {
        nom: 'Plastiques Aquitaine',
        adresse: '45 Rue de l\'Industrie',
        ville: 'Bayonne',
        codePostal: '64100',
        telephone: '05 59 46 78 90',
        email: 'info@plastiques-aquitaine.com',
        contact: 'Elisabeth Dubois',
        siret: '23456789012345',
        specialites: ['Film Plastique', 'Barquette'],
        isActive: true,
      },
      {
        nom: 'Cartons de France',
        adresse: '78 Avenue des Pyrénées',
        ville: 'Tarbes',
        codePostal: '65000',
        telephone: '05 62 34 56 78',
        email: 'commercial@cartons-france.fr',
        contact: 'Michel Laurent',
        siret: '34567890123456',
        specialites: ['Carton', 'Cagette'],
        isActive: true,
      },
      {
        nom: 'Eco-Emballages Nouvelle-Aquitaine',
        adresse: '90 Parc d\'Activités',
        ville: 'Limoges',
        codePostal: '87000',
        telephone: '05 55 12 34 56',
        email: 'eco@emballages-na.fr',
        contact: 'Catherine Moreau',
        siret: '45678901234567',
        specialites: ['Emballage Isotherme', 'Sac Papier'],
        isActive: true,
      },
    ];

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

  private async seedUsers(queryRunner: any, stations: Station[], fournisseurs: Fournisseur[]): Promise<User[]> {
    const hashedPassword = await bcrypt.hash('password123', 10);
    const adminPassword = await bcrypt.hash('admin123', 10);

    const usersData = [
      // System administrators
      {
        nomComplet: 'Thomas Decoudun',
        email: 'admin@dev.com',
        passwordHash: adminPassword,
        role: UserRole.MANAGER,
        isActive: true,
      },
      {
        nomComplet: 'Nicole Lang',
        email: 'nicole@embadif.com',
        passwordHash: hashedPassword,
        role: UserRole.GESTIONNAIRE,
        isActive: true,
      },
      // Station users
      {
        nomComplet: 'Jean Martin',
        email: 'j.martin@valdegaronne.com',
        passwordHash: hashedPassword,
        role: UserRole.STATION,
        entiteType: EntityType.STATION,
        entiteId: stations[0].id,
        isActive: true,
      },
      {
        nomComplet: 'Marie Lebrun',
        email: 'm.lebrun@coop-pyrenees.fr',
        passwordHash: hashedPassword,
        role: UserRole.STATION,
        entiteType: EntityType.STATION,
        entiteId: stations[1].id,
        isActive: true,
      },
      {
        nomComplet: 'Pierre Dubois',
        email: 'p.dubois@agri-station.fr',
        passwordHash: hashedPassword,
        role: UserRole.STATION,
        entiteType: EntityType.STATION,
        entiteId: stations[2].id,
        isActive: true,
      },
      // Supplier users
      {
        nomComplet: 'François Martinez',
        email: 'f.martinez@emballages-so.fr',
        passwordHash: hashedPassword,
        role: UserRole.FOURNISSEUR,
        entiteType: EntityType.FOURNISSEUR,
        entiteId: fournisseurs[0].id,
        isActive: true,
      },
      {
        nomComplet: 'Elisabeth Dubois',
        email: 'e.dubois@plastiques-aquitaine.com',
        passwordHash: hashedPassword,
        role: UserRole.FOURNISSEUR,
        entiteType: EntityType.FOURNISSEUR,
        entiteId: fournisseurs[1].id,
        isActive: true,
      },
      // Test users
      {
        nomComplet: 'Station Test',
        email: 'station@test.com',
        passwordHash: hashedPassword,
        role: UserRole.STATION,
        entiteType: EntityType.STATION,
        entiteId: stations[0].id,
        isActive: true,
      },
      {
        nomComplet: 'Supplier Test',
        email: 'supplier@test.com',
        passwordHash: hashedPassword,
        role: UserRole.FOURNISSEUR,
        entiteType: EntityType.FOURNISSEUR,
        entiteId: fournisseurs[0].id,
        isActive: true,
      },
    ];

    const users = await queryRunner.manager.save(User, usersData);
    return users;
  }

  private async seedArticles(queryRunner: any): Promise<Article[]> {
    const articlesData = [
      {
        codeArticle: 'BAR001',
        designation: 'Barquette plastique 500g',
        categorie: ArticleCategory.BARQUETTE,
        isActive: true,
      },
      {
        codeArticle: 'BAR002',
        designation: 'Barquette plastique 1kg',
        categorie: ArticleCategory.BARQUETTE,
        isActive: true,
      },
      {
        codeArticle: 'CAG001',
        designation: 'Cagette bois 2kg',
        categorie: ArticleCategory.CAGETTE,
        isActive: true,
      },
      {
        codeArticle: 'CAG002',
        designation: 'Cagette carton 1kg',
        categorie: ArticleCategory.CAGETTE,
        isActive: true,
      },
      {
        codeArticle: 'PLT001',
        designation: 'Plateau carton 30x40cm',
        categorie: ArticleCategory.PLATEAU,
        isActive: true,
      },
      {
        codeArticle: 'FIL001',
        designation: 'Film plastique alimentaire 30cm',
        categorie: ArticleCategory.FILM_PLASTIQUE,
        isActive: true,
      },
      {
        codeArticle: 'FIL002',
        designation: 'Film plastique étirable 50cm',
        categorie: ArticleCategory.FILM_PLASTIQUE,
        isActive: true,
      },
      {
        codeArticle: 'CAR001',
        designation: 'Carton expédition 40x30x20cm',
        categorie: ArticleCategory.CARTON,
        isActive: true,
      },
      {
        codeArticle: 'CAR002',
        designation: 'Carton présentoir fruits',
        categorie: ArticleCategory.CARTON,
        isActive: true,
      },
      {
        codeArticle: 'SAC001',
        designation: 'Sac plastique 5kg',
        categorie: ArticleCategory.SAC_PLASTIQUE,
        isActive: true,
      },
      {
        codeArticle: 'SAC002',
        designation: 'Sac papier kraft 2kg',
        categorie: ArticleCategory.SAC_PAPIER,
        isActive: true,
      },
      {
        codeArticle: 'ISO001',
        designation: 'Emballage isotherme 10L',
        categorie: ArticleCategory.EMBALLAGE_ISOTHERME,
        isActive: true,
      },
      {
        codeArticle: 'ETI001',
        designation: 'Étiquettes code-barres (x1000)',
        categorie: ArticleCategory.ETIQUETTE,
        isActive: true,
      },
      {
        codeArticle: 'AUT001',
        designation: 'Attache plastique (x100)',
        categorie: ArticleCategory.AUTRE,
        isActive: true,
      },
      {
        codeArticle: 'AUT002',
        designation: 'Adhésif transparent 50mm',
        categorie: ArticleCategory.AUTRE,
        isActive: true,
      },
    ];

    const articles = await queryRunner.manager.save(Article, articlesData);
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
}