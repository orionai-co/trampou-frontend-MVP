import { TestBed } from '@angular/core/testing';
import { CompanyService } from '../../src/app/features/company/services/company.service';

describe('CompanyService', () => {
  let service: CompanyService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CompanyService]
    });
    service = TestBed.inject(CompanyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should load initial jobs and compute metrics', () => {
    expect(service.jobs().length).toBeGreaterThan(0);
    const metrics = service.metrics();
    expect(metrics.openJobs).toBe(2);
    expect(metrics.candidatesUnderReview).toBe(5);
    expect(metrics.completedShifts).toBeGreaterThanOrEqual(48);
  });

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
    expect(service.metrics().openJobs).toBe(3);
  });

  it('should approve candidate and increment filled slots', () => {
    const targetJob = service.jobs().find(j => j.id === 'comp-job-1')!;
    const candidateToApprove = targetJob.candidates.find(c => c.status === 'applied')!;
    const initialFilled = targetJob.slots.filled;

    service.approveCandidate(targetJob.id, candidateToApprove.id);

    const updatedJob = service.getJobById(targetJob.id)!;
    const updatedCandidate = updatedJob.candidates.find(c => c.id === candidateToApprove.id)!;

    expect(updatedCandidate.status).toBe('approved');
    expect(updatedJob.slots.filled).toBe(initialFilled + 1);
  });

  it('should reject candidate and update status to rejected', () => {
    const targetJob = service.jobs().find(j => j.id === 'comp-job-2')!;
    const candidateToReject = targetJob.candidates.find(c => c.status === 'applied')!;

    service.rejectCandidate(targetJob.id, candidateToReject.id);

    const updatedJob = service.getJobById(targetJob.id)!;
    const updatedCandidate = updatedJob.candidates.find(c => c.id === candidateToReject.id)!;

    expect(updatedCandidate.status).toBe('rejected');
  });

  it('should find job by id', () => {
    const job = service.getJobById('comp-job-1');
    expect(job).toBeTruthy();
    expect(job?.title).toBe('Garçom para Evento Corporativo');
  });
});
