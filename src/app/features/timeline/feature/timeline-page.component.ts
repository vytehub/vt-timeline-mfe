import {
  Component,
  OnInit,
  inject,
  signal,
  computed,
  ChangeDetectionStrategy,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TimelineService } from '../data-access/timeline.service';
import { TimelineStateService } from '../data-access/timeline-state.service';
import { TimelineEventItem } from '../data-access/models/timeline.model';
import { WeeklyCalendarComponent } from '../ui/weekly-calendar.component';

@Component({
  selector: 'app-timeline-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, WeeklyCalendarComponent],
  template: `
    <div class="flex flex-col min-h-screen bg-gray-50">
      <!-- Header -->
      <div class="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
        <div>
          <h1 class="text-xl font-semibold text-gray-900">Timeline</h1>
          @if (weekLabel()) {
            <p class="text-sm text-gray-500 mt-0.5">{{ weekLabel() }}</p>
          }
        </div>
        <div class="flex items-center gap-2">
          <button
            class="px-3 py-1.5 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            (click)="prevWeek()"
            aria-label="Previous week"
          >&larr;</button>
          <button
            class="px-3 py-1.5 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            (click)="currentWeek()"
          >Today</button>
          <button
            class="px-3 py-1.5 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            (click)="nextWeek()"
            aria-label="Next week"
          >&rarr;</button>
          <a
            routerLink="/timeline/events/new"
            class="ml-2 px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
          >+ Event</a>
        </div>
      </div>

      <!-- Calendar body -->
      <div class="flex-1 px-6 py-4">
        @if (loading()) {
          <div class="flex items-center justify-center py-20">
            <p class="text-gray-400 text-sm">Loading timeline...</p>
          </div>
        } @else if (error()) {
          <div class="flex items-center justify-center py-20">
            <p class="text-red-500 text-sm">{{ error() }}</p>
          </div>
        } @else if (isEmpty()) {
          <div class="flex flex-col items-center justify-center py-20 gap-4">
            <p class="text-gray-500 text-base">No events this week.</p>
            <p class="text-gray-400 text-sm">Publish a listing to start seeing projected slots here.</p>
            <a
              routerLink="/listing/new"
              class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
            >Create Listing</a>
          </div>
        } @else {
          <app-weekly-calendar
            [events]="events()"
            [weekStart]="weekStart()"
            (privateEventClick)="onPrivateEventClick($event)"
          />
        }
      </div>
    </div>
  `,
})
export class TimelinePageComponent implements OnInit {
  private timelineService = inject(TimelineService);
  private timelineState = inject(TimelineStateService);
  private router = inject(Router);

  loading = signal(false);
  error = signal<string | null>(null);
  events = signal<TimelineEventItem[]>([]);
  weekStart = signal<string>(this.getMondayIso(new Date()));

  isEmpty = computed<boolean>(() => this.events().length === 0);

  weekLabel = computed<string>(() => {
    const start = new Date(this.weekStart());
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    const fmt = (d: Date) =>
      d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    return `${fmt(start)} – ${fmt(end)}, ${start.getFullYear()}`;
  });

  ngOnInit(): void {
    this.load();
  }

  prevWeek(): void {
    const d = new Date(this.weekStart());
    d.setDate(d.getDate() - 7);
    this.weekStart.set(this.getMondayIso(d));
    this.load();
  }

  nextWeek(): void {
    const d = new Date(this.weekStart());
    d.setDate(d.getDate() + 7);
    this.weekStart.set(this.getMondayIso(d));
    this.load();
  }

  currentWeek(): void {
    this.weekStart.set(this.getMondayIso(new Date()));
    this.load();
  }

  onPrivateEventClick(event: TimelineEventItem): void {
    this.router.navigate(['/timeline/events', event.id], {
      state: { event },
    });
  }

  private load(): void {
    this.loading.set(true);
    this.error.set(null);

    const from = this.weekStart();
    const toDate = new Date(from);
    toDate.setDate(toDate.getDate() + 6);
    const to = toDate.toISOString().split('T')[0];

    this.timelineService.getTimelineEvents(from, to).subscribe({
      next: (data) => {
        this.events.set(data.events);
        this.loading.set(false);
        // Persist the timelineId for use in event create/edit forms.
        // All events share the same timelineId for the current user.
        const firstEvent = data.events[0];
        if (firstEvent) {
          this.timelineState.setTimelineId(firstEvent.timelineId);
        }
      },
      error: () => {
        this.error.set('Could not load timeline. Please try again.');
        this.loading.set(false);
      },
    });
  }

  private getMondayIso(date: Date): string {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    return d.toISOString().split('T')[0];
  }
}
