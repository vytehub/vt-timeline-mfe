import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TimelineEventFormComponent } from './timeline-event-form.component';

describe('TimelineEventFormComponent', () => {
  it('should create', () => {
    const fixture = TestBed.configureTestingModule({
      imports: [TimelineEventFormComponent, RouterTestingModule, HttpClientTestingModule],
    }).createComponent(TimelineEventFormComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
