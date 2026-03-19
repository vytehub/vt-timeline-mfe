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
  templateUrl: './booking-detail.component.html',
  styleUrl: './booking-detail.component.scss',
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
