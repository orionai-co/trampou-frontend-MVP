import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SimpleChange } from '@angular/core';
import { MatchBreakdownComponent } from '../../src/app/features/opportunities/components/match-breakdown/match-breakdown.component';
import { MatchBreakdownData } from '../../src/app/core/models/match-breakdown.model';

describe('MatchBreakdownComponent', () => {
  let component: MatchBreakdownComponent;
  let fixture: ComponentFixture<MatchBreakdownComponent>;

  const mockData: MatchBreakdownData = {
    jobTitleOrCompanyName: 'Garçom de Eventos & Salão',
    totalMatchScore: 98,
    summaryHeadline: 'Altíssima compatibilidade com seu perfil operacional',
    criteria: [
      {
        id: 'proximity',
        label: 'Localização & Proximidade',
        description: 'Vaga a 2.4 km (Vila Olímpia) — dentro do seu raio ideal de 5 km.',
        scorePercentage: 100,
        status: 'perfect',
        icon: 'map-pin'
      },
      {
        id: 'category',
        label: 'Categoria & Habilidades',
        description: 'Você possui habilidades ativas para o setor de Gastronomia.',
        scorePercentage: 100,
        status: 'perfect',
        icon: 'briefcase'
      },
      {
        id: 'level',
        label: 'Nível de Experiência',
        description: 'Exige Nível 2. Você é Nível 2 — Experiente.',
        scorePercentage: 95,
        status: 'perfect',
        icon: 'award'
      },
      {
        id: 'punctuality',
        label: 'Pontualidade & Confiabilidade',
        description: 'Sua taxa de 100% de pontualidade atende aos requisitos.',
        scorePercentage: 100,
        status: 'perfect',
        icon: 'clock'
      }
    ],
    isSponsored: false
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatchBreakdownComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(MatchBreakdownComponent);
    component = fixture.componentInstance;
    component.isOpen = true;
    component.data = { ...mockData };
    fixture.detectChanges();
  });

  afterEach(() => {
    document.body.classList.remove('tp-no-scroll');
  });

  it('should create the MatchBreakdownComponent', () => {
    expect(component).toBeTruthy();
  });

  it('should render total match score badge, title and target name', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.textContent).toContain('✦ 98% Match');
    expect(compiled.textContent).toContain('Por que esta vaga combina com você?');
    expect(compiled.textContent).toContain('Garçom de Eventos & Salão');
    expect(compiled.textContent).toContain('Altíssima compatibilidade com seu perfil operacional');
  });

  it('should render all 4 evaluation pillars with label, description and scores', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.textContent).toContain('Localização & Proximidade');
    expect(compiled.textContent).toContain('Vaga a 2.4 km (Vila Olímpia)');
    expect(compiled.textContent).toContain('Categoria & Habilidades');
    expect(compiled.textContent).toContain('Nível de Experiência');
    expect(compiled.textContent).toContain('Pontualidade & Confiabilidade');

    const items = compiled.querySelectorAll('.tp-match-criterion-item');
    expect(items.length).toBe(4);
  });

  it('should render institutional neutrality and transparency notice', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.textContent).toContain('Transparência & Neutralidade Algorítmica');
    expect(compiled.textContent).toContain('O Match do TRAMPOU é 100% neutro');
    expect(compiled.textContent).toContain('Patrocínios e destaques não influenciam esta pontuação');
  });

  it('should add and remove tp-no-scroll class on document body when open and closed', () => {
    expect(document.body.classList.contains('tp-no-scroll')).toBeTrue();

    component.isOpen = false;
    component.ngOnChanges({
      isOpen: new SimpleChange(true, false, false)
    });
    expect(document.body.classList.contains('tp-no-scroll')).toBeFalse();

    component.isOpen = true;
    component.ngOnChanges({
      isOpen: new SimpleChange(false, true, false)
    });
    expect(document.body.classList.contains('tp-no-scroll')).toBeTrue();

    component.ngOnDestroy();
    expect(document.body.classList.contains('tp-no-scroll')).toBeFalse();
  });

  it('should emit closeModal and closed event when clicking close button and unlock scroll', () => {
    spyOn(component.closed, 'emit');
    spyOn(component.closeModal, 'emit');

    const closeBtn = fixture.nativeElement.querySelector('.tp-match-close-btn') as HTMLButtonElement;
    expect(closeBtn).toBeTruthy();
    closeBtn.click();

    expect(component.closed.emit).toHaveBeenCalled();
    expect(component.closeModal.emit).toHaveBeenCalled();
    expect(document.body.classList.contains('tp-no-scroll')).toBeFalse();
  });

  it('should emit closeModal and closed event when clicking backdrop overlay', () => {
    spyOn(component.closed, 'emit');
    spyOn(component.closeModal, 'emit');

    const overlay = fixture.nativeElement.querySelector('.tp-match-overlay') as HTMLElement;
    expect(overlay).toBeTruthy();
    overlay.click();

    expect(component.closed.emit).toHaveBeenCalled();
    expect(component.closeModal.emit).toHaveBeenCalled();
  });
});
