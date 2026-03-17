import { Routes } from '@angular/router';

export const TIMELINE_MFE_ROUTES: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () =>
      import('./features/timeline/feature/timeline-page.component').then(
        (m) => m.TimelinePageComponent
      ),
  },
  {
    path: 'events/new',
    loadComponent: () =>
      import('./features/timeline/feature/timeline-event-form.component').then(
        (m) => m.TimelineEventFormComponent
      ),
  },
  {
    path: 'events/:id',
    loadComponent: () =>
      import('./features/timeline/feature/timeline-event-form.component').then(
        (m) => m.TimelineEventFormComponent
      ),
  },
  {
    path: 'rules',
    loadComponent: () =>
      import('./features/timeline/feature/conflict-rules-page.component').then(
        (m) => m.ConflictRulesPageComponent
      ),
  },
  {
    path: 'rules/new',
    loadComponent: () =>
      import('./features/timeline/feature/conflict-rule-form.component').then(
        (m) => m.ConflictRuleFormComponent
      ),
  },
];
