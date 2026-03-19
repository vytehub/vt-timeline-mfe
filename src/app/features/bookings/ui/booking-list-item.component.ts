import {
  Component,
  input,
  output,
  ChangeDetectionStrategy,
} from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { BookingStatus, ProviderBookingItem } from '../data-access/models/booking.model';

@Component({
  selector: 'app-booking-list-item',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe],
  templateUrl: './booking-list-item.component.html',
  styleUrl: './booking-list-item.component.scss',
})
export class BookingListItemComponent {
  booking = input.required<ProviderBookingItem>();
  clicked = output<string>();

  statusClass(status: BookingStatus): string {
    const map: Record<BookingStatus, string> = {
      Holding: 'bg-gray-100 text-gray-600',
      Pending: 'bg-amber-100 text-amber-700',
      Confirmed: 'bg-blue-100 text-blue-700',
      Completed: 'bg-green-100 text-green-700',
      Cancelled: 'bg-red-100 text-red-700',
      NoShow: 'bg-gray-100 text-gray-500',
    };
    return map[status] ?? 'bg-gray-100 text-gray-600';
  }

  statusLabel(status: BookingStatus): string {
    const map: Record<BookingStatus, string> = {
      Holding: 'Holding',
      Pending: 'Pending',
      Confirmed: 'Confirmed',
      Completed: 'Completed',
      Cancelled: 'Cancelled',
      NoShow: 'No Show',
    };
    return map[status] ?? status;
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }
}
