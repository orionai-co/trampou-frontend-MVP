import { ComponentFixture, TestBed } from '@angular/core/testing';
import { JobStatusItemComponent } from '../../src/app/features/my-jobs/components/job-status-item/job-status-item.component';
import { JobApplication } from '../../src/app/features/my-jobs/models/job-application.model';

describe('JobStatusItemComponent', () => {
  let component: JobStatusItemComponent;
  let fixture: ComponentFixture<JobStatusItemComponent>;

  const mockAcceptedJob: JobApplication = {
    id: 'test-app-01',
    opportunityId: 'test-opp-01',
    title: 'Garçom para Casamento',
    companyName: 'Buffet Paulista',
    companyRating: 4.9,
    category: 'Eventos',
    location: {
      city: 'São Paulo',
      neighborhood: 'Vila Olímpia',
      address: 'Rua Funchal, 418',
      mapUrl: 'https://maps.google.com'
    },
    date: 'Hoje',
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
    status: 'accepted',
    appliedAt: new Date(),
    checkInStatus: 'pending'
  };

  const mockPendingJob: JobApplication = {
    id: 'test-app-02',
    opportunityId: 'test-opp-02',
    title: 'Operador de Caixa',
    companyName: 'Street Gourmet',
    category: 'Atendimento',
    location: {
      city: 'São Paulo',
      neighborhood: 'Pinheiros',
      address: 'Praça Benedito Calixto, 85'
    },
    date: 'Hoje',
    isToday: true,
    schedule: {
      start: '12:00',
      end: '22:00',
      totalHours: 10
    },
    payment: {
      amount: 170,
      type: 'diaria',
      pixImmediate: true
    },
    status: 'pending',
    appliedAt: new Date(),
    responseTimeRemaining: 'Resposta em até 15 min'
  };

  const mockCompletedJob: JobApplication = {
    id: 'test-app-03',
    opportunityId: 'test-opp-03',
    title: 'Cumim para Jantar',
    companyName: 'Restaurante Terraço',
    category: 'Gastronomia',
    location: {
      city: 'São Paulo',
      neighborhood: 'Jardins',
      address: 'Alameda Santos, 1120'
    },
    date: '20 Ago',
    schedule: {
      start: '18:30',
      end: '23:30',
      totalHours: 5
    },
    payment: {
      amount: 150,
      type: 'diaria',
      pixImmediate: true,
      paidAt: '20/08/2026 às 23:42',
      receiptId: 'PIX-12345678'
    },
    status: 'completed',
    appliedAt: new Date()
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JobStatusItemComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(JobStatusItemComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    component.job = mockAcceptedJob;
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should render accepted job with Check-in button and price', () => {
    component.job = mockAcceptedJob;
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Garçom para Casamento');
    expect(text).toContain('Buffet Paulista');
    expect(text).toContain('180');
    expect(text).toContain('Fazer Check-in');
    expect(text).toContain('Não poderei comparecer');
  });

  it('should emit checkIn event when check-in button is clicked', () => {
    component.job = mockAcceptedJob;
    fixture.detectChanges();

    spyOn(component.checkIn, 'emit');
    component.onCheckIn();

    expect(component.checkIn.emit).toHaveBeenCalledWith(mockAcceptedJob);
  });

  it('should render pending job with response time remaining and cancel link', () => {
    component.job = mockPendingJob;
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Operador de Caixa');
    expect(text).toContain('Resposta em até 15 min');
    expect(text).toContain('Cancelar candidatura');
  });

  it('should emit cancel event when cancel link is clicked', () => {
    component.job = mockPendingJob;
    fixture.detectChanges();

    spyOn(component.cancel, 'emit');
    const cancelLink = fixture.nativeElement.querySelector('.tp-cancel-link');
    cancelLink.click();

    expect(component.cancel.emit).toHaveBeenCalledWith(mockPendingJob);
  });

  it('should render completed job with PIX receipt info and link', () => {
    component.job = mockCompletedJob;
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Cumim para Jantar');
    expect(text).toContain('PIX Recebido • R$ 150,00');
    expect(text).toContain('Ver comprovante PIX');
  });

  it('should render structured tp-btn-chat button and emit openChat on click', () => {
    component.job = mockAcceptedJob;
    fixture.detectChanges();

    const chatBtn = fixture.nativeElement.querySelector('.tp-btn-chat');
    expect(chatBtn).toBeTruthy();
    expect(chatBtn.textContent).toContain('Abrir Chat');

    spyOn(component.openChat, 'emit');
    chatBtn.click();
    expect(component.openChat.emit).toHaveBeenCalledWith(mockAcceptedJob);
  });
});
