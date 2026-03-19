import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

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
  imports: [ReactiveFormsModule],
  templateUrl: './booking-action-modal.component.html',
  styleUrl: './booking-action-modal.component.scss',
})
export class BookingActionModalComponent {
  config = input.required<ModalConfig>();
  loading = input<boolean>(false);
  confirmed = output<string | undefined>();
  dismissed = output<void>();

  protected textareaControl = new FormControl('');

  protected confirmButtonClass(): string {
    return CONFIRM_BUTTON_CLASS[this.config().variant];
  }

  onConfirm(): void {
    this.confirmed.emit(this.textareaControl.value || undefined);
  }

  onDismiss(): void {
    this.dismissed.emit();
  }
}
