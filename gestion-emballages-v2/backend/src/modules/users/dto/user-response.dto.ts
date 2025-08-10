import { Exclude, Expose } from 'class-transformer';
import { EntityType, UserRole } from '@common/enums/user-role.enum';

export class UserResponseDto {
  @Expose()
  id: string;

  @Expose()
  email: string;

  @Exclude()
  hashedPassword: string;

  @Expose()
  fullName: string;

  @Expose()
  phone?: string;

  @Expose()
  role: UserRole;

  @Expose()
  entityType?: EntityType;

  @Expose()
  entityId?: string;

  @Expose()
  isActive: boolean;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  // Virtual properties
  @Expose()
  get isAdmin(): boolean {
    return this.role === UserRole.ADMIN;
  }

  @Expose()
  get isManager(): boolean {
    return this.role === UserRole.MANAGER;
  }

  @Expose()
  get isHandler(): boolean {
    return this.role === UserRole.HANDLER;
  }

  @Expose()
  get isStation(): boolean {
    return this.role === UserRole.STATION;
  }

  @Expose()
  get isSupplier(): boolean {
    return this.role === UserRole.SUPPLIER;
  }
}
