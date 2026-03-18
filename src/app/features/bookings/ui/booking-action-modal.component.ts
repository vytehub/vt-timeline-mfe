import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

export type ModalVariant = 'confirm' | 'reject' | 'complete' | 'no-show' | 'cancel';

export interface ModalConfig {
  variant: ModalVariant;
  title: string;
  message: string;
  confirmLabel: string;
  /** Whether to show an optional reason/message textarea */
  showTextarea?: boolean;
  textareaLabel?: string;
  textareaPlaceholder?: string;
}

const CONFIRM_BUTTON_CLASS: Record<ModalVariant, string> = {
  confirm: 'bg-green-600 hover:bg-green-700 text-white',
  reject: 'bg-red-600 hover:bg-red-700 text-white',
  complete: 'bg-blue-600 hover:bg-blue-700 text-white',
  'no-show': 'bg-amber-600 hover:bg-amber-700 text-white',
  cancel: 'bg-red-600 hover:bg-red-700 text-white',
};

@Component({
  selector: 'app-booking-action-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  template: `
    <!-- Backdrop -->
    <div
      class="fixed inset-0 bg-black bg-opacity-40 z-40 flex items-center justify-center p-4"
      (click)="onDismiss()"
    >
      <!-- Modal panel -->
      <div
        class="bg-white rounded-xl shadow-lg max-w-md w-full z-50 p-6"
        (click)="$event.stopPropagation()"
      >
        <!-- Icon + Title -->
        <div class="flex items-start gap-3 mb-4">
          <div class="flex-shrink-0 mt-0.5">
            @switch (config().variant) {
              @case ('confirm') {
                <svg class="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
              }
              @case ('complete') {
                <svg class="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
              }
              @case ('no-show') {
                <svg class="h-6 w-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                </svg>
              }
              @default {
                <svg class="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                </svg>
              }
            }
          </div>
          <div>
            <h2 class="text-base font-semibold text-gray-900">{{ config().title }}</h2>
            <p class="text-sm text-gray-500 mt-1">{{ config().message }}</p>
          </div>
        </div>

        <!-- Optional textarea -->
        @if (config().showTextarea) {
          <div class="mb-4">
            @if (config().textareaLabel) {
              <label class="block text-xs font-medium text-gray-700 mb-1">
                {{ config().textareaLabel }}
              </label>
            }
            <textarea
              class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              rows="3"
              [placeholder]="config().textareaPlaceholder ?? ''"
              [(ngModel)]="textareaValue"
            ></textarea>
          </div>
        }

        <!-- Actions -->
        <div class="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end mt-2">
          <button
            type="button"
            class="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            [disabled]="loading()"
            (click)="onDismiss()"
          >
            Cancel
          </button>
          <button
            type="button"
            class="px-4 py-2 text-sm font-medium rounded-md transition-colors disabled:opacity-50 {{ confirmButtonClass() }}"
            [disabled]="loading()"
            (click)="onConfirm()"
          >
            {{ loading() ? 'Saving...' : config().confirmLabel }}
          </button>
        </div>
      </div>
    </div>
  `,
})
export class BookingActionModalComponent {
  config = input.required<ModalConfig>();
  loading = input<boolean>(false);
  confirmed = output<string | undefined>();
  dismissed = output<void>();

  protected textareaValue = '';

  protected confirmButtonClass(): string {
    return CONFIRM_BUTTON_CLASS[this.config().variant];
  }

  onConfirm(): void {
    this.confirmed.emit(this.textareaValue || undefined);
  }

  onDismiss(): void {
    this.dismissed.emit();
  }
}
