import { TestBed } from '@angular/core/testing';
import { MyJobsService } from '../../src/app/features/my-jobs/services/my-jobs.service';

describe('MyJobsService', () => {
  let service: MyJobsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MyJobsService]
    });
    service = TestBed.inject(MyJobsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should calculate toReceiveAmount and receivedThisMonthAmount correctly', () => {
    expect(service.acceptedJobs().length).toBeGreaterThan(0);
    expect(service.toReceiveAmount()).toBe(340);
    expect(service.receivedThisMonthAmount()).toBe(1280);
  });

  it('should confirm check-in and update checkInStatus', (done) => {
    const acceptedJob = service.acceptedJobs()[0];
    service.confirmCheckIn(acceptedJob.id).subscribe(res => {
      expect(res.success).toBeTrue();
      expect(res.time).toBeTruthy();

      const updated = service.acceptedJobs().find(j => j.id === acceptedJob.id);
      expect(updated?.checkInStatus).toBe('checked_in');
      expect(updated?.checkInTime).toBe(res.time);
      done();
    });
  });

  it('should cancel application and remove from list', (done) => {
    const pendingJob = service.pendingJobs()[0];
    const initialCount = service.pendingJobs().length;

    service.cancelApplication(pendingJob.id).subscribe(success => {
      expect(success).toBeTrue();
      expect(service.pendingJobs().length).toBe(initialCount - 1);
      done();
    });
  });

  it('should withdraw from accepted job', (done) => {
    const acceptedJob = service.acceptedJobs()[0];
    const initialCount = service.acceptedJobs().length;

    service.withdrawJob(acceptedJob.id).subscribe(success => {
      expect(success).toBeTrue();
      expect(service.acceptedJobs().length).toBe(initialCount - 1);
      done();
    });
  });
});
