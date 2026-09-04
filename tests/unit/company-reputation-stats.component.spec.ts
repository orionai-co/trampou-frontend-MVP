import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CompanyReputationStatsComponent } from '../../src/app/features/company-profile/components/company-reputation-stats/company-reputation-stats.component';
import { CompanyReputationMetrics } from '../../src/app/features/company-profile/models/company-profile.model';

describe('CompanyReputationStatsComponent', () => {
  let component: CompanyReputationStatsComponent;
  let fixture: ComponentFixture<CompanyReputationStatsComponent>;

  const mockReputation: CompanyReputationMetrics = {
    averageRating: 4.87,
    totalReviews: 84,
    onTimePaymentRate: 100,
    rehireReturnRate: 96,
    totalCompletedShifts: 1284,
    cancellationRate: 0
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompanyReputationStatsComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(CompanyReputationStatsComponent);
    component = fixture.componentInstance;
    component.reputation = { ...mockReputation };
    fixture.detectChanges();
  });

  it('should create the CompanyReputationStatsComponent', () => {
    expect(component).toBeTruthy();
  });

  it('should render all 4 reputation metrics with correct values', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    // 1. Avaliação Média
    expect(compiled.textContent).toContain('4.87');
    expect(compiled.textContent).toContain('84 avaliações de freelancers');

    // 2. Repasses PIX
    expect(compiled.textContent).toContain('100%');
    expect(compiled.textContent).toContain('No prazo ao término do turno');

    // 3. Taxa de Retorno
    expect(compiled.textContent).toContain('96%');
    expect(compiled.textContent).toContain('Profissionais que voltariam');

    // 4. Turnos Cumpridos
    expect(compiled.textContent).toContain('1.284');
    expect(compiled.textContent).toContain('Histórico comprovado na plataforma');
  });

  it('should render verified data tag', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Dados Auditados via PIX');
  });
});
