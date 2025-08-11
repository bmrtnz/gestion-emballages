import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SuppliersController } from './suppliers.controller';
import { SupplierContactsController } from './supplier-contacts.controller';
import { SuppliersService } from './suppliers.service';
import { SupplierContactsService } from './supplier-contacts.service';
import { Supplier } from './entities/supplier.entity';
import { SupplierSite } from './entities/supplier-site.entity';
import { SupplierContact } from './entities/supplier-contact.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Supplier, SupplierSite, SupplierContact])],
  controllers: [SuppliersController, SupplierContactsController],
  providers: [SuppliersService, SupplierContactsService],
  exports: [SuppliersService, SupplierContactsService, TypeOrmModule],
})
export class SuppliersModule {}
