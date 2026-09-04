import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TpBadgeComponent } from '../../src/app/shared/components/badge/badge.component';

describe('TpBadgeComponent', () => {
  let component: TpBadgeComponent;
  let fixture: ComponentFixture<TpBadgeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TpBadgeComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TpBadgeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the badge component', () => {
    expect(component).toBeTruthy();
  });

  it('should apply correct variant class', () => {
    fixture.componentRef.setInput('variant', 'success');
    fixture.detectChanges();
    const badgeElement = fixture.nativeElement.querySelector('.tp-badge');
    expect(badgeElement.classList.contains('tp-badge-success')).toBeTrue();
  });

  it('should render dot when dot is true', () => {
    fixture.componentRef.setInput('dot', true);
    fixture.detectChanges();
    const dotElement = fixture.nativeElement.querySelector('.tp-badge-dot');
    expect(dotElement).toBeTruthy();
  });
});
