import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-timeline-event-form',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <div class="flex flex-col min-h-screen bg-gray-50 p-6">
      <a routerLink="/timeline" class="text-sm text-indigo-600 hover:underline mb-4">&larr; Back to Timeline</a>
      <div class="max-w-lg w-full bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h1 class="text-lg font-semibold text-gray-900 mb-4">Private Event</h1>
        <p class="text-sm text-gray-500">Event form — coming in Slice 2.</p>
      </div>
    </div>
  `,
})
export class TimelineEventFormComponent {}
