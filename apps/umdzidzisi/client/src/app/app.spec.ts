import { ComponentFixture, TestBed } from '@angular/core/testing';
import AppComponent from './app';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
    }).compileComponents();
  });

  it('should create the app', async () => {
    const fixture: ComponentFixture<typeof AppComponent> =
      TestBed.createComponent(AppComponent);
    await fixture.whenStable();
    const app: typeof AppComponent = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});
