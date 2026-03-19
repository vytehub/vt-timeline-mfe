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
  templateUrl: './conflict-warning-modal.component.html',
  styleUrl: './conflict-warning-modal.component.scss',
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
