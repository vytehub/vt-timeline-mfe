import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  computed,
} from '@angular/core';
import { TimelineEventItem } from '../data-access/models/timeline.model';

interface DayColumn {
  dayLabel: string;
  dateLabel: string;
  isToday: boolean;
  events: TimelineEventItem[];
}

@Component({
  selector: 'app-weekly-calendar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './weekly-calendar.component.html',
  styleUrl: './weekly-calendar.component.scss',
})
export class WeeklyCalendarComponent {
  events = input.required<TimelineEventItem[]>();
  weekStart = input.required<string>();
  privateEventClick = output<TimelineEventItem>();

  private readonly DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  private readonly TODAY = new Date().toISOString().split('T')[0];

  columns = computed<DayColumn[]>(() => {
    const start = new Date(this.weekStart());
    const grouped = new Map<string, TimelineEventItem[]>();

    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      grouped.set(d.toISOString().split('T')[0], []);
    }

    for (const event of this.events()) {
      const dateKey = event.start.split('T')[0];
      grouped.get(dateKey)?.push(event);
    }

    return Array.from(grouped.entries()).map(([date, events], i) => ({
      dayLabel: this.DAY_LABELS[i],
      dateLabel: this.getDateLabel(date),
      isToday: date === this.TODAY,
      events: events.sort((a, b) => a.start.localeCompare(b.start)),
    }));
  });

  formatTime(iso: string): string {
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  private getDateLabel(iso: string): string {
    return new Date(iso).toLocaleDateString([], { day: 'numeric', month: 'short' });
  }
}
