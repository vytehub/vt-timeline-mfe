import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ConflictRuleFormComponent } from './conflict-rule-form.component';

describe('ConflictRuleFormComponent', () => {
  it('should create', () => {
    const fixture = TestBed.configureTestingModule({
      imports: [ConflictRuleFormComponent, RouterTestingModule],
    }).createComponent(ConflictRuleFormComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
