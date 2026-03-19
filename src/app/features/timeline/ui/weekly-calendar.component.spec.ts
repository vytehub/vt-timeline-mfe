import { TestBed } from '@angular/core/testing';
import { WeeklyCalendarComponent } from './weekly-calendar.component';
import { TimelineEventItem } from '../data-access/models/timeline.model';

const mockEvents: TimelineEventItem[] = [];

describe('WeeklyCalendarComponent', () => {
  it('should create', () => {
    const fixture = TestBed.configureTestingModule({
      imports: [WeeklyCalendarComponent],
    }).createComponent(WeeklyCalendarComponent);
    fixture.componentRef.setInput('events', mockEvents);
    fixture.componentRef.setInput('weekStart', '2026-03-16');
    expect(fixture.componentInstance).toBeTruthy();
  });
});
