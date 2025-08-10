import { PartialType } from '@nestjs/swagger';
import { CreateSupplierContactDto } from './create-Supplier-contact.dto';

export class UpdateSupplierContactDto extends PartialType(CreateSupplierContactDto) {}
