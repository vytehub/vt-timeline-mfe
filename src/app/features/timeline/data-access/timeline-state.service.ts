import { Injectable, signal } from '@angular/core';

/**
 * Holds the current user's timelineId in memory.
 * The timelineId is resolved from the first event returned by GET /timelines/events.
 * It is needed to call the private events CRUD endpoints:
 *   POST/PATCH/DELETE /timelines/{timelineId}/events[/{eventId}]
 */
@Injectable({ providedIn: 'root' })
export class TimelineStateService {
  private _timelineId = signal<string | null>(null);

  readonly timelineId = this._timelineId.asReadonly();

  setTimelineId(id: string): void {
    this._timelineId.set(id);
  }
}
