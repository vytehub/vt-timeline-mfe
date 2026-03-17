export interface TimelineSlot {
  id: string;
  listingId: string;
  listingTitle: string;
  start: string;
  end: string;
  durationMinutes: number;
}

export interface TimelineBooking {
  id: string;
  listingId: string;
  listingTitle: string;
  clientName: string;
  start: string;
  end: string;
  durationMinutes: number;
  status: 'confirmed' | 'pending';
}

export interface TimelineEvent {
  id: string;
  timelineId: string;
  title: string | null;
  start: string;
  end: string;
  isPrivate: boolean;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TimelineDay {
  date: string;
  slots: TimelineSlot[];
  bookings: TimelineBooking[];
  events: TimelineEvent[];
}

export interface GetTimelineResponse {
  timelineId: string;
  profileId: string;
  weekStart: string;
  weekEnd: string;
  days: TimelineDay[];
}

export interface ConflictRule {
  id: string;
  timelineId: string;
  sourceTimelineId: string;
  sourceTimelineName: string;
  action: 'NotifyOnly';
  createdAt: string;
}
