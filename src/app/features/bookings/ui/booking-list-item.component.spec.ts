import { TestBed } from '@angular/core/testing';
import { BookingListItemComponent } from './booking-list-item.component';
import { ProviderBookingItem } from '../data-access/models/booking.model';

const mockBooking: ProviderBookingItem = {
  id: '1',
  intakeName: 'John',
  intakeLastName: 'Doe',
  listingTitle: 'Test Listing',
  serviceName: 'Test Service',
  serviceDurationMin: 60,
  listingEffectivePrice: 100,
  listingCurrency: 'USD',
  status: 'Pending',
  createdAt: new Date().toISOString(),
};

describe('BookingListItemComponent', () => {
  it('should create', () => {
    const fixture = TestBed.configureTestingModule({
      imports: [BookingListItemComponent],
    }).createComponent(BookingListItemComponent);
    fixture.componentRef.setInput('booking', mockBooking);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
