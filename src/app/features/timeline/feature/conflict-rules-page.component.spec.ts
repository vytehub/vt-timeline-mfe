import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ConflictRulesPageComponent } from './conflict-rules-page.component';

describe('ConflictRulesPageComponent', () => {
  it('should create', () => {
    const fixture = TestBed.configureTestingModule({
      imports: [ConflictRulesPageComponent, RouterTestingModule, HttpClientTestingModule],
    }).createComponent(ConflictRulesPageComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
