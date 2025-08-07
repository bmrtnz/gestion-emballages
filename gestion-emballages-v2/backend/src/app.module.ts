import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

// Configuration
import { databaseConfig } from './config/database.config';
import { appConfig } from './config/app.config';
import authConfig from './config/auth.config';
import { minioConfig } from './config/minio.config';

// Entities
import { User } from './modules/users/entities/user.entity';
import { Station } from './modules/stations/entities/station.entity';
import { StationGroup } from './modules/stations/entities/station-group.entity';
import { StationContact } from './modules/stations/entities/station-contact.entity';
import { Fournisseur } from './modules/fournisseurs/entities/fournisseur.entity';
import { FournisseurSite } from './modules/fournisseurs/entities/fournisseur-site.entity';
import { Platform } from './modules/platforms/entities/platform.entity';
import { PlatformSite } from './modules/platforms/entities/platform-site.entity';
import { Article } from './modules/articles/entities/article.entity';
import { ArticleFournisseur } from './modules/articles/entities/article-fournisseur.entity';
import { Commande } from './modules/commandes/entities/commande.entity';
import { CommandeGlobale } from './modules/commandes/entities/commande-globale.entity';
import { CommandeArticle } from './modules/commandes/entities/commande-article.entity';
import { StockStation } from './modules/stocks/entities/stock-station.entity';
import { StockFournisseur } from './modules/stocks/entities/stock-fournisseur.entity';
import { StockPlatform } from './modules/stocks/entities/stock-platform.entity';
import { DemandeTransfert } from './modules/transferts/entities/demande-transfert.entity';
import { DemandeTransfertArticle } from './modules/transferts/entities/demande-transfert-article.entity';
import { Prevision } from './modules/previsions/entities/prevision.entity';
import { ListeAchat } from './modules/listes-achat/entities/liste-achat.entity';
import { ListeAchatItem } from './modules/listes-achat/entities/liste-achat-item.entity';

// Modules
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { StationsModule } from './modules/stations/stations.module';
import { FournisseursModule } from './modules/fournisseurs/fournisseurs.module';
import { PlatformsModule } from './modules/platforms/platforms.module';
import { ArticlesModule } from './modules/articles/articles.module';
import { CommandesModule } from './modules/commandes/commandes.module';
import { StocksModule } from './modules/stocks/stocks.module';
import { CommonModule } from './common/common.module';

// Database seeder
import { DatabaseSeeder } from './database/seeders/database.seeder';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, authConfig, minioConfig],
      envFilePath: '.env',
    }),
    
    // Database
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST') || 'localhost',
        port: configService.get<number>('DB_PORT') || 5432,
        username: configService.get<string>('DB_USERNAME') || 'dev_user',
        password: configService.get<string>('DB_PASSWORD') || 'dev_password',
        database: configService.get<string>('DB_DATABASE') || 'gestion_emballages_dev',
        entities: [
          User,
          Station,
          StationGroup,
          StationContact,
          Fournisseur,
          FournisseurSite,
          Platform,
          PlatformSite,
          Article,
          ArticleFournisseur,
          Commande,
          CommandeGlobale,
          CommandeArticle,
          StockStation,
          StockFournisseur,
          StockPlatform,
          DemandeTransfert,
          DemandeTransfertArticle,
          Prevision,
          ListeAchat,
          ListeAchatItem,
        ],
        synchronize: configService.get<string>('DB_SYNCHRONIZE') === 'true' || configService.get<string>('NODE_ENV') === 'development',
        logging: configService.get<string>('DB_LOGGING') === 'true',
        ssl: configService.get<string>('DB_SSL') === 'true' ? { rejectUnauthorized: false } : false,
      }),
      inject: [ConfigService],
    }),
    
    // Common module
    CommonModule,
    
    // Feature modules
    AuthModule,
    UsersModule,
    StationsModule,
    FournisseursModule,
    PlatformsModule,
    ArticlesModule,
    CommandesModule,
    StocksModule,
  ],
  controllers: [],
  providers: [DatabaseSeeder],
})
export class AppModule {}