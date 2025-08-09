import { DataSource } from 'typeorm';
import { ConfigModule } from '@nestjs/config';
import { config } from 'dotenv';

// Load environment variables
config();

// Import all entities
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
import { Order } from './modules/orders/entities/order.entity';
import { MasterOrder } from './modules/orders/entities/master-order.entity';
import { PurchaseOrder } from './modules/orders/entities/purchase-order.entity';
import { SalesOrder } from './modules/orders/entities/sales-order.entity';
import { OrderProduct } from './modules/orders/entities/order-product.entity';
import { SalesOrderProduct } from './modules/orders/entities/sales-order-product.entity';
import { StockStation } from './modules/stocks/entities/stock-station.entity';
import { StockSupplier } from './modules/stocks/entities/stock-supplier.entity';
import { StockPlatform } from './modules/stocks/entities/stock-platform.entity';
import { TransferRequest } from './modules/transfers/entities/transfer-request.entity';
import { TransferRequestProduct } from './modules/transfers/entities/transfer-request-product.entity';
import { Forecast } from './modules/forecasts/entities/forecast.entity';
import { ShoppingCart } from './modules/shopping-carts/entities/shopping-cart.entity';
import { ShoppingCartItem } from './modules/shopping-carts/entities/shopping-cart-item.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  username: process.env.DB_USERNAME || 'dev_user',
  password: process.env.DB_PASSWORD || 'dev_password',
  database: process.env.DB_DATABASE || 'gestion_emballages_dev',
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
    Order,
    MasterOrder,
    PurchaseOrder,
    SalesOrder,
    OrderProduct,
    SalesOrderProduct,
    StockStation,
    StockSupplier,
    StockPlatform,
    TransferRequest,
    TransferRequestProduct,
    Forecast,
    ShoppingCart,
    ShoppingCartItem,
  ],
  migrations: ['src/migrations/*.ts'],
  migrationsTableName: 'migrations',
  synchronize: process.env.NODE_ENV === 'development', // Enable sync in development
  logging: process.env.DB_LOGGING === 'true',
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});