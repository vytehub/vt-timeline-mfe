// Matches backend: Vt.Modules.Timelines.Application.Timelines.GetTimeline.TimelineEventItem
export interface TimelineEventItem {
  id: string;
  timelineId: string;
  title: string | null;
  start: string;
  end: string;
  isPrivate: boolean;
  notes: string | null;
  sourceType: string;
  sourceId: string | null;
  createdAt: string;
  updatedAt: string;
}

// Matches backend: Vt.Modules.Timelines.Application.Timelines.GetTimeline.TimelineEventsResponse
export interface TimelineEventsResponse {
  events: TimelineEventItem[];
}

// Matches backend: Vt.Modules.Timelines.Application.TimelineEvents.GetTimelineEvents.PrivateEventItem
export interface PrivateEventItem {
  id: string;
  timelineId: string;
  title: string | null;
  start: string;
  end: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

// Matches backend: Vt.Modules.Timelines.Application.TimelineEvents.GetTimelineEvents.PrivateEventsResponse
export interface PrivateEventsResponse {
  events: PrivateEventItem[];
}

export interface ConflictRuleResponse {
  id: string;
  timelineId: string;
  sourceTimelineId: string;
  action: string;
  createdAt: string;
}

// Request shapes — match backend endpoint Request inner classes

// POST /timelines/{timelineId}/events
export interface AddTimelineEventRequest {
  start: string;
  end: string;
  title?: string | null;
  notes?: string | null;
}

// PATCH /timelines/{timelineId}/events/{eventId}
export interface UpdateTimelineEventRequest {
  start: string;
  end: string;
  title?: string | null;
  notes?: string | null;
}
