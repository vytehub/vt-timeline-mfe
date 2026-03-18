import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
} from '@angular/core';

export interface ConflictWarning {
  overlappingBookingDate: string;
  eventTitle: string | null;
}

@Component({
  selector: 'app-conflict-warning-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Backdrop -->
    <div
      class="fixed inset-0 bg-black bg-opacity-40 z-40 flex items-center justify-center p-4"
      (click)="onCancel()"
    >
      <!-- Modal panel — stop propagation so clicking inside doesn't close -->
      <div
        class="bg-white rounded-xl shadow-lg max-w-md w-full z-50 p-6"
        (click)="$event.stopPropagation()"
      >
        <!-- Icon + Title -->
        <div class="flex items-start gap-3 mb-4">
          <div class="flex-shrink-0 mt-0.5">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6 text-yellow-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
              />
            </svg>
          </div>
          <div>
            <h2 class="text-base font-semibold text-gray-900">Scheduling conflict detected</h2>
            <p class="text-sm text-gray-500 mt-1">
              @if (conflict().eventTitle) {
                <span class="font-medium text-gray-700">"{{ conflict().eventTitle }}"</span> overlaps
              } @else {
                This event overlaps
              }
              with a booking on
              <span class="font-medium text-gray-700">{{ conflict().overlappingBookingDate }}</span>.
            </p>
          </div>
        </div>

        <p class="text-sm text-gray-500 mb-5">
          What would you like to do? Full conflict resolution (cancel or reschedule the booking) will be available in a future update.
        </p>

        <!-- Actions -->
        <div class="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
          <button
            type="button"
            class="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            (click)="onCancel()"
          >Cancel event</button>
          <button
            type="button"
            class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors"
            (click)="onKeepBoth()"
          >Keep both</button>
        </div>
      </div>
    </div>
  `,
})
export class ConflictWarningModalComponent {
  conflict = input.required<ConflictWarning>();
  keepBoth = output<void>();
  cancel = output<void>();

  onKeepBoth(): void {
    this.keepBoth.emit();
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
