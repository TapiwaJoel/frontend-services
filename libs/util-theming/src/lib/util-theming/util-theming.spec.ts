import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UtilTheming } from './util-theming';

describe('UtilTheming', () => {
  let component: UtilTheming;
  let fixture: ComponentFixture<UtilTheming>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UtilTheming],
    }).compileComponents();

    fixture = TestBed.createComponent(UtilTheming);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
