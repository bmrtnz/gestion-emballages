import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '@common/entities/base.entity';
import { User } from '@modules/users/entities/user.entity';
import { Station } from './station.entity';

@Entity('station_contacts')
export class StationContact extends BaseEntity {
  @Column({ name: 'nom_complet' })
  nomComplet: string;

  @Column({ nullable: true })
  poste?: string;

  @Column({ nullable: true })
  telephone?: string;

  @Column({ nullable: true })
  email?: string;

  @Column({ name: 'est_principal', default: false })
  estPrincipal: boolean;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'station_id' })
  stationId: string;

  @Column({ name: 'created_by', nullable: true })
  createdById?: string;

  @Column({ name: 'updated_by', nullable: true })
  updatedById?: string;

  // Relations
  @ManyToOne(() => Station, (station) => station.contacts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'station_id' })
  station: Station;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by' })
  createdBy?: User;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'updated_by' })
  updatedBy?: User;

  // Virtual properties
  get displayName(): string {
    if (this.poste) {
      return `${this.nomComplet} - ${this.poste}`;
    }
    return this.nomComplet;
  }

  get hasContactInfo(): boolean {
    return !!(this.telephone || this.email);
  }
}