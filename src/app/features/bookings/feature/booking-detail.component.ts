import {
  Component,
  OnInit,
  inject,
  signal,
  computed,
  ChangeDetectionStrategy,
} from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BookingService } from '../data-access/booking.service';
import { BookingDetail, BookingStatus } from '../data-access/models/booking.model';
import {
  BookingActionModalComponent,
  ModalConfig,
  ModalVariant,
} from '../ui/booking-action-modal.component';

type ActiveModal = 'confirm' | 'reject' | 'complete' | 'no-show' | 'cancel' | null;

const MODAL_CONFIGS: Record<NonNullable<ActiveModal>, ModalConfig> = {
  confirm: {
    variant: 'confirm',
    title: 'Confirm booking',
    message: 'The client will be notified that their booking is confirmed.',
    confirmLabel: 'Confirm booking',
    showTextarea: true,
    textareaLabel: 'Message to client (optional)',
    textareaPlaceholder: 'Add a note for the client...',
  },
  reject: {
    variant: 'reject',
    title: 'Reject booking',
    message: 'The booking will be cancelled and the client will be notified.',
    confirmLabel: 'Reject booking',
    showTextarea: true,
    textareaLabel: 'Reason (optional)',
    textareaPlaceholder: 'Explain why you are rejecting this booking...',
  },
  complete: {
    variant: 'complete',
    title: 'Mark as completed',
    message: 'Confirm that the service has been delivered to the client.',
    confirmLabel: 'Mark complete',
  },
  'no-show': {
    variant: 'no-show',
    title: 'Mark as no-show',
    message:
      'The client did not attend. A no-show penalty may be applied per your listing policy.',
    confirmLabel: 'Mark no-show',
  },
  cancel: {
    variant: 'cancel',
    title: 'Cancel booking',
    message:
      'A 100% refund will be issued to the client. This action cannot be undone.',
    confirmLabel: 'Cancel booking',
  },
};

@Component({
  selector: 'app-booking-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, DecimalPipe, BookingActionModalComponent],
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
          <!-- Status badge (prominent for terminal states) -->
          <div class="flex items-center justify-between mb-4">
            <span
              class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium {{ statusClass(booking()!.status) }}"
              [class.text-base]="isTerminal()"
              [class.px-4]="isTerminal()"
              [class.py-1.5]="isTerminal()"
            >
              {{ statusLabel(booking()!.status) }}
            </span>
            <p class="text-xs text-gray-400">Booked {{ formatDate(booking()!.createdAt) }}</p>
          </div>

          <!-- Terminal state banner -->
          @if (isTerminal()) {
            <div class="rounded-lg border p-4 mb-4 {{ terminalBannerClass() }}">
              <p class="text-sm font-medium">{{ terminalBannerMessage() }}</p>
            </div>
          }

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

          <!-- Booking details -->
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

          <!-- Action buttons — Pending -->
          @if (booking()!.status === 'Pending') {
            <div class="flex gap-3">
              <button
                type="button"
                class="flex-1 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
                [disabled]="actionLoading()"
                (click)="openModal('confirm')"
              >
                Confirm
              </button>
              <button
                type="button"
                class="flex-1 px-4 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 disabled:opacity-50 transition-colors"
                [disabled]="actionLoading()"
                (click)="openModal('reject')"
              >
                Reject
              </button>
            </div>
          }

          <!-- Action buttons — Confirmed -->
          @if (booking()!.status === 'Confirmed') {
            <div class="flex gap-3 flex-wrap">
              <button
                type="button"
                class="flex-1 min-w-[120px] px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
                [disabled]="actionLoading()"
                (click)="openModal('complete')"
              >
                Mark Complete
              </button>
              <button
                type="button"
                class="flex-1 min-w-[120px] px-4 py-2 text-sm font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-md hover:bg-amber-100 disabled:opacity-50 transition-colors"
                [disabled]="actionLoading()"
                (click)="openModal('no-show')"
              >
                Mark No-Show
              </button>
              <button
                type="button"
                class="flex-1 min-w-[120px] px-4 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 disabled:opacity-50 transition-colors"
                [disabled]="actionLoading()"
                (click)="openModal('cancel')"
              >
                Cancel
              </button>
            </div>
          }

          <!-- Action error -->
          @if (actionError()) {
            <p class="text-red-500 text-sm mt-3">{{ actionError() }}</p>
          }

          <!-- Success toast -->
          @if (successMessage()) {
            <div class="mt-3 flex items-center gap-2 px-4 py-3 bg-green-50 border border-green-200 rounded-md">
              <svg class="w-4 h-4 text-green-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
              <p class="text-sm text-green-700 font-medium">{{ successMessage() }}</p>
            </div>
          }
        }
      </div>
    </div>

    <!-- Confirmation modal -->
    @if (activeModal()) {
      <app-booking-action-modal
        [config]="activeModalConfig()!"
        [loading]="actionLoading()"
        (confirmed)="runAction($event)"
        (dismissed)="closeModal()"
      />
    }
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
  successMessage = signal<string | null>(null);
  activeModal = signal<ActiveModal>(null);

  activeModalConfig = computed<ModalConfig | null>(() => {
    const modal = this.activeModal();
    return modal ? MODAL_CONFIGS[modal] : null;
  });

  isTerminal = computed(() => {
    const status = this.booking()?.status;
    return status === 'Completed' || status === 'Cancelled' || status === 'NoShow';
  });

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

  openModal(modal: NonNullable<ActiveModal>): void {
    this.actionError.set(null);
    this.successMessage.set(null);
    this.activeModal.set(modal);
  }

  closeModal(): void {
    this.activeModal.set(null);
  }

  runAction(_reason?: string): void {
    const modal = this.activeModal();
    if (!modal) return;

    const action$ = this.resolveAction(modal);
    if (!action$) return;

    this.actionLoading.set(true);
    this.actionError.set(null);
    this.activeModal.set(null);

    action$.subscribe({
      next: () => {
        this.actionLoading.set(false);
        this.successMessage.set(this.successMessageFor(modal));
        this.loadBooking();
      },
      error: () => {
        this.actionError.set('Action failed. Please try again.');
        this.actionLoading.set(false);
      },
    });
  }

  private resolveAction(modal: NonNullable<ActiveModal>) {
    switch (modal) {
      case 'confirm':
        return this.bookingService.confirmBooking(this.bookingId);
      case 'reject':
        // Reject on Pending uses the /cancel endpoint (same as cancel)
        return this.bookingService.cancelBooking(this.bookingId);
      case 'complete':
        return this.bookingService.completeBooking(this.bookingId);
      case 'no-show':
        return this.bookingService.markNoShow(this.bookingId);
      case 'cancel':
        return this.bookingService.cancelBooking(this.bookingId);
    }
  }

  private successMessageFor(modal: NonNullable<ActiveModal>): string {
    switch (modal) {
      case 'confirm':
        return 'Booking confirmed. The client has been notified.';
      case 'reject':
        return 'Booking rejected.';
      case 'complete':
        return 'Booking marked as completed.';
      case 'no-show':
        return 'Booking marked as no-show.';
      case 'cancel':
        return 'Booking cancelled. A 100% refund will be issued to the client.';
    }
  }

  terminalBannerClass(): string {
    const status = this.booking()?.status;
    if (status === 'Completed') return 'bg-green-50 border-green-200 text-green-800';
    if (status === 'Cancelled') return 'bg-red-50 border-red-200 text-red-800';
    if (status === 'NoShow') return 'bg-gray-100 border-gray-300 text-gray-700';
    return 'bg-gray-100 border-gray-300 text-gray-700';
  }

  terminalBannerMessage(): string {
    const status = this.booking()?.status;
    if (status === 'Completed') return 'This booking has been completed. No further actions are available.';
    if (status === 'Cancelled') return 'This booking has been cancelled. A refund was issued to the client.';
    if (status === 'NoShow') return 'The client did not attend this booking.';
    return '';
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
