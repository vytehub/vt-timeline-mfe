import {
  Component,
  OnInit,
  inject,
  signal,
  computed,
  ChangeDetectionStrategy,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
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
  imports: [FormsModule, BookingListItemComponent],
  template: `
    <div class="flex flex-col min-h-screen bg-gray-50">
      <!-- Header -->
      <div class="px-6 py-4 bg-white border-b border-gray-200">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-xl font-semibold text-gray-900">Bookings</h1>
            <p class="text-sm text-gray-500 mt-0.5">Manage your incoming bookings</p>
          </div>
          @if (pendingCount() > 0) {
            <span class="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
              {{ pendingCount() }} pending
            </span>
          }
        </div>

        <!-- Filter chips -->
        <div class="flex items-center gap-2 mt-4 overflow-x-auto pb-1">
          @for (chip of filterChips; track chip.value) {
            <button
              type="button"
              class="shrink-0 px-3 py-1 rounded-full text-sm font-medium border transition-colors"
              [class]="activeFilter() === chip.value
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white text-gray-600 border-gray-300 hover:border-indigo-300'"
              (click)="setFilter(chip.value)"
            >
              {{ chip.label }}
            </button>
          }
        </div>

        <!-- Date range + Search -->
        <div class="flex flex-col sm:flex-row gap-2 mt-3">
          <input
            type="date"
            class="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="From"
            [(ngModel)]="fromDate"
            (change)="load()"
          />
          <input
            type="date"
            class="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="To"
            [(ngModel)]="toDate"
            (change)="load()"
          />
          <input
            type="search"
            class="flex-1 sm:flex-[2] px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Search client name..."
            [(ngModel)]="searchQuery"
            (input)="onSearch()"
          />
        </div>
      </div>

      <!-- Body -->
      <div class="flex-1 px-6 py-4">
        @if (loading()) {
          <div class="flex items-center justify-center py-20">
            <p class="text-gray-400 text-sm">Loading bookings...</p>
          </div>
        } @else if (error()) {
          <div class="flex items-center justify-center py-20">
            <p class="text-red-500 text-sm">{{ error() }}</p>
          </div>
        } @else if (bookings().length === 0) {
          <div class="flex flex-col items-center justify-center py-20 gap-3">
            <div class="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
              <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p class="text-gray-500 text-sm font-medium">No bookings yet</p>
            <p class="text-gray-400 text-xs text-center max-w-xs">
              When clients book your services, they'll appear here.
            </p>
          </div>
        } @else {
          <div class="flex flex-col gap-2">
            @for (item of bookings(); track item.id) {
              <app-booking-list-item
                [booking]="item"
                (clicked)="navigateToDetail($event)"
              />
            }
          </div>

          <!-- Pagination -->
          @if (totalCount() > pageSize) {
            <div class="flex items-center justify-between mt-6">
              <p class="text-sm text-gray-500">
                Showing {{ (currentPage() - 1) * pageSize + 1 }}–{{ Math.min(currentPage() * pageSize, totalCount()) }}
                of {{ totalCount() }}
              </p>
              <div class="flex gap-2">
                <button
                  type="button"
                  class="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  [disabled]="currentPage() === 1"
                  (click)="prevPage()"
                >
                  &larr; Prev
                </button>
                <button
                  type="button"
                  class="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  [disabled]="currentPage() * pageSize >= totalCount()"
                  (click)="nextPage()"
                >
                  Next &rarr;
                </button>
              </div>
            </div>
          }
        }
      </div>
    </div>
  `,
})
export class BookingsPageComponent implements OnInit {
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

  fromDate = '';
  toDate = '';
  searchQuery = '';

  private searchTimer: ReturnType<typeof setTimeout> | null = null;

  pendingCount = computed(() =>
    this.bookings().filter((b) => b.status === 'Pending').length
  );

  ngOnInit(): void {
    this.load();
  }

  setFilter(filter: FilterStatus): void {
    this.activeFilter.set(filter);
    this.currentPage.set(1);
    this.load();
  }

  onSearch(): void {
    if (this.searchTimer) clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => {
      this.currentPage.set(1);
      this.load();
    }, 350);
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
    this.bookingService
      .getProviderBookings({
        profileId: PLACEHOLDER_PROFILE_ID,
        status: status === 'All' ? undefined : status,
        from: this.fromDate || undefined,
        to: this.toDate || undefined,
        q: this.searchQuery || undefined,
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
