import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-conflict-rule-form',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  templateUrl: './conflict-rule-form.component.html',
  styleUrl: './conflict-rule-form.component.scss',
})
export class ConflictRuleFormComponent {}
