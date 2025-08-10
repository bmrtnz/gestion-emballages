import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OnEvent } from '@nestjs/event-emitter';
import { EntityHistory } from '../entities/entity-history.entity';
import { EntityChangeEvent } from '../interfaces/entity-change-event.interface';

@Injectable()
export class HistoryService {
  constructor(
    @InjectRepository(EntityHistory)
    private historyRepository: Repository<EntityHistory>
  ) {}

  @OnEvent('entity.changed', { async: true })
  async handleEntityChange(payload: EntityChangeEvent) {
    try {
      const changes = this.calculateDiff(payload.oldValues, payload.newValues);

      if (Object.keys(changes).length === 0) {
        return; // No actual changes
      }

      await this.historyRepository.save({
        entityType: payload.entityType,
        entityId: payload.entityId,
        changes,
        changedBy: payload.changedBy,
        reason: payload.reason,
        ipAddress: payload.ipAddress,
        userAgent: payload.userAgent,
      });
    } catch (error) {
      console.error('Failed to save entity history:', error);
      // Don't throw - history failure shouldn't break main operations
    }
  }

  async getEntityHistory(
    entityType: string,
    entityId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<EntityHistory[]> {
    return this.historyRepository.find({
      where: { entityType, entityId },
      order: { timestamp: 'DESC' },
      take: limit,
      skip: offset,
    });
  }

  async getHistoryByUser(changedBy: string, limit: number = 50, offset: number = 0): Promise<EntityHistory[]> {
    return this.historyRepository.find({
      where: { changedBy },
      order: { timestamp: 'DESC' },
      take: limit,
      skip: offset,
    });
  }

  private calculateDiff(oldValues: any, newValues: any): Record<string, { old: any; new: any }> {
    const changes: Record<string, { old: any; new: any }> = {};

    // Skip system fields that change automatically
    const skipFields = ['updatedAt', 'created_at', 'updated_at'];

    // Compare all fields in newValues
    for (const [key, newValue] of Object.entries(newValues || {})) {
      if (skipFields.includes(key)) {
        continue;
      }

      const oldValue = oldValues?.[key];

      if (this.hasValueChanged(oldValue, newValue)) {
        changes[key] = {
          old: oldValue,
          new: newValue,
        };
      }
    }

    return changes;
  }

  private hasValueChanged(oldValue: any, newValue: any): boolean {
    // Handle null/undefined cases
    if (oldValue == null && newValue == null) {
      return false;
    }
    if (oldValue == null || newValue == null) {
      return true;
    }

    // Handle dates
    if (oldValue instanceof Date && newValue instanceof Date) {
      return oldValue.getTime() !== newValue.getTime();
    }

    // Handle objects/arrays (simple JSON comparison)
    if (typeof oldValue === 'object' && typeof newValue === 'object') {
      return JSON.stringify(oldValue) !== JSON.stringify(newValue);
    }

    // Handle primitive values
    return oldValue !== newValue;
  }
}
