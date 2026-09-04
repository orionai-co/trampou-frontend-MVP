import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CandidateProfileModalComponent } from '../../src/app/shared/components/candidate-profile-modal/candidate-profile-modal.component';
import { Candidate, CompanyJob } from '../../src/app/features/company/models/company-job.model';

describe('CandidateProfileModalComponent', () => {
  let component: CandidateProfileModalComponent;
  let fixture: ComponentFixture<CandidateProfileModalComponent>;

  const mockCandidate: Candidate = {
    id: 'cand-profile-1',
    name: 'Lucas Mendes',
    avatarInitials: 'LM',
    level: 2,
    rating: 4.9,
    reviewsCount: 38,
    matchPercentage: 98,
    punctualityRate: 100,
    pixKeyPreview: '***.391.842-**',
    status: 'applied',
    bio: 'Garçom de Salão e Eventos Corporativos com experiência em buffets premium.',
    roleTitle: 'Garçom de Salão • Eventos & Gastronomia',
    location: 'São Paulo, SP (Jardins • 2.5 km)',
    verified: true,
    completedShiftsCount: 42,
    matchReasons: ['Categoria Gastronomia', 'Raio de 2.5 km', 'Nível 2 Atendido'],
    skills: ['Garçom de Salão', 'Serviço à Francesa', 'Atendimento & Bar'],
    recentReviews: [
      {
        companyName: 'Buffet Espaço Fasano',
        rating: 5.0,
        comment: 'Lucas foi impecável no atendimento aos convidados VIP.',
        date: 'Há 3 dias',
        badge: 'Pontual e Proativo'
      }
    ]
  };

  const mockJob: CompanyJob = {
    id: 'test-job-1',
    title: 'Garçom para Evento',
    category: 'Gastronomia',
    location: {
      city: 'São Paulo',
      neighborhood: 'Jardins',
      address: 'Alameda Santos, 1200'
    },
    date: 'Hoje',
    schedule: {
      start: '18:00',
      end: '23:00',
      totalHours: 5
    },
    slots: {
      total: 2,
      filled: 0
    },
    paymentAmount: 190,
    requiredLevel: 2,
    status: 'open',
    requirements: ['Camisa preta'],
    candidates: [mockCandidate]
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CandidateProfileModalComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(CandidateProfileModalComponent);
    component = fixture.componentInstance;
    component.isOpen = true;
    component.candidate = mockCandidate;
    component.job = mockJob;
    fixture.detectChanges();
  });

  it('should create candidate profile modal component', () => {
    expect(component).toBeTruthy();
  });

  it('should display candidate header details: name, level label, verified badge and bio', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Lucas Mendes');
    expect(compiled.textContent).toContain('LM');
    expect(compiled.textContent).toContain('Nível 2 — Experiente');
    expect(compiled.textContent).toContain('Verificado');
    expect(compiled.textContent).toContain('Garçom de Salão • Eventos & Gastronomia');
    expect(compiled.textContent).toContain('São Paulo, SP (Jardins • 2.5 km)');
    expect(compiled.textContent).toContain('Garçom de Salão e Eventos Corporativos');
  });

  it('should display reputation metrics grid: rating, punctuality, completed shifts and match percentage', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('4.9');
    expect(compiled.textContent).toContain('38 avaliações');
    expect(compiled.textContent).toContain('100%');
    expect(compiled.textContent).toContain('Pontualidade nos turnos');
    expect(compiled.textContent).toContain('42');
    expect(compiled.textContent).toContain('Turnos pagos no app');
    expect(compiled.textContent).toContain('98% Match');
    expect(compiled.textContent).toContain('Categoria Gastronomia');
  });

  it('should render skills chips and recent reviews feed', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Garçom de Salão');
    expect(compiled.textContent).toContain('Serviço à Francesa');
    expect(compiled.textContent).toContain('Buffet Espaço Fasano');
    expect(compiled.textContent).toContain('Lucas foi impecável no atendimento aos convidados VIP.');
    expect(compiled.textContent).toContain('Pontual e Proativo');
  });

  it('should emit approve when clicking "Aprovar Candidato"', () => {
    spyOn(component.approve, 'emit');
    const approveBtn = fixture.nativeElement.querySelector('.tp-modal-btn-approve');
    expect(approveBtn).toBeTruthy();
    approveBtn.click();

    expect(component.approve.emit).toHaveBeenCalledWith(mockCandidate);
  });

  it('should emit reject when clicking "Recusar"', () => {
    spyOn(component.reject, 'emit');
    const rejectBtn = fixture.nativeElement.querySelector('.tp-modal-btn-reject');
    expect(rejectBtn).toBeTruthy();
    rejectBtn.click();

    expect(component.reject.emit).toHaveBeenCalledWith(mockCandidate);
  });

  it('should emit closed when clicking close button', () => {
    spyOn(component.closed, 'emit');
    component.close();

    expect(component.closed.emit).toHaveBeenCalled();
  });

  it('should render approved status pill when candidate is approved', () => {
    fixture.componentRef.setInput('candidate', { ...mockCandidate, status: 'approved' });
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Candidato Aprovado no Turno');
  });

  it('should render rejected status pill when candidate is rejected', () => {
    fixture.componentRef.setInput('candidate', { ...mockCandidate, status: 'rejected' });
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Candidatura Recusada');
  });
});
