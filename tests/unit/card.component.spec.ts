import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TpCardComponent } from '../../src/app/shared/components/card/card.component';

describe('TpCardComponent', () => {
  let component: TpCardComponent;
  let fixture: ComponentFixture<TpCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TpCardComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TpCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the card component', () => {
    expect(component).toBeTruthy();
  });

  it('should emit cardClick event on click when interactive is true', () => {
    component.interactive = true;
    fixture.detectChanges();
    spyOn(component.cardClick, 'emit');
    const cardElement = fixture.nativeElement.querySelector('.tp-card');
    cardElement.click();
    expect(component.cardClick.emit).toHaveBeenCalled();
  });

  it('should not emit cardClick event on click when interactive is false', () => {
    component.interactive = false;
    fixture.detectChanges();
    spyOn(component.cardClick, 'emit');
    const cardElement = fixture.nativeElement.querySelector('.tp-card');
    cardElement.click();
    expect(component.cardClick.emit).not.toHaveBeenCalled();
  });
});
