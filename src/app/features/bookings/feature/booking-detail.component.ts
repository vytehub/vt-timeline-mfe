import {
  Component,
  OnInit,
  inject,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BookingService } from '../data-access/booking.service';
import { BookingDetail, BookingStatus } from '../data-access/models/booking.model';

@Component({
  selector: 'app-booking-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, DecimalPipe],
  template: `
    <div class="flex flex-col min-h-screen bg-gray-50">
      <!-- Header -->
      <div class="px-6 py-4 bg-white border-b border-gray-200 flex items-center gap-3">
        <a
          routerLink="/timeline/bookings"
          class="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          Bookings
        </a>
        <span class="text-gray-300">/</span>
        <h1 class="text-base font-semibold text-gray-900">Booking detail</h1>
      </div>

      <!-- Body -->
      <div class="flex-1 px-6 py-6 max-w-2xl mx-auto w-full">
        @if (loading()) {
          <div class="flex items-center justify-center py-20">
            <p class="text-gray-400 text-sm">Loading booking...</p>
          </div>
        } @else if (error()) {
          <div class="flex items-center justify-center py-20">
            <p class="text-red-500 text-sm">{{ error() }}</p>
          </div>
        } @else if (booking()) {
          <!-- Status badge -->
          <div class="flex items-center justify-between mb-4">
            <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium {{ statusClass(booking()!.status) }}">
              {{ statusLabel(booking()!.status) }}
            </span>
            <p class="text-xs text-gray-400">Booked {{ formatDate(booking()!.createdAt) }}</p>
          </div>

          <!-- Listing info -->
          @if (booking()!.listingSnapshot) {
            <div class="bg-white rounded-lg border border-gray-200 p-4 mb-4">
              <h2 class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Service</h2>
              <p class="text-sm font-medium text-gray-900">{{ booking()!.listingSnapshot!.title }}</p>
              <p class="text-sm text-gray-600 mt-0.5">
                {{ booking()!.listingSnapshot!.effectivePrice | number:'1.2-2' }}
                {{ booking()!.listingSnapshot!.currency }}
              </p>
            </div>
          }

          <!-- Client info -->
          <div class="bg-white rounded-lg border border-gray-200 p-4 mb-4">
            <h2 class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Client</h2>
            <p class="text-sm font-medium text-gray-900">
              {{ booking()!.intake.name }} {{ booking()!.intake.lastName }}
            </p>
            <p class="text-sm text-gray-600 mt-0.5">{{ booking()!.intake.email }}</p>
          </div>

          <!-- Booking IDs (secondary info) -->
          <div class="bg-white rounded-lg border border-gray-200 p-4 mb-6">
            <h2 class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Details</h2>
            <dl class="grid grid-cols-1 gap-1">
              <div class="flex items-baseline justify-between">
                <dt class="text-xs text-gray-500">Booking ID</dt>
                <dd class="text-xs font-mono text-gray-700 truncate max-w-[200px]">{{ booking()!.id }}</dd>
              </div>
              <div class="flex items-baseline justify-between">
                <dt class="text-xs text-gray-500">Confirmation</dt>
                <dd class="text-xs text-gray-700">{{ booking()!.confirmationPolicy }}</dd>
              </div>
              @if (booking()!.holdExpiresAt) {
                <div class="flex items-baseline justify-between">
                  <dt class="text-xs text-gray-500">Hold expires</dt>
                  <dd class="text-xs text-gray-700">{{ formatDate(booking()!.holdExpiresAt!) }}</dd>
                </div>
              }
            </dl>
          </div>

          <!-- CTAs -->
          @if (booking()!.status === 'Pending') {
            <div class="flex gap-3">
              <button
                type="button"
                class="flex-1 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                [disabled]="actionLoading()"
                (click)="confirm()"
              >
                {{ actionLoading() ? 'Saving...' : 'Confirm' }}
              </button>
              <button
                type="button"
                class="flex-1 px-4 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 disabled:opacity-50"
                [disabled]="actionLoading()"
                (click)="reject()"
              >
                Reject
              </button>
            </div>
          }

          @if (booking()!.status === 'Confirmed') {
            <div class="flex gap-3 flex-wrap">
              <button
                type="button"
                class="flex-1 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50"
                [disabled]="actionLoading()"
                (click)="complete()"
              >
                {{ actionLoading() ? 'Saving...' : 'Mark Complete' }}
              </button>
              <button
                type="button"
                class="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-200 rounded-md hover:bg-gray-200 disabled:opacity-50"
                [disabled]="actionLoading()"
                (click)="noShow()"
              >
                No Show
              </button>
              <button
                type="button"
                class="flex-1 px-4 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 disabled:opacity-50"
                [disabled]="actionLoading()"
                (click)="cancel()"
              >
                Cancel
              </button>
            </div>
          }

          @if (actionError()) {
            <p class="text-red-500 text-sm mt-3">{{ actionError() }}</p>
          }
        }
      </div>
    </div>
  `,
})
export class BookingDetailComponent implements OnInit {
  private bookingService = inject(BookingService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  loading = signal(false);
  error = signal<string | null>(null);
  booking = signal<BookingDetail | null>(null);
  actionLoading = signal(false);
  actionError = signal<string | null>(null);

  private bookingId = '';

  ngOnInit(): void {
    this.bookingId = this.route.snapshot.paramMap.get('id') ?? '';
    this.loadBooking();
  }

  private loadBooking(): void {
    this.loading.set(true);
    this.error.set(null);

    this.bookingService.getBooking(this.bookingId).subscribe({
      next: (data) => {
        this.booking.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Could not load booking. Please try again.');
        this.loading.set(false);
      },
    });
  }

  confirm(): void {
    this.runAction(() => this.bookingService.confirmBooking(this.bookingId));
  }

  reject(): void {
    this.runAction(() => this.bookingService.rejectBooking(this.bookingId));
  }

  complete(): void {
    this.runAction(() => this.bookingService.completeBooking(this.bookingId));
  }

  cancel(): void {
    this.runAction(() => this.bookingService.cancelBooking(this.bookingId));
  }

  noShow(): void {
    this.runAction(() => this.bookingService.markNoShow(this.bookingId));
  }

  private runAction(action: () => ReturnType<BookingService['confirmBooking']>): void {
    this.actionLoading.set(true);
    this.actionError.set(null);

    action().subscribe({
      next: () => {
        this.actionLoading.set(false);
        this.loadBooking();
      },
      error: () => {
        this.actionError.set('Action failed. Please try again.');
        this.actionLoading.set(false);
      },
    });
  }

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
