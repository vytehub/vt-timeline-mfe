import {
  Component,
  OnInit,
  inject,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { TimelineService } from '../data-access/timeline.service';
import { ConflictRuleResponse } from '../data-access/models/timeline.model';

@Component({
  selector: 'app-conflict-rules-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <div class="flex flex-col min-h-screen bg-gray-50 p-6">
      <div class="flex items-center justify-between mb-6">
        <div>
          <a routerLink="/timeline" class="text-sm text-indigo-600 hover:underline">&larr; Timeline</a>
          <h1 class="text-xl font-semibold text-gray-900 mt-2">Conflict Rules</h1>
        </div>
        <a
          routerLink="/timeline/rules/new"
          class="px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
        >+ Add Rule</a>
      </div>

      @if (loading()) {
        <p class="text-sm text-gray-400">Loading rules...</p>
      } @else if (rules().length === 0) {
        <div class="flex flex-col items-center justify-center py-20 gap-3">
          <p class="text-gray-500 text-base">No conflict rules configured.</p>
          <p class="text-gray-400 text-sm">Add a rule to detect scheduling conflicts with another timeline.</p>
          <a
            routerLink="/timeline/rules/new"
            class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
          >Add Rule</a>
        </div>
      } @else {
        <ul class="flex flex-col gap-3">
          @for (rule of rules(); track rule.id) {
            <li class="bg-white rounded-xl border border-gray-200 px-5 py-4 flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-900">{{ rule.sourceTimelineId }}</p>
                <p class="text-xs text-gray-400 mt-0.5">Action: {{ rule.action }}</p>
              </div>
            </li>
          }
        </ul>
      }
    </div>
  `,
})
export class ConflictRulesPageComponent implements OnInit {
  private timelineService = inject(TimelineService);

  loading = signal(false);
  rules = signal<ConflictRuleResponse[]>([]);

  ngOnInit(): void {
    // NEEDS-CLARIFICATION: The backend endpoint GET /timelines/{timelineId}/conflict-rules
    // requires a timelineId. There is no endpoint yet to get the current user's timelineId.
    // This page needs either:
    //   1. A GET /timelines/me endpoint that returns the user's timeline (with its ID), or
    //   2. The timelineId passed via route param from the timeline page.
  }
}
