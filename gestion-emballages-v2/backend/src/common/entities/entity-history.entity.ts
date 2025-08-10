import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('entity_history')
@Index(['entityType', 'entityId', 'timestamp'])
export class EntityHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'entity_type' })
  entityType: string;

  @Column({ name: 'entity_id' })
  entityId: string;

  @Column('json')
  changes: Record<string, { old: any; new: any }>;

  @Column({ name: 'changed_by' })
  changedBy: string;

  @CreateDateColumn()
  timestamp: Date;

  @Column({ nullable: true })
  reason?: string;

  @Column({ name: 'ip_address', nullable: true })
  ipAddress?: string;

  @Column({ name: 'user_agent', nullable: true })
  userAgent?: string;
}
