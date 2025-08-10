import { PartialType } from '@nestjs/mapped-types';
import { CreateSupplierDto } from './create-Supplier.dto';

export class UpdateSupplierDto extends PartialType(CreateSupplierDto) {}
