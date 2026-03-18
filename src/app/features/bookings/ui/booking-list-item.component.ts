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
  template: `
    <button
      type="button"
      class="w-full text-left bg-white rounded-lg border border-gray-200 px-4 py-3 hover:border-indigo-300 hover:shadow-sm transition-all"
      (click)="clicked.emit(booking().id)"
    >
      <div class="flex items-start justify-between gap-3">
        <div class="flex-1 min-w-0">
          <!-- Client name -->
          <p class="text-sm font-medium text-gray-900 truncate">
            {{ booking().intakeName }} {{ booking().intakeLastName }}
          </p>
          <!-- Listing title -->
          @if (booking().listingTitle) {
            <p class="text-sm text-gray-600 truncate mt-0.5">{{ booking().listingTitle }}</p>
          }
          <!-- Service + duration -->
          @if (booking().serviceName) {
            <p class="text-xs text-gray-400 mt-0.5">
              {{ booking().serviceName }}
              @if (booking().serviceDurationMin) {
                &nbsp;&bull;&nbsp;{{ booking().serviceDurationMin }} min
              }
            </p>
          }
          <!-- Price -->
          @if (booking().listingEffectivePrice !== null) {
            <p class="text-xs text-gray-500 mt-1">
              {{ booking().listingEffectivePrice | number:'1.2-2' }}
              {{ booking().listingCurrency }}
            </p>
          }
        </div>
        <!-- Status badge -->
        <span class="shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium {{ statusClass(booking().status) }}">
          {{ statusLabel(booking().status) }}
        </span>
      </div>
      <!-- Created at -->
      <p class="text-xs text-gray-400 mt-2">
        Booked {{ formatDate(booking().createdAt) }}
      </p>
    </button>
  `,
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
