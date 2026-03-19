import {
  Component,
  OnInit,
  inject,
  signal,
  computed,
  ChangeDetectionStrategy,
} from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TimelineService } from '../data-access/timeline.service';
import { TimelineStateService } from '../data-access/timeline-state.service';
import { TimelineEventItem } from '../data-access/models/timeline.model';
import {
  ConflictWarningModalComponent,
  ConflictWarning,
} from '../ui/conflict-warning-modal.component';

@Component({
  selector: 'app-timeline-event-form',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, ReactiveFormsModule, ConflictWarningModalComponent],
  templateUrl: './timeline-event-form.component.html',
  styleUrl: './timeline-event-form.component.scss',
})
export class TimelineEventFormComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private timelineService = inject(TimelineService);
  private timelineState = inject(TimelineStateService);

  form: FormGroup = this.fb.group({
    title: [''],
    startLocal: ['', [Validators.required]],
    endLocal: ['', [Validators.required]],
    notes: [''],
  });

  // Component state
  saving = signal(false);
  error = signal<string | null>(null);
  showDeleteConfirm = signal(false);
  conflictWarning = signal<ConflictWarning | null>(null);

  isEditMode = signal(false);
  private eventId: string | null = null;
  private existingEvent: TimelineEventItem | null = null;
  private pendingCreatedEventId: string | null = null;

  endBeforeStart = computed(() => {
    const startLocal = this.form.controls['startLocal'].value as string;
    const endLocal = this.form.controls['endLocal'].value as string;
    if (!startLocal || !endLocal) return false;
    return new Date(endLocal) <= new Date(startLocal);
  });

  isFormValid = computed(() => {
    const startLocal = this.form.controls['startLocal'].value as string;
    const endLocal = this.form.controls['endLocal'].value as string;
    return (
      startLocal.length > 0 &&
      endLocal.length > 0 &&
      !this.endBeforeStart()
    );
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.eventId = id;
      this.loadExistingEvent();
    }
  }

  onSubmit(): void {
    if (!this.isFormValid()) return;

    const timelineId = this.timelineState.timelineId();
    if (!timelineId) {
      this.error.set('Timeline not loaded. Please go back to the timeline and try again.');
      return;
    }

    this.saving.set(true);
    this.error.set(null);

    const { title, startLocal, endLocal, notes } = this.form.getRawValue();

    const payload = {
      start: new Date(startLocal).toISOString(),
      end: new Date(endLocal).toISOString(),
      title: (title as string).trim() || null,
      notes: (notes as string).trim() || null,
    };

    if (this.isEditMode() && this.eventId) {
      this.timelineService.updateEvent(timelineId, this.eventId, payload).subscribe({
        next: () => {
          this.saving.set(false);
          this.router.navigate(['/timeline']);
        },
        error: (err) => {
          this.saving.set(false);
          this.handleApiError(err);
        },
      });
    } else {
      this.timelineService.createEvent(timelineId, payload).subscribe({
        next: (createdId) => {
          this.saving.set(false);
          this.pendingCreatedEventId = createdId;
          // Check for conflicts — the backend returns 200 OK even when there's a conflict.
          // Slice 3: the response does not yet contain conflict data from the backend.
          // When the backend adds conflict info to the response, read it here.
          // For now, navigate back to timeline on success.
          this.router.navigate(['/timeline']);
        },
        error: (err) => {
          this.saving.set(false);
          this.handleApiError(err);
        },
      });
    }
  }

  onDelete(): void {
    this.showDeleteConfirm.set(true);
  }

  confirmDelete(): void {
    const timelineId = this.timelineState.timelineId();
    if (!timelineId || !this.eventId) {
      this.error.set('Cannot delete: timeline or event not found.');
      this.showDeleteConfirm.set(false);
      return;
    }

    this.saving.set(true);
    this.showDeleteConfirm.set(false);

    this.timelineService.deleteEvent(timelineId, this.eventId).subscribe({
      next: () => {
        this.saving.set(false);
        this.router.navigate(['/timeline']);
      },
      error: (err) => {
        this.saving.set(false);
        this.handleApiError(err);
      },
    });
  }

  onConflictKeepBoth(): void {
    // User chose to keep both — the event was already created.
    this.conflictWarning.set(null);
    this.router.navigate(['/timeline']);
  }

  onConflictCancel(): void {
    // User chose to cancel — delete the event that was just created.
    const timelineId = this.timelineState.timelineId();
    if (timelineId && this.pendingCreatedEventId) {
      this.timelineService.deleteEvent(timelineId, this.pendingCreatedEventId).subscribe({
        next: () => {
          this.conflictWarning.set(null);
          this.router.navigate(['/timeline']);
        },
        error: () => {
          // If delete fails, just navigate away.
          this.conflictWarning.set(null);
          this.router.navigate(['/timeline']);
        },
      });
    } else {
      this.conflictWarning.set(null);
      this.router.navigate(['/timeline']);
    }
  }

  private loadExistingEvent(): void {
    // Try to get event data from navigation state first (passed from timeline page click).
    const nav = this.router.getCurrentNavigation();
    const stateEvent = nav?.extras?.state?.['event'] as TimelineEventItem | undefined;

    if (stateEvent) {
      this.applyEventToForm(stateEvent);
      this.existingEvent = stateEvent;
      return;
    }

    // If navigated directly by URL (no state), load the private events list and find the event.
    // This requires the timelineId to be set in the state service.
    const timelineId = this.timelineState.timelineId();
    if (!timelineId) {
      // Cannot load without timelineId — redirect to timeline to bootstrap state.
      this.error.set('Session expired. Redirecting to timeline...');
      setTimeout(() => this.router.navigate(['/timeline']), 1500);
      return;
    }

    this.timelineService.getPrivateEvents(timelineId).subscribe({
      next: (response) => {
        const found = response.events.find((e) => e.id === this.eventId);
        if (!found) {
          this.error.set('Event not found.');
          return;
        }
        // PrivateEventItem doesn't have isPrivate/sourceType but we only need form fields.
        this.form.patchValue({
          title: found.title ?? '',
          startLocal: this.toLocalDatetimeInput(found.start),
          endLocal: this.toLocalDatetimeInput(found.end),
          notes: found.notes ?? '',
        });
      },
      error: () => {
        this.error.set('Could not load event. Please try again.');
      },
    });
  }

  private applyEventToForm(event: TimelineEventItem): void {
    this.form.patchValue({
      title: event.title ?? '',
      startLocal: this.toLocalDatetimeInput(event.start),
      endLocal: this.toLocalDatetimeInput(event.end),
      notes: event.notes ?? '',
    });
  }

  private toLocalDatetimeInput(iso: string): string {
    // Convert ISO string to "YYYY-MM-DDTHH:mm" format for datetime-local input.
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  private handleApiError(err: { status?: number }): void {
    if (err.status === 404) {
      this.error.set('Event not found.');
    } else if (err.status === 400) {
      this.error.set('Invalid event data. Please check the form and try again.');
    } else {
      this.error.set('An error occurred. Please try again.');
    }
  }
}
