import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TpButtonComponent } from '../../src/app/shared/components/button/button.component';

describe('TpButtonComponent', () => {
  let component: TpButtonComponent;
  let fixture: ComponentFixture<TpButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TpButtonComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TpButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the button component', () => {
    expect(component).toBeTruthy();
  });

  it('should emit btnClick event on click when enabled and not loading', () => {
    spyOn(component.btnClick, 'emit');
    const buttonElement = fixture.nativeElement.querySelector('button');
    buttonElement.click();
    expect(component.btnClick.emit).toHaveBeenCalled();
  });

  it('should not emit btnClick event when disabled', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    spyOn(component.btnClick, 'emit');
    const buttonElement = fixture.nativeElement.querySelector('button');
    buttonElement.click();
    expect(component.btnClick.emit).not.toHaveBeenCalled();
  });

  it('should render loading spinner when loading is true', () => {
    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();
    const spinner = fixture.nativeElement.querySelector('tp-spinner');
    expect(spinner).toBeTruthy();
  });
});
