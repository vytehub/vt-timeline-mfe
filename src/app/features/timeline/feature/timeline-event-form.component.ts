import {
  Component,
  OnInit,
  inject,
  signal,
  computed,
  ChangeDetectionStrategy,
} from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
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
  imports: [RouterLink, FormsModule, ConflictWarningModalComponent],
  template: `
    <div class="flex flex-col min-h-screen bg-gray-50 p-6">
      <a routerLink="/timeline" class="text-sm text-indigo-600 hover:underline mb-4">&larr; Back to Timeline</a>

      <div class="max-w-lg w-full bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h1 class="text-lg font-semibold text-gray-900 mb-6">
          {{ isEditMode() ? 'Edit Event' : 'New Private Event' }}
        </h1>

        <!-- Error banner -->
        @if (error()) {
          <div class="mb-4 px-4 py-3 rounded-md bg-red-50 border border-red-200">
            <p class="text-sm text-red-700">{{ error() }}</p>
          </div>
        }

        <!-- Form -->
        <form class="flex flex-col gap-4" (ngSubmit)="onSubmit()">
          <!-- Title (optional) -->
          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium text-gray-700" for="event-title">
              Title <span class="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              id="event-title"
              type="text"
              class="px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="e.g. Team meeting"
              [(ngModel)]="title"
              name="title"
              maxlength="200"
            />
          </div>

          <!-- Start datetime -->
          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium text-gray-700" for="event-start">
              Start <span class="text-red-500">*</span>
            </label>
            <input
              id="event-start"
              type="datetime-local"
              class="px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              [(ngModel)]="startLocal"
              name="startLocal"
              required
            />
          </div>

          <!-- End datetime -->
          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium text-gray-700" for="event-end">
              End <span class="text-red-500">*</span>
            </label>
            <input
              id="event-end"
              type="datetime-local"
              class="px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              [(ngModel)]="endLocal"
              name="endLocal"
              required
            />
            @if (endBeforeStart()) {
              <p class="text-xs text-red-500 mt-0.5">End time must be after start time.</p>
            }
          </div>

          <!-- Notes -->
          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium text-gray-700" for="event-notes">
              Notes <span class="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              id="event-notes"
              class="px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              placeholder="Any additional notes..."
              rows="3"
              [(ngModel)]="notes"
              name="notes"
              maxlength="2000"
            ></textarea>
          </div>

          <!-- Actions row -->
          <div class="flex items-center justify-between pt-2">
            @if (isEditMode()) {
              <button
                type="button"
                class="px-4 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-md hover:bg-red-50 transition-colors"
                [disabled]="saving()"
                (click)="onDelete()"
              >Delete event</button>
            } @else {
              <span></span>
            }

            <div class="flex items-center gap-3">
              <a
                routerLink="/timeline"
                class="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >Cancel</a>
              <button
                type="submit"
                class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                [disabled]="saving() || !isFormValid()"
              >
                {{ saving() ? 'Saving...' : (isEditMode() ? 'Save changes' : 'Create event') }}
              </button>
            </div>
          </div>
        </form>
      </div>

      <!-- Delete confirmation modal -->
      @if (showDeleteConfirm()) {
        <div
          class="fixed inset-0 bg-black bg-opacity-40 z-40 flex items-center justify-center p-4"
          (click)="showDeleteConfirm.set(false)"
        >
          <div
            class="bg-white rounded-xl shadow-lg max-w-sm w-full z-50 p-6"
            (click)="$event.stopPropagation()"
          >
            <h2 class="text-base font-semibold text-gray-900 mb-2">Delete event?</h2>
            <p class="text-sm text-gray-500 mb-5">
              This will permanently remove
              @if (title) {
                <span class="font-medium text-gray-700">"{{ title }}"</span>
              } @else {
                this event
              }
              from your timeline.
            </p>
            <div class="flex gap-3 justify-end">
              <button
                type="button"
                class="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                (click)="showDeleteConfirm.set(false)"
              >Cancel</button>
              <button
                type="button"
                class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                [disabled]="saving()"
                (click)="confirmDelete()"
              >
                {{ saving() ? 'Deleting...' : 'Delete' }}
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Conflict warning modal -->
      @if (conflictWarning()) {
        <app-conflict-warning-modal
          [conflict]="conflictWarning()!"
          (keepBoth)="onConflictKeepBoth()"
          (cancel)="onConflictCancel()"
        />
      }
    </div>
  `,
})
export class TimelineEventFormComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private timelineService = inject(TimelineService);
  private timelineState = inject(TimelineStateService);

  // Form fields
  title = '';
  startLocal = '';
  endLocal = '';
  notes = '';

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
    if (!this.startLocal || !this.endLocal) return false;
    return new Date(this.endLocal) <= new Date(this.startLocal);
  });

  isFormValid = computed(() => {
    return (
      this.startLocal.length > 0 &&
      this.endLocal.length > 0 &&
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

    const payload = {
      start: new Date(this.startLocal).toISOString(),
      end: new Date(this.endLocal).toISOString(),
      title: this.title.trim() || null,
      notes: this.notes.trim() || null,
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
        this.title = found.title ?? '';
        this.startLocal = this.toLocalDatetimeInput(found.start);
        this.endLocal = this.toLocalDatetimeInput(found.end);
        this.notes = found.notes ?? '';
      },
      error: () => {
        this.error.set('Could not load event. Please try again.');
      },
    });
  }

  private applyEventToForm(event: TimelineEventItem): void {
    this.title = event.title ?? '';
    this.startLocal = this.toLocalDatetimeInput(event.start);
    this.endLocal = this.toLocalDatetimeInput(event.end);
    this.notes = event.notes ?? '';
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
