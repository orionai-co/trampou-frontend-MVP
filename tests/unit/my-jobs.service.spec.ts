import { TestBed } from '@angular/core/testing';
import { MyJobsService } from '../../src/app/features/my-jobs/services/my-jobs.service';
import { ApiClientService } from '../../src/app/core/services/api-client.service';
import { JobApplication } from '../../src/app/features/my-jobs/models/job-application.model';

describe('MyJobsService', () => {
  let service: MyJobsService;
  let apiClientSpy: jasmine.SpyObj<ApiClientService>;

  const mockAccepted: JobApplication[] = [
    {
      id: 'app-001',
      opportunityId: 'opp-001',
      title: 'Garçom para Casamento e Buffet Noturno',
      companyName: 'Buffet Espaço Paulista',
      companyRating: 4.9,
      category: 'Eventos',
      location: {
        city: 'São Paulo',
        neighborhood: 'Vila Olímpia',
        address: 'Rua Funchal, 418',
        distanceKm: 2.4
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
    },
    {
      id: 'app-002',
      opportunityId: 'opp-002',
      title: 'Auxiliar de Bar e Coquetelaria',
      companyName: 'SkyLounge Rooftop',
      companyRating: 4.8,
      category: 'Gastronomia',
      location: {
        city: 'São Paulo',
        neighborhood: 'Itaim Bibi',
        address: 'Av. Brigadeiro Faria Lima, 3477',
        distanceKm: 3.8
      },
      date: 'Amanhã',
      isToday: false,
      schedule: {
        start: '19:00',
        end: '02:00',
        totalHours: 7
      },
      payment: {
        amount: 160,
        type: 'diaria',
        pixImmediate: true
      },
      status: 'accepted',
      appliedAt: new Date(),
      checkInStatus: 'pending'
    }
  ];

  const mockPending: JobApplication[] = [
    {
      id: 'app-003',
      opportunityId: 'opp-004',
      title: 'Operador de Caixa para Festival Gastronômico',
      companyName: 'Street Gourmet Eventos',
      companyRating: 4.7,
      category: 'Atendimento',
      location: {
        city: 'São Paulo',
        neighborhood: 'Pinheiros',
        address: 'Praça Benedito Calixto, 85',
        distanceKm: 4.1
      },
      date: 'Hoje',
      isToday: true,
      schedule: {
        start: '12:00',
        end: '18:00',
        totalHours: 6
      },
      payment: {
        amount: 150,
        type: 'diaria',
        pixImmediate: true
      },
      status: 'pending',
      appliedAt: new Date()
    }
  ];

  const mockCompleted: JobApplication[] = [
    {
      id: 'app-008',
      opportunityId: 'opp-011',
      title: 'Garçom de Salão e Atendimento VIP',
      companyName: 'Mansão Faria Lima Eventos',
      companyRating: 4.9,
      category: 'Eventos',
      location: {
        city: 'São Paulo',
        neighborhood: 'Jardins',
        address: 'Alameda Gabriel Monteiro da Silva, 1420',
        distanceKm: 2.9
      },
      date: '12 Ago',
      schedule: {
        start: '18:00',
        end: '00:00',
        totalHours: 6
      },
      payment: {
        amount: 1280,
        type: 'diaria',
        pixImmediate: true
      },
      status: 'completed',
      appliedAt: new Date()
    }
  ];

  beforeEach(async () => {
    localStorage.clear();
    apiClientSpy = jasmine.createSpyObj('ApiClientService', ['get', 'post', 'delete', 'put']);
    (apiClientSpy.get.and.callFake as any)((url: string) => {
      if (url.includes('/confirmed')) return Promise.resolve(mockAccepted);
      if (url.includes('/under-review')) return Promise.resolve(mockPending);
      if (url.includes('/history')) return Promise.resolve(mockCompleted);
      return Promise.resolve([]);
    });
    apiClientSpy.post.and.returnValue(Promise.resolve({ success: true, time: '18:00' }));
    apiClientSpy.delete.and.returnValue(Promise.resolve(true));

    TestBed.configureTestingModule({
      providers: [
        MyJobsService,
        { provide: ApiClientService, useValue: apiClientSpy }
      ]
    });
    service = TestBed.inject(MyJobsService);
    await service.loadAllJobs();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should persist pending application to signal and localStorage', () => {
    const initialCount = service.pendingJobs().length;
    service.addPendingApplication({
      id: 'app-test-999',
      opportunityId: 'opp-999',
      opportunityTitle: 'Recepcionista para Clínica',
      title: 'Recepcionista para Clínica',
      companyName: 'Clínica Sorriso',
      category: 'Saúde',
      location: { city: 'São Paulo', neighborhood: 'Paulista', address: 'Av. Paulista, 1000' },
      date: 'Amanhã',
      schedule: { start: '08:00', end: '17:00', totalHours: 8 },
      payment: { amount: 150, type: 'diaria', pixImmediate: true },
      status: 'pending',
      appliedAt: new Date()
    });

    expect(service.pendingJobs().length).toBe(initialCount + 1);
    const found = service.pendingJobs().find(j => j.id === 'app-test-999');
    expect(found).toBeTruthy();
    expect(found?.title).toBe('Recepcionista para Clínica');

    const stored = localStorage.getItem('trampou_user_applications');
    expect(stored).toBeTruthy();
    expect(stored).toContain('app-test-999');
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
