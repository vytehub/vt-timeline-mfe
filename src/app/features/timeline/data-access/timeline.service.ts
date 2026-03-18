import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  TimelineEventsResponse,
  ConflictRuleResponse,
  PrivateEventsResponse,
  AddTimelineEventRequest,
  UpdateTimelineEventRequest,
} from './models/timeline.model';

@Injectable({ providedIn: 'root' })
export class TimelineService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  // GET /timelines/events?from=&to=
  // Returns all events (slots + bookings + private) for the current user's timeline.
  getTimelineEvents(from: string, to: string): Observable<TimelineEventsResponse> {
    const params = new HttpParams().set('from', from).set('to', to);
    return this.http.get<TimelineEventsResponse>(`${this.apiUrl}/timelines/events`, { params });
  }

  // GET /timelines/{timelineId}/conflict-rules
  getConflictRules(timelineId: string): Observable<ConflictRuleResponse[]> {
    return this.http.get<ConflictRuleResponse[]>(
      `${this.apiUrl}/timelines/${timelineId}/conflict-rules`
    );
  }

  // GET /timelines/{timelineId}/events?from=&to=
  // Returns private events only for the specified timeline.
  getPrivateEvents(
    timelineId: string,
    from?: string,
    to?: string
  ): Observable<PrivateEventsResponse> {
    let params = new HttpParams();
    if (from) params = params.set('from', from);
    if (to) params = params.set('to', to);
    return this.http.get<PrivateEventsResponse>(
      `${this.apiUrl}/timelines/${timelineId}/events`,
      { params }
    );
  }

  // POST /timelines/{timelineId}/events  → returns Guid (the new event id)
  createEvent(timelineId: string, data: AddTimelineEventRequest): Observable<string> {
    return this.http.post<string>(
      `${this.apiUrl}/timelines/${timelineId}/events`,
      data
    );
  }

  // GET /timelines/{timelineId}/events/{eventId}
  // NOTE: No dedicated single-event GET endpoint exists in the backend.
  // The frontend uses getPrivateEvents and filters by id, or passes event data via navigation state.
  // NEEDS-CLARIFICATION: A GET /timelines/{timelineId}/events/{eventId} endpoint may be needed
  // for the edit page to load a specific event when navigating directly by URL.

  // PATCH /timelines/{timelineId}/events/{eventId}
  updateEvent(
    timelineId: string,
    eventId: string,
    data: UpdateTimelineEventRequest
  ): Observable<void> {
    return this.http.patch<void>(
      `${this.apiUrl}/timelines/${timelineId}/events/${eventId}`,
      data
    );
  }

  // DELETE /timelines/{timelineId}/events/{eventId}
  deleteEvent(timelineId: string, eventId: string): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/timelines/${timelineId}/events/${eventId}`
    );
  }
}
