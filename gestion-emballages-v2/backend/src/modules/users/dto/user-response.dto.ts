import { Exclude, Expose, Type } from 'class-transformer';
import { UserRole } from '@common/enums/user-role.enum';
import { EntityType } from '../entities/user.entity';

export class UserResponseDto {
  @Expose()
  id: string;

  @Expose()
  email: string;

  @Exclude()
  passwordHash: string;

  @Expose()
  nomComplet: string;

  @Expose()
  role: UserRole;

  @Expose()
  entiteType?: EntityType;

  @Expose()
  entiteId?: string;

  @Expose()
  isActive: boolean;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  // Virtual properties
  @Expose()
  get isManager(): boolean {
    return this.role === UserRole.MANAGER;
  }

  @Expose()
  get isGestionnaire(): boolean {
    return this.role === UserRole.GESTIONNAIRE;
  }

  @Expose()
  get isStation(): boolean {
    return this.role === UserRole.STATION;
  }

  @Expose()
  get isFournisseur(): boolean {
    return this.role === UserRole.FOURNISSEUR;
  }
}