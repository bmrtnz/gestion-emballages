import { SetMetadata } from '@nestjs/common';

export const TRACK_CHANGES_KEY = 'track_changes';

export interface TrackChangesOptions {
  entityType: string;
  reason?: string;
}

export const TrackChanges = (options: TrackChangesOptions) => SetMetadata(TRACK_CHANGES_KEY, options);
