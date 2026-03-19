import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TimelinePageComponent } from './timeline-page.component';

describe('TimelinePageComponent', () => {
  it('should create', () => {
    const fixture = TestBed.configureTestingModule({
      imports: [TimelinePageComponent, RouterTestingModule, HttpClientTestingModule],
    }).createComponent(TimelinePageComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
