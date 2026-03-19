import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  signal,
  computed,
  ChangeDetectionStrategy,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { BookingService } from '../data-access/booking.service';
import {
  BookingStatus,
  ProviderBookingItem,
} from '../data-access/models/booking.model';
import { BookingListItemComponent } from '../ui/booking-list-item.component';

// NEEDS-CLARIFICATION: The API requires a profileId query param. Currently there is no
// shared auth service in this MFE exposing the current user's profileId.
// Using a placeholder until auth integration is available.
const PLACEHOLDER_PROFILE_ID = '00000000-0000-0000-0000-000000000001';

type FilterStatus = 'All' | BookingStatus;

interface FilterChip {
  label: string;
  value: FilterStatus;
}

const FILTER_CHIPS: FilterChip[] = [
  { label: 'All', value: 'All' },
  { label: 'Pending', value: 'Pending' },
  { label: 'Confirmed', value: 'Confirmed' },
  { label: 'Completed', value: 'Completed' },
  { label: 'Cancelled', value: 'Cancelled' },
  { label: 'No Show', value: 'NoShow' },
];

@Component({
  selector: 'app-bookings-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, BookingListItemComponent],
  templateUrl: './bookings-page.component.html',
  styleUrl: './bookings-page.component.scss',
})
export class BookingsPageComponent implements OnInit, OnDestroy {
  private bookingService = inject(BookingService);
  private router = inject(Router);

  protected readonly filterChips = FILTER_CHIPS;
  protected readonly Math = Math;
  protected readonly pageSize = 20;

  loading = signal(false);
  error = signal<string | null>(null);
  bookings = signal<ProviderBookingItem[]>([]);
  totalCount = signal(0);
  currentPage = signal(1);
  activeFilter = signal<FilterStatus>('All');

  fromDateControl = new FormControl('');
  toDateControl = new FormControl('');
  searchQueryControl = new FormControl('');

  private subs = new Subscription();

  pendingCount = computed(() =>
    this.bookings().filter((b) => b.status === 'Pending').length
  );

  ngOnInit(): void {
    this.load();

    this.subs.add(
      this.fromDateControl.valueChanges.pipe(distinctUntilChanged()).subscribe(() => {
        this.currentPage.set(1);
        this.load();
      })
    );

    this.subs.add(
      this.toDateControl.valueChanges.pipe(distinctUntilChanged()).subscribe(() => {
        this.currentPage.set(1);
        this.load();
      })
    );

    this.subs.add(
      this.searchQueryControl.valueChanges
        .pipe(debounceTime(350), distinctUntilChanged())
        .subscribe(() => {
          this.currentPage.set(1);
          this.load();
        })
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  setFilter(filter: FilterStatus): void {
    this.activeFilter.set(filter);
    this.currentPage.set(1);
    this.load();
  }

  prevPage(): void {
    this.currentPage.update((p) => Math.max(1, p - 1));
    this.load();
  }

  nextPage(): void {
    this.currentPage.update((p) => p + 1);
    this.load();
  }

  navigateToDetail(id: string): void {
    this.router.navigate(['/timeline/bookings', id]);
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);

    const status = this.activeFilter();
    const fromDate = this.fromDateControl.value ?? '';
    const toDate = this.toDateControl.value ?? '';
    const searchQuery = this.searchQueryControl.value ?? '';

    this.bookingService
      .getProviderBookings({
        profileId: PLACEHOLDER_PROFILE_ID,
        status: status === 'All' ? undefined : status,
        from: fromDate || undefined,
        to: toDate || undefined,
        q: searchQuery || undefined,
        page: this.currentPage(),
        pageSize: this.pageSize,
      })
      .subscribe({
        next: (data) => {
          this.bookings.set(data.items);
          this.totalCount.set(data.totalCount);
          this.loading.set(false);
        },
        error: () => {
          this.error.set('Could not load bookings. Please try again.');
          this.loading.set(false);
        },
      });
  }
}
