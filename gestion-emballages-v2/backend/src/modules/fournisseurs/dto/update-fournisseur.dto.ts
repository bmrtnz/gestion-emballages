import { PartialType } from '@nestjs/mapped-types';
import { CreateFournisseurDto } from './create-fournisseur.dto';

export class UpdateFournisseurDto extends PartialType(CreateFournisseurDto) {}