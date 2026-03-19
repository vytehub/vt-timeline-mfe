import { TestBed } from '@angular/core/testing';
import { ConflictWarningModalComponent } from './conflict-warning-modal.component';
import { ConflictWarning } from './conflict-warning-modal.component';

const mockConflict: ConflictWarning = {
  overlappingBookingDate: '2026-03-20',
  eventTitle: 'Test Event',
};

describe('ConflictWarningModalComponent', () => {
  it('should create', () => {
    const fixture = TestBed.configureTestingModule({
      imports: [ConflictWarningModalComponent],
    }).createComponent(ConflictWarningModalComponent);
    fixture.componentRef.setInput('conflict', mockConflict);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
