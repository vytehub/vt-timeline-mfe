import { TestBed } from '@angular/core/testing';
import { BookingActionModalComponent, ModalConfig } from './booking-action-modal.component';

const mockConfig: ModalConfig = {
  variant: 'confirm',
  title: 'Confirm booking',
  message: 'The client will be notified.',
  confirmLabel: 'Confirm booking',
};

describe('BookingActionModalComponent', () => {
  it('should create', () => {
    const fixture = TestBed.configureTestingModule({
      imports: [BookingActionModalComponent],
    }).createComponent(BookingActionModalComponent);
    fixture.componentRef.setInput('config', mockConfig);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
