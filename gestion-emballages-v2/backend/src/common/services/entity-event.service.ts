import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EntityChangeEvent } from '../interfaces/entity-change-event.interface';

@Injectable()
export class EntityEventService {
  constructor(private eventEmitter: EventEmitter2) {}

  emitEntityChange(
    entityType: string,
    entityId: string,
    oldValues: Record<string, unknown>,
    newValues: Record<string, unknown>,
    changedBy: string,
    options?: {
      reason?: string;
      ipAddress?: string;
      userAgent?: string;
    }
  ) {
    const event: EntityChangeEvent = {
      entityType,
      entityId,
      oldValues,
      newValues,
      changedBy,
      reason: options?.reason,
      ipAddress: options?.ipAddress,
      userAgent: options?.userAgent,
    };

    // Emit async event - no blocking
    this.eventEmitter.emit('entity.changed', event);
  }
}
