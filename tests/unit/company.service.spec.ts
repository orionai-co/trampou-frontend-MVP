import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { CompanyService } from '../../src/app/features/company/services/company.service';
import { ApiClientService } from '../../src/app/core/services/api-client.service';
import { CompanyJob } from '../../src/app/features/company/models/company-job.model';

describe('CompanyService', () => {
  let service: CompanyService;
  let apiClientSpy: jasmine.SpyObj<ApiClientService>;

  const mockJob: CompanyJob = {
    id: 'comp-job-1',
    title: 'Garçom para Evento Corporativo',
    category: 'Gastronomia',
    location: { city: 'São Paulo', neighborhood: 'Pinheiros', address: 'Av. Faria Lima, 1000' },
    date: 'Sexta, 18 de Julho',
    schedule: { start: '18:00', end: '00:00', totalHours: 6 },
    slots: { total: 3, filled: 1 },
    paymentAmount: 180,
    requiredLevel: 2,
    status: 'open',
    requirements: ['Experiência'],
    candidates: [
      {
        id: 'cand-1',
        name: 'Lucas Mendes',
        avatarInitials: 'LM',
        level: 2,
        rating: 4.9,
        reviewsCount: 18,
        matchPercentage: 96,
        punctualityRate: 100,
        pixKeyPreview: 'lucas***@gmail.com',
        status: 'applied'
      }
    ]
  };

  beforeEach(() => {
    localStorage.clear();
    apiClientSpy = jasmine.createSpyObj('ApiClientService', ['get', 'post', 'put', 'delete']);
    (apiClientSpy.get.and.callFake as any)((endpoint: string) => {
      if (endpoint.includes('jobs/active')) {
        return Promise.resolve([mockJob]);
      }
      if (endpoint.includes('jobs/history')) {
        return Promise.resolve([]);
      }
      if (endpoint.includes('contacts')) {
        return Promise.resolve([
          {
            jobId: 'comp-job-1',
            jobTitle: 'Garçom para Evento Corporativo',
            candidateId: 'cand-1',
            candidateName: 'Lucas Mendes',
            candidateAvatar: 'LM',
            status: 'approved',
            lastMessage: 'Olá!'
          }
        ]);
      }
      if (endpoint.includes('metrics')) {
        return Promise.resolve({
          openJobs: 2,
          candidatesUnderReview: 5,
          completedShifts: 48
        });
      }
      if (endpoint.includes('profile') || endpoint.includes('/companies/me')) {
        return Promise.resolve({
          name: 'Buffet Teste',
          verified: true,
          category: 'Gastronomia',
          rating: 4.9,
          completedShiftsTotal: 48
        });
      }
      return Promise.resolve({});
    });

    TestBed.configureTestingModule({
      providers: [
        CompanyService,
        { provide: ApiClientService, useValue: apiClientSpy }
      ]
    });
    service = TestBed.inject(CompanyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should load dashboard data via fetchAllDashboardData', fakeAsync(() => {
    service.fetchAllDashboardData();
    tick();

    expect(service.jobs().length).toBe(1);
    expect(service.jobs()[0].id).toBe('comp-job-1');
    const metrics = service.metrics();
    expect(metrics.openJobs).toBe(2);
    expect(metrics.candidatesUnderReview).toBe(5);
    expect(metrics.completedShifts).toBe(48);
  }));

  it('should create a new job and prepend it to jobs signal', () => {
    const initialLength = service.jobs().length;
    const created = service.createJob({
      title: 'Barista para Cafeteria Gourmet',
      category: 'Gastronomia',
      slots: { total: 2, filled: 0 },
      paymentAmount: 160,
      requiredLevel: 2
    });

    expect(created.id).toBeTruthy();
    expect(created.title).toBe('Barista para Cafeteria Gourmet');
    expect(service.jobs().length).toBe(initialLength + 1);
    expect(service.jobs()[0].id).toBe(created.id);
  });

  it('should approve candidate and increment filled slots', fakeAsync(() => {
    service.fetchAllDashboardData();
    tick();

    const targetJob = service.jobs().find(j => j.id === 'comp-job-1')!;
    const candidateToApprove = targetJob.candidates.find(c => c.status === 'applied')!;
    const initialFilled = targetJob.slots.filled;

    service.approveCandidate(targetJob.id, candidateToApprove.id);

    const updatedJob = service.getJobById(targetJob.id)!;
    const updatedCandidate = updatedJob.candidates.find(c => c.id === candidateToApprove.id)!;

    expect(updatedCandidate.status).toBe('approved');
    expect(updatedJob.slots.filled).toBe(initialFilled + 1);
  }));

  it('should reject candidate and update status to rejected', fakeAsync(() => {
    service.fetchAllDashboardData();
    tick();

    const targetJob = service.jobs().find(j => j.id === 'comp-job-1')!;
    const candidateToReject = targetJob.candidates.find(c => c.status === 'applied')!;

    service.rejectCandidate(targetJob.id, candidateToReject.id);

    const updatedJob = service.getJobById(targetJob.id)!;
    const updatedCandidate = updatedJob.candidates.find(c => c.id === candidateToReject.id)!;

    expect(updatedCandidate.status).toBe('rejected');
  }));

  it('should find job by id', fakeAsync(() => {
    service.fetchAllDashboardData();
    tick();

    const job = service.getJobById('comp-job-1');
    expect(job).toBeTruthy();
    expect(job?.title).toBe('Garçom para Evento Corporativo');
  }));
});
