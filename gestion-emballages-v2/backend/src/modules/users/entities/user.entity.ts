import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Exclude } from 'class-transformer';
import { BaseEntity } from '@common/entities/base.entity';
import { UserRole } from '@common/enums/user-role.enum';
import { Station } from '@modules/stations/entities/station.entity';
import { Fournisseur } from '@modules/fournisseurs/entities/fournisseur.entity';

export enum EntityType {
  STATION = 'Station',
  FOURNISSEUR = 'Fournisseur',
}

@Entity('users')
export class User extends BaseEntity {
  @Column({ unique: true })
  email: string;

  @Column({ name: 'password_hash' })
  @Exclude()
  passwordHash: string;

  @Column({ name: 'nom_complet' })
  nomComplet: string;

  @Column({
    type: 'enum',
    enum: UserRole,
  })
  role: UserRole;

  @Column({
    type: 'enum',
    enum: EntityType,
    name: 'entite_type',
    nullable: true,
  })
  entiteType?: EntityType;

  @Column({ name: 'entite_id', nullable: true })
  entiteId?: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  // Relations - polymorphic relationship handled through entiteType and entiteId
  // Note: These are virtual relations, not actual FK constraints to avoid conflicts

  // Virtual properties
  get isManager(): boolean {
    return this.role === UserRole.MANAGER;
  }

  get isGestionnaire(): boolean {
    return this.role === UserRole.GESTIONNAIRE;
  }

  get isStation(): boolean {
    return this.role === UserRole.STATION;
  }

  get isFournisseur(): boolean {
    return this.role === UserRole.FOURNISSEUR;
  }
}