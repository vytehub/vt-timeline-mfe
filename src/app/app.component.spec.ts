import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  it('should create', () => {
    const fixture = TestBed.configureTestingModule({
      imports: [AppComponent, RouterTestingModule],
    }).createComponent(AppComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
