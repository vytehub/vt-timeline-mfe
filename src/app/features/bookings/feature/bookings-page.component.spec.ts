import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BookingsPageComponent } from './bookings-page.component';

describe('BookingsPageComponent', () => {
  it('should create', () => {
    const fixture = TestBed.configureTestingModule({
      imports: [BookingsPageComponent, RouterTestingModule, HttpClientTestingModule],
    }).createComponent(BookingsPageComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
