import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BookingDetailComponent } from './booking-detail.component';

describe('BookingDetailComponent', () => {
  it('should create', () => {
    const fixture = TestBed.configureTestingModule({
      imports: [BookingDetailComponent, RouterTestingModule, HttpClientTestingModule],
    }).createComponent(BookingDetailComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
