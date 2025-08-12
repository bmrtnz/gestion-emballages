import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';

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
import { Supplier } from './modules/suppliers/entities/supplier.entity';
import { SupplierSite } from './modules/suppliers/entities/supplier-site.entity';
import { SupplierContact } from './modules/suppliers/entities/supplier-contact.entity';
import { Platform } from './modules/platforms/entities/platform.entity';
import { PlatformSite } from './modules/platforms/entities/platform-site.entity';
import { PlatformContact } from './modules/platforms/entities/platform-contact.entity';
import { Product } from './modules/products/entities/product.entity';
import { ProductSupplier } from './modules/products/entities/product-supplier.entity';
import { MasterOrder } from './modules/orders/entities/master-order.entity';
import { PurchaseOrder } from './modules/orders/entities/purchase-order.entity';
import { SalesOrder } from './modules/orders/entities/sales-order.entity';
import { PurchaseOrderProduct } from './modules/orders/entities/purchase-order-product.entity';
import { SalesOrderProduct } from './modules/orders/entities/sales-order-product.entity';
import { StockStation } from './modules/stocks/entities/stock-station.entity';
import { StockSupplier } from './modules/stocks/entities/stock-supplier.entity';
import { StockPlatform } from './modules/stocks/entities/stock-platform.entity';
import { TransferRequest } from './modules/transfers/entities/transfer-request.entity';
import { TransferRequestProduct } from './modules/transfers/entities/transfer-request-product.entity';
import { Forecast } from './modules/forecasts/entities/forecast.entity';
import { ShoppingCart } from './modules/shopping-carts/entities/shopping-cart.entity';
import { ShoppingCartItem } from './modules/shopping-carts/entities/shopping-cart-item.entity';
import { MasterContract } from './modules/contracts/entities/master-contract.entity';
import { ContractProductSLA } from './modules/contracts/entities/contract-product-sla.entity';
import { ContractPerformanceMetric } from './modules/contracts/entities/contract-performance-metric.entity';
import { Document } from './modules/documents/entities/document.entity';
import { DocumentAccess } from './modules/documents/entities/document-access.entity';
import { EntityHistory } from './common/entities/entity-history.entity';

// Modules
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { StationsModule } from './modules/stations/stations.module';
import { SuppliersModule } from './modules/suppliers/suppliers.module';
import { PlatformsModule } from './modules/platforms/platforms.module';
import { ProductsModule } from './modules/products/products.module';
import { OrdersModule } from './modules/orders/orders.module';
import { StocksModule } from './modules/stocks/stocks.module';
import { TransfersModule } from './modules/transfers/transfers.module';
import { ShoppingCartsModule } from './modules/shopping-carts/shopping-carts.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { ContractsModule } from './modules/contracts/contracts.module';
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

    // Event Emitter
    EventEmitterModule.forRoot(),

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
          Supplier,
          SupplierSite,
          SupplierContact,
          Platform,
          PlatformSite,
          PlatformContact,
          Product,
          ProductSupplier,
          MasterOrder,
          PurchaseOrder,
          SalesOrder,
          PurchaseOrderProduct,
          SalesOrderProduct,
          StockStation,
          StockSupplier,
          StockPlatform,
          TransferRequest,
          TransferRequestProduct,
          Forecast,
          ShoppingCart,
          ShoppingCartItem,
          MasterContract,
          ContractProductSLA,
          ContractPerformanceMetric,
          Document,
          DocumentAccess,
          EntityHistory,
        ],
        synchronize: false, // Disabled - using migrations instead
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
    SuppliersModule,
    PlatformsModule,
    ProductsModule,
    OrdersModule,
    StocksModule,
    TransfersModule,
    ShoppingCartsModule,
    DocumentsModule,
    ContractsModule,
  ],
  controllers: [],
  providers: [DatabaseSeeder],
})
export class AppModule {}
