import { Column, Entity } from 'typeorm';
import { Exclude } from 'class-transformer';
import { SoftDeletableEntity } from '@common/entities/base.entity';
import { EntityType, UserRole } from '@common/enums/user-role.enum';

@Entity('users')
export class User extends SoftDeletableEntity {
  @Column({ unique: true })
  email: string;

  @Column({ name: 'hashed_password' })
  @Exclude()
  hashedPassword: string;

  @Column({ name: 'full_name' })
  fullName: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({
    type: 'enum',
    enum: UserRole,
  })
  role: UserRole;

  @Column({
    type: 'enum',
    enum: EntityType,
    name: 'entity_type',
    nullable: true,
  })
  entityType?: EntityType;

  @Column({ name: 'entity_id', nullable: true })
  entityId?: string;

  @Column({ name: 'reset_token', nullable: true })
  @Exclude()
  resetToken?: string;

  @Column({ name: 'reset_token_expiry', nullable: true })
  @Exclude()
  resetTokenExpiry?: Date;

  // Relations - polymorphic relationship handled through entiteType and entiteId
  // Note: These are virtual relations, not actual FK constraints to avoid conflicts

  // Virtual properties
  get isAdmin(): boolean {
    return this.role === UserRole.ADMIN;
  }

  get isManager(): boolean {
    return this.role === UserRole.MANAGER;
  }

  get isHandler(): boolean {
    return this.role === UserRole.HANDLER;
  }

  get isStation(): boolean {
    return this.role === UserRole.STATION;
  }

  get isSupplier(): boolean {
    return this.role === UserRole.SUPPLIER;
  }
}
