import { Routes } from '@angular/router';

export const TIMELINE_MFE_ROUTES: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'timeline',
  },
  {
    path: 'timeline',
    loadComponent: () =>
      import('./features/timeline/feature/timeline-page.component').then(
        (m) => m.TimelinePageComponent
      ),
  },
  {
    path: 'timeline/events/new',
    loadComponent: () =>
      import('./features/timeline/feature/timeline-event-form.component').then(
        (m) => m.TimelineEventFormComponent
      ),
  },
  {
    path: 'timeline/events/:id',
    loadComponent: () =>
      import('./features/timeline/feature/timeline-event-form.component').then(
        (m) => m.TimelineEventFormComponent
      ),
  },
  {
    path: 'timeline/rules',
    loadComponent: () =>
      import('./features/timeline/feature/conflict-rules-page.component').then(
        (m) => m.ConflictRulesPageComponent
      ),
  },
  {
    path: 'timeline/rules/new',
    loadComponent: () =>
      import('./features/timeline/feature/conflict-rule-form.component').then(
        (m) => m.ConflictRuleFormComponent
      ),
  },
];
