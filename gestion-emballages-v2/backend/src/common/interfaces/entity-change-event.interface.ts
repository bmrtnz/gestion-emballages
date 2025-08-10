export interface EntityChangeEvent {
  entityType: string;
  entityId: string;
  oldValues: Record<string, unknown>;
  newValues: Record<string, unknown>;
  changedBy: string;
  reason?: string;
  ipAddress?: string;
  userAgent?: string;
}
