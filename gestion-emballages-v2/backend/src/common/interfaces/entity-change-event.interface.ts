export interface EntityChangeEvent {
  entityType: string;
  entityId: string;
  oldValues: any;
  newValues: any;
  changedBy: string;
  reason?: string;
  ipAddress?: string;
  userAgent?: string;
}
