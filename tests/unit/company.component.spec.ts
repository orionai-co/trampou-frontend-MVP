import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CompanyComponent } from '../../src/app/features/company/company.component';
import { CompanyService } from '../../src/app/features/company/services/company.service';
import { provideRouter } from '@angular/router';

describe('CompanyComponent', () => {
  let component: CompanyComponent;
  let fixture: ComponentFixture<CompanyComponent>;
  let companyService: CompanyService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompanyComponent],
      providers: [
        CompanyService,
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CompanyComponent);
    component = fixture.componentInstance;
    companyService = TestBed.inject(CompanyService);
    fixture.detectChanges();
  });

  it('should create the company component', () => {
    expect(component).toBeTruthy();
  });

  it('should switch between active and history tabs', () => {
    expect(component.activeTab()).toBe('active');

    component.onSelectTab('history');
    expect(component.activeTab()).toBe('history');

    component.onSelectTab('active');
    expect(component.activeTab()).toBe('active');
  });

  it('should open and close create job modal', () => {
    expect(component.isCreateModalOpen()).toBeFalse();

    component.openCreateJobModal();
    expect(component.isCreateModalOpen()).toBeTrue();

    component.closeCreateJobModal();
    expect(component.isCreateModalOpen()).toBeFalse();
  });

  it('should handle job created and show feedback', () => {
    component.handleJobCreated({
      title: 'Auxiliar de Limpeza Noturna',
      category: 'Operacional',
      slots: { total: 2, filled: 0 },
      paymentAmount: 160
    });

    expect(component.feedbackMessage()).toContain('Auxiliar de Limpeza Noturna');
    expect(companyService.jobs()[0].title).toBe('Auxiliar de Limpeza Noturna');
  });

  it('should open candidate modal, approve candidate and update state', () => {
    const job = companyService.jobs()[0];
    component.openCandidatesModal(job);

    expect(component.isCandidateModalOpen()).toBeTrue();
    expect(component.selectedJob()).toBeTruthy();

    const appliedCandidate = job.candidates.find(c => c.status === 'applied');
    if (appliedCandidate) {
      component.handleCandidateApproved({
        jobId: job.id,
        candidateId: appliedCandidate.id
      });
      expect(component.feedbackMessage()).toContain('aprovado com sucesso');
    }
  });

  it('should open chat in sidebar for approved candidate and close sidebar', () => {
    const job = companyService.jobs()[0];
    const candidate = job.candidates[0];

    component.openChatForJob(job, candidate);
    expect(component.activeChatJobId()).toBe(job.id);
    expect(component.activeChatFreelancerName()).toBe(candidate.name);
    expect(component.isMobileChatOpen()).toBeTrue();

    component.closeChatSidebar();
    expect(component.activeChatJobId()).toBe('');
    expect(component.activeChatFreelancerName()).toBe('');
    expect(component.isMobileChatOpen()).toBeFalse();
  });

  it('should compute activeChatContacts list from approved candidates in jobs', () => {
    const contacts = component.activeChatContacts();
    expect(contacts.length).toBeGreaterThan(0);
    expect(contacts.some((c: any) => c.candidateName === 'Lucas Mendes')).toBeTrue();
  });

  it('should select contact from contacts list and open chat in right window', () => {
    const contacts = component.activeChatContacts();
    const targetContact = contacts[0];

    component.handleSelectContact(targetContact);
    expect(component.activeChatJobId()).toBe(targetContact.jobId);
    expect(component.activeChatFreelancerName()).toBe(targetContact.candidateName);
  });

  it('should close candidate modal and focus chat sidebar when handleOpenCandidateChat is called', () => {
    const job = companyService.jobs()[0];
    component.openCandidatesModal(job);
    expect(component.isCandidateModalOpen()).toBeTrue();
    expect(component.selectedJob()).toBeTruthy();

    const candidate = job.candidates[0];
    component.handleOpenCandidateChat({ candidate, job });

    expect(component.isCandidateModalOpen()).toBeFalse();
    expect(component.selectedJob()).toBeNull();
    expect(component.activeChatJobId()).toBe(job.id);
    expect(component.activeChatFreelancerName()).toBe(candidate.name);
    expect(component.isMobileChatOpen()).toBeTrue();
  });

  it('should open and close boost campaign modal and handle campaign created', () => {
    expect(component.isBoostModalOpen()).toBeFalse();

    component.openBoostModal();
    expect(component.isBoostModalOpen()).toBeTrue();

    component.handleCampaignCreated({
      id: 'camp-test',
      companyId: 'comp-001',
      type: 'featured_company',
      title: 'Campanha de Teste',
      headline: 'Teste',
      videoUrl: '',
      videoThumbnail: '',
      durationDays: 7,
      status: 'active',
      startDate: '',
      endDate: '',
      targeting: { radiusKm: 10, category: 'Gastronomia', minLevel: 2 },
      metrics: { impressions: 0, videoViews: 0, profileVisits: 0, interestedCount: 0, applicationsCount: 0, spentAmount: 99 }
    });
    expect(component.feedbackMessage()).toContain('Campanha de Teste');

    component.closeBoostModal();
    expect(component.isBoostModalOpen()).toBeFalse();
  });

  it('should render unified chat card with sidebar and main pane in the DOM', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const unifiedCard = compiled.querySelector('.tp-company-chat-unified-card');
    const sidebar = compiled.querySelector('.tp-company-chat-sidebar');
    const mainPane = compiled.querySelector('.tp-company-chat-main-pane');
    const searchBox = compiled.querySelector('.tp-company-search-box');

    expect(unifiedCard).toBeTruthy();
    expect(sidebar).toBeTruthy();
    expect(mainPane).toBeTruthy();
    expect(searchBox).toBeTruthy();
  });

  it('should return correct activeContactsCount and filter contacts by search term', () => {
    expect(component.activeContactsCount).toBe(component.activeChatContacts().length);

    component.contactSearchTerm.set('Lucas');
    expect(component.filteredChatContacts().every(c => c.candidateName.toLowerCase().includes('lucas'))).toBeTrue();

    const mockEvent = { target: { value: 'Barista' } } as unknown as Event;
    component.onContactSearchInput(mockEvent);
    expect(component.contactSearchTerm()).toBe('Barista');
  });
});

