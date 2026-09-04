import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HeroBannerComponent } from '../../src/app/features/opportunities/components/hero-banner/hero-banner.component';

describe('HeroBannerComponent', () => {
  let component: HeroBannerComponent;
  let fixture: ComponentFixture<HeroBannerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeroBannerComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(HeroBannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the hero banner component', () => {
    expect(component).toBeTruthy();
  });

  it('should render the location badge', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const badge = compiled.querySelector('.tp-hero-badge');
    expect(badge).toBeTruthy();
    expect(badge?.textContent).toContain('Oportunidades na sua região');
  });

  it('should render the headline and subtitle', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const title = compiled.querySelector('.tp-hero-title');
    const subtitle = compiled.querySelector('.tp-hero-subtitle');

    expect(title?.textContent).toContain('Trabalhos rápidos com pagamento no mesmo dia.');
    expect(subtitle?.textContent).toContain('Turnos sob demanda com repasse garantido via PIX.');
  });

  it('should render all 3 key metrics', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const metrics = compiled.querySelectorAll('.tp-stat-item');
    expect(metrics.length).toBe(3);

    expect(metrics[0].textContent).toContain('1.200+');
    expect(metrics[0].textContent).toContain('Turnos concluídos');

    expect(metrics[1].textContent).toContain('R$ 98k+');
    expect(metrics[1].textContent).toContain('Repassados via PIX');

    expect(metrics[2].textContent).toContain('~1h');
    expect(metrics[2].textContent).toContain('Confirmação média');
  });
});

