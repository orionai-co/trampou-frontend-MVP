import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MyJobsComponent } from '../../src/app/features/my-jobs/my-jobs.component';
import { MyJobsService } from '../../src/app/features/my-jobs/services/my-jobs.service';
import { ApiClientService } from '../../src/app/core/services/api-client.service';
import { provideRouter } from '@angular/router';

describe('MyJobsComponent', () => {
  let component: MyJobsComponent;
  let fixture: ComponentFixture<MyJobsComponent>;
  let service: MyJobsService;

  const mockAccepted: any[] = [
    {
      id: 'app-001',
      opportunityId: 'opp-001',
      title: 'Garçom para Casamento e Buffet Noturno',
      companyName: 'Buffet Espaço Paulista',
      companyRating: 4.9,
      category: 'Eventos',
      location: { city: 'São Paulo', neighborhood: 'Vila Olímpia', address: 'Rua Funchal, 418', distanceKm: 2.4 },
      date: 'Hoje',
      isToday: true,
      schedule: { start: '18:00', end: '01:00', totalHours: 7 },
      payment: { amount: 180, type: 'diaria', pixImmediate: true },
      status: 'accepted',
      appliedAt: new Date(),
      checkInStatus: 'pending'
    }
  ];

  const mockPending: any[] = [
    {
      id: 'app-003',
      opportunityId: 'opp-004',
      title: 'Operador de Caixa para Festival Gastronômico',
      companyName: 'Street Gourmet Eventos',
      companyRating: 4.7,
      category: 'Atendimento',
      location: { city: 'São Paulo', neighborhood: 'Pinheiros', address: 'Praça Benedito Calixto, 85', distanceKm: 4.1 },
      date: 'Hoje',
      isToday: true,
      schedule: { start: '12:00', end: '18:00', totalHours: 6 },
      payment: { amount: 150, type: 'diaria', pixImmediate: true },
      status: 'pending',
      appliedAt: new Date()
    }
  ];

  const mockCompleted: any[] = [
    {
      id: 'app-008',
      opportunityId: 'opp-011',
      title: 'Garçom de Salão e Atendimento VIP',
      companyName: 'Mansão Faria Lima Eventos',
      companyRating: 4.9,
      category: 'Eventos',
      location: { city: 'São Paulo', neighborhood: 'Jardins', address: 'Alameda Gabriel', distanceKm: 2.9 },
      date: '12 Ago',
      schedule: { start: '18:00', end: '00:00', totalHours: 6 },
      payment: { amount: 1280, type: 'diaria', pixImmediate: true },
      status: 'completed',
      appliedAt: new Date(),
      receiptId: 'PIX-123'
    }
  ];

  beforeEach(async () => {
    const apiClientSpy = jasmine.createSpyObj('ApiClientService', ['get', 'post', 'delete']);
    (apiClientSpy.get.and.callFake as any)((url: string) => {
      if (url.includes('/confirmed')) return Promise.resolve(mockAccepted);
      if (url.includes('/under-review')) return Promise.resolve(mockPending);
      if (url.includes('/history')) return Promise.resolve(mockCompleted);
      return Promise.resolve([]);
    });

    await TestBed.configureTestingModule({
      imports: [MyJobsComponent],
      providers: [
        MyJobsService,
        { provide: ApiClientService, useValue: apiClientSpy },
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MyJobsComponent);
    component = fixture.componentInstance;
    service = TestBed.inject(MyJobsService);
    await service.loadAllJobs();
    fixture.detectChanges();
  });

  it('should create the MyJobsComponent', () => {
    expect(component).toBeTruthy();
  });

  it('should render header with financial metric Recebido no Mês', () => {
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Meus Trabalhos');
    expect(text).not.toContain('A Receber (Confirmados)');
    expect(text).toContain('Recebido no Mês');
    expect(text).toContain('1280');
  });

  it('should switch status tabs when clicked', () => {
    expect(component.activeTab()).toBe('accepted');

    component.onSelectTab('pending');
    fixture.detectChanges();
    expect(component.activeTab()).toBe('pending');

    component.onSelectTab('completed');
    fixture.detectChanges();
    expect(component.activeTab()).toBe('completed');
  });

  it('should open and close check-in modal', () => {
    const job = service.acceptedJobs()[0];
    component.openCheckInModal(job);
    expect(component.isCheckInModalOpen()).toBeTrue();
    expect(component.selectedJob()).toEqual(job);

    component.closeCheckInModal();
    expect(component.isCheckInModalOpen()).toBeFalse();
  });

  it('should open and close instructions modal', () => {
    const job = service.acceptedJobs()[0];
    component.openInstructionsModal(job);
    expect(component.isInstructionsModalOpen()).toBeTrue();

    component.closeInstructionsModal();
    expect(component.isInstructionsModalOpen()).toBeFalse();
  });

  it('should open and close receipt modal', () => {
    const job = service.completedJobs()[0];
    component.openReceiptModal(job);
    expect(component.isReceiptModalOpen()).toBeTrue();

    component.closeReceiptModal();
    expect(component.isReceiptModalOpen()).toBeFalse();
  });

  it('should compute activeChatContacts list from accepted jobs', () => {
    const contacts = component.activeChatContacts();
    expect(contacts.length).toBe(service.acceptedJobs().length);
    expect(contacts.some((c: any) => c.candidateName === 'Buffet Espaço Paulista')).toBeTrue();
  });

  it('should open chat in right column and toggle isMobileChatOpen when selecting a contact or clicking openChat', () => {
    const job = service.acceptedJobs()[0];
    component.openChatForJob(job);

    expect(component.activeChatJobId()).toBe(job.opportunityId || job.id);
    expect(component.activeChatCompanyName()).toBe(job.companyName);
    expect(component.activeChatJobTitle()).toBe(job.title);
    expect(component.isMobileChatOpen()).toBeTrue();

    component.closeChatSidebar();
    expect(component.activeChatJobId()).toBe('');
    expect(component.isMobileChatOpen()).toBeFalse();
  });

  it('should handle selecting a contact from the contacts list and activate mobile chat', () => {
    const contacts = component.activeChatContacts();
    const targetContact = contacts[0];

    component.handleSelectContact(targetContact);
    expect(component.activeChatJobId()).toBe(targetContact.jobId);
    expect(component.activeChatCompanyName()).toBe(targetContact.candidateName);
    expect(component.isMobileChatOpen()).toBeTrue();
  });

  it('should render the unified chat split-pane container with sidebar and main pane', () => {
    const unifiedContainer = fixture.nativeElement.querySelector('.tp-chat-unified-container');
    const sidebar = fixture.nativeElement.querySelector('.tp-chat-sidebar');
    const mainPane = fixture.nativeElement.querySelector('.tp-chat-main-pane');
    const contactsList = fixture.nativeElement.querySelector('tp-chat-contacts-list');
    const chatSidebar = fixture.nativeElement.querySelector('tp-shift-chat-sidebar');

    expect(unifiedContainer).toBeTruthy();
    expect(sidebar).toBeTruthy();
    expect(mainPane).toBeTruthy();
    expect(contactsList).toBeTruthy();
    expect(chatSidebar).toBeTruthy();
  });
});
