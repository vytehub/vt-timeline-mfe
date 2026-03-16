import {
  Component,
  ChangeDetectionStrategy,
  input,
  computed,
} from '@angular/core';
import { TimelineDay, TimelineSlot, TimelineBooking, TimelineEvent } from '../data-access/models/timeline.model';

interface CalendarColumn {
  dayLabel: string;
  dateLabel: string;
  isToday: boolean;
  slots: TimelineSlot[];
  bookings: TimelineBooking[];
  events: TimelineEvent[];
}

@Component({
  selector: 'app-weekly-calendar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="grid grid-cols-7 gap-px bg-gray-200 rounded-xl overflow-hidden border border-gray-200">
      @for (col of columns(); track col.dateLabel) {
        <div
          class="flex flex-col bg-white min-h-48"
          [class.bg-indigo-50]="col.isToday"
        >
          <!-- Day header -->
          <div
            class="px-2 py-2 text-center border-b border-gray-100"
            [class.bg-indigo-100]="col.isToday"
          >
            <p class="text-xs font-medium text-gray-500 uppercase tracking-wide">{{ col.dayLabel }}</p>
            <p
              class="text-sm font-semibold mt-0.5"
              [class.text-indigo-700]="col.isToday"
              [class.text-gray-800]="!col.isToday"
            >{{ col.dateLabel }}</p>
          </div>

          <!-- Events -->
          <div class="flex flex-col gap-1 p-2 flex-1">
            @for (slot of col.slots; track slot.id) {
              <div
                class="rounded px-2 py-1 bg-blue-50 border border-blue-200"
                [attr.title]="slot.listingTitle + ' — ' + slot.durationMinutes + ' min'"
              >
                <p class="text-xs font-medium text-blue-800 truncate">{{ slot.listingTitle }}</p>
                <p class="text-xs text-blue-600">{{ formatTime(slot.start) }}</p>
              </div>
            }
            @for (booking of col.bookings; track booking.id) {
              <div
                class="rounded px-2 py-1"
                [class.bg-green-50]="booking.status === 'confirmed'"
                [class.border-green-200]="booking.status === 'confirmed'"
                [class.bg-yellow-50]="booking.status === 'pending'"
                [class.border-yellow-200]="booking.status === 'pending'"
                [class.border]="true"
                [attr.title]="booking.clientName + ' · ' + booking.listingTitle"
              >
                <p
                  class="text-xs font-medium truncate"
                  [class.text-green-800]="booking.status === 'confirmed'"
                  [class.text-yellow-800]="booking.status === 'pending'"
                >{{ booking.clientName }}</p>
                <p
                  class="text-xs"
                  [class.text-green-600]="booking.status === 'confirmed'"
                  [class.text-yellow-600]="booking.status === 'pending'"
                >{{ formatTime(booking.start) }}</p>
              </div>
            }
            @for (event of col.events; track event.id) {
              <div
                class="rounded px-2 py-1 bg-purple-50 border border-purple-200"
                [attr.title]="event.title || 'Private event'"
              >
                <p class="text-xs font-medium text-purple-800 truncate">{{ event.title || 'Private' }}</p>
                <p class="text-xs text-purple-600">{{ formatTime(event.start) }}</p>
              </div>
            }
            @if (col.slots.length === 0 && col.bookings.length === 0 && col.events.length === 0) {
              <p class="text-xs text-gray-300 text-center mt-2">—</p>
            }
          </div>
        </div>
      }
    </div>

    <!-- Legend -->
    <div class="flex items-center gap-4 mt-3">
      <div class="flex items-center gap-1.5">
        <span class="w-3 h-3 rounded-sm bg-blue-100 border border-blue-300 inline-block"></span>
        <span class="text-xs text-gray-500">Slot</span>
      </div>
      <div class="flex items-center gap-1.5">
        <span class="w-3 h-3 rounded-sm bg-green-100 border border-green-300 inline-block"></span>
        <span class="text-xs text-gray-500">Booking (confirmed)</span>
      </div>
      <div class="flex items-center gap-1.5">
        <span class="w-3 h-3 rounded-sm bg-yellow-100 border border-yellow-300 inline-block"></span>
        <span class="text-xs text-gray-500">Booking (pending)</span>
      </div>
      <div class="flex items-center gap-1.5">
        <span class="w-3 h-3 rounded-sm bg-purple-100 border border-purple-300 inline-block"></span>
        <span class="text-xs text-gray-500">Private event</span>
      </div>
    </div>
  `,
})
export class WeeklyCalendarComponent {
  days = input.required<TimelineDay[]>();

  private readonly DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  private readonly TODAY = new Date().toISOString().split('T')[0];

  columns = computed<CalendarColumn[]>(() =>
    this.days().map((day, i) => ({
      dayLabel: this.DAY_LABELS[i] ?? this.getDayLabel(day.date),
      dateLabel: this.getDateLabel(day.date),
      isToday: day.date === this.TODAY,
      slots: day.slots,
      bookings: day.bookings,
      events: day.events,
    }))
  );

  formatTime(iso: string): string {
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  private getDateLabel(iso: string): string {
    return new Date(iso).toLocaleDateString([], { day: 'numeric', month: 'short' });
  }

  private getDayLabel(iso: string): string {
    return new Date(iso).toLocaleDateString([], { weekday: 'short' });
  }
}
