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
  templateUrl: './conflict-rules-page.component.html',
  styleUrl: './conflict-rules-page.component.scss',
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
