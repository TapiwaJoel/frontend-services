import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UtilEventBus } from './util-event-bus';

describe('UtilEventBus', () => {
  let component: UtilEventBus;
  let fixture: ComponentFixture<UtilEventBus>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UtilEventBus],
    }).compileComponents();

    fixture = TestBed.createComponent(UtilEventBus);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
