import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { OpportunityDetailsModalComponent } from '../../src/app/features/opportunities/components/opportunity-details-modal/opportunity-details-modal.component';
import { UserProfileService } from '../../src/app/core/services/user-profile.service';
import { Opportunity } from '../../src/app/features/opportunities/models/opportunity.model';

describe('OpportunityDetailsModalComponent', () => {
  let component: OpportunityDetailsModalComponent;
  let fixture: ComponentFixture<OpportunityDetailsModalComponent>;
  let router: Router;
  let userProfileService: UserProfileService;

  const mockOpportunity: Opportunity = {
    id: 'opp-test-1',
    title: 'Garçom de Salão para Evento Corporativo',
    companyName: 'Buffet Fasano SP',
    companyRating: 4.9,
    companyReviewsCount: 38,
    category: 'Gastronomia',
    location: {
      address: 'Rua Funchal, 418',
      neighborhood: 'Vila Olímpia',
      city: 'São Paulo',
      distanceKm: 2.4
    },
    date: 'Hoje, 24 de Agosto',
    isToday: true,
    schedule: {
      start: '18:00',
      end: '01:00',
      totalHours: 7
    },
    payment: {
      amount: 180,
      type: 'diaria',
      pixImmediate: true
    },
    status: 'urgency',
    matchPercentage: 96,
    requiredLevel: 2,
    spotsAvailable: 3,
    spotsTotal: 5,
    description: 'Atendimento de mesas em coquetel corporativo formal, servindo canapés e bebidas com bandeja.',
    requirements: [
      'Camisa Social Preta',
      'Calça Social Preta',
      'Sapato Social Preto'
    ],
    applied: false
  };

  beforeEach(async () => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [OpportunityDetailsModalComponent],
      providers: [
        UserProfileService,
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(OpportunityDetailsModalComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    userProfileService = TestBed.inject(UserProfileService);

    component.isOpen = true;
    component.opportunity = { ...mockOpportunity };
    fixture.detectChanges();
  });

  it('should create the OpportunityDetailsModalComponent', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize at Step 1 with O Trampo, Data e Remuneração', () => {
    expect(component.currentStep()).toBe(1);
    expect(component.modalTitle).toBe(mockOpportunity.title);
    expect(component.modalSubtitle).toContain('Buffet Fasano SP');
    expect(component.modalSubtitle).toContain('Vila Olímpia');

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('180');
    expect(compiled.textContent).toContain('PIX Garantido no término');
    expect(compiled.textContent).toContain('Rua Funchal, 418');
    expect(compiled.textContent).toContain('18:00 às 01:00');
    expect(compiled.textContent).toContain('7h de serviço');
    expect(compiled.textContent).toContain('2.4 km');
  });

  it('should navigate from Step 1 to Step 2 (Atividades & Traje Exigido) and back', () => {
    expect(component.currentStep()).toBe(1);

    // Avançar para Etapa 2
    component.goToStep(2);
    fixture.detectChanges();
    expect(component.currentStep()).toBe(2);
    expect(component.modalTitle).toBe('Atividades & Traje Exigido');

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('O que você irá fazer');
    expect(compiled.textContent).toContain('Atendimento de mesas em coquetel corporativo formal');
    expect(compiled.textContent).toContain('Camisa Social Preta');
    expect(compiled.textContent).toContain('Calça Social Preta');
    expect(compiled.textContent).toContain('Sapato Social Preto');
    expect(compiled.textContent).toContain('17h45');

    // Voltar para Etapa 1
    component.goToStep(1);
    fixture.detectChanges();
    expect(component.currentStep()).toBe(1);
  });

  it('should navigate from Step 2 to Step 3 (Compromisso & Confirmação PIX) and validate checklist', () => {
    component.goToStep(3);
    fixture.detectChanges();

    expect(component.currentStep()).toBe(3);
    expect(component.modalTitle).toBe('Compromisso & Chave PIX');

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Checklist de Prontidão');
    expect(compiled.textContent).toContain('Chave PIX de Recebimento');
    expect(compiled.textContent).toContain(userProfileService.name());
    expect(compiled.textContent).toContain(userProfileService.pixKey());

    // Validar checklist
    expect(component.isChecklistComplete()).toBeTrue();

    // Desmarcar disponibilidade
    component.checkAvailability.set(false);
    expect(component.isChecklistComplete()).toBeFalse();

    // Re-marcar disponibilidade e desmarcar traje
    component.checkAvailability.set(true);
    component.checkAttire.set(false);
    expect(component.isChecklistComplete()).toBeFalse();

    // Re-marcar traje
    component.checkAttire.set(true);
    expect(component.isChecklistComplete()).toBeTrue();
  });

  it('should confirm apply in Step 3 and transition to Step 4 (Candidatura Enviada com Sucesso)', fakeAsync(() => {
    spyOn(component.applied, 'emit');

    component.goToStep(3);
    fixture.detectChanges();

    component.onConfirmApply();
    expect(component.isSubmitting()).toBeTrue();

    tick(400);
    fixture.detectChanges();

    expect(component.isSubmitting()).toBeFalse();
    expect(component.applied.emit).toHaveBeenCalledWith(jasmine.objectContaining({
      id: 'opp-test-1',
      title: mockOpportunity.title
    }));
    expect(component.currentStep()).toBe(4);
    expect(component.modalTitle).toBe('Candidatura Enviada!');

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Candidatura enviada para Buffet Fasano SP!');
    expect(compiled.textContent).toContain('A empresa avaliará a rodada de seleção em até 20 minutos');
    expect(compiled.textContent).toContain('R$ 180 via PIX');
  }));

  it('should navigate to /meus-trabalhos with pending tab when clicking tracking button in Step 4', () => {
    spyOn(component.closed, 'emit');

    component.goToStep(4);
    fixture.detectChanges();

    component.onNavigateToMyJobs();

    expect(component.closed.emit).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/meus-trabalhos'], {
      queryParams: { tab: 'pending' }
    });
  });

  it('should close modal and emit closed event on onClose', () => {
    spyOn(component.closed, 'emit');

    component.onClose();
    expect(component.closed.emit).toHaveBeenCalled();
  });
});
