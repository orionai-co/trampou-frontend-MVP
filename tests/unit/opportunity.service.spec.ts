import { TestBed } from '@angular/core/testing';
import { OpportunityService, TRAMPOU_COMPANY_JOBS_STORAGE_KEY } from '../../src/app/features/opportunities/services/opportunity.service';
import { ApiClientService } from '../../src/app/core/services/api-client.service';
import { Opportunity } from '../../src/app/features/opportunities/models/opportunity.model';

describe('OpportunityService', () => {
  let service: OpportunityService;
  let apiClientSpy: jasmine.SpyObj<ApiClientService>;

  const mockOpportunities: Opportunity[] = [
    {
      id: 'opp-001',
      title: 'Garçom para Casamento e Buffet Noturno',
      companyName: 'Buffet Espaço Paulista',
      companyRating: 4.9,
      companyReviewsCount: 84,
      category: 'Eventos',
      location: {
        city: 'São Paulo',
        neighborhood: 'Vila Olímpia',
        distanceKm: 2.4,
        address: 'Rua Funchal, 418'
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
      requiredLevel: 2,
      matchPercentage: 98,
      status: 'urgency',
      spotsAvailable: 2,
      spotsTotal: 6,
      description: 'Atendimento em evento social formal.',
      requirements: ['Traje social completo']
    },
    {
      id: 'opp-002',
      title: 'Auxiliar de Bar e Coquetelaria',
      companyName: 'SkyLounge Rooftop',
      companyRating: 4.8,
      companyReviewsCount: 52,
      category: 'Gastronomia',
      location: {
        city: 'São Paulo',
        neighborhood: 'Itaim Bibi',
        distanceKm: 3.8,
        address: 'Av. Brigadeiro Faria Lima, 3477'
      },
      date: 'Hoje',
      isToday: true,
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
      requiredLevel: 2,
      matchPercentage: 94,
      status: 'available',
      spotsAvailable: 1,
      spotsTotal: 3,
      description: 'Apoio aos bartenders principais.',
      requirements: ['Agilidade em ambiente de alto fluxo']
    }
  ];

  beforeEach(() => {
    localStorage.clear();
    apiClientSpy = jasmine.createSpyObj('ApiClientService', ['get', 'post', 'delete', 'put']);
    apiClientSpy.get.and.returnValue(Promise.resolve(mockOpportunities));
    apiClientSpy.post.and.returnValue(Promise.resolve({ success: true, opportunity: mockOpportunities[0] }));
    apiClientSpy.delete.and.returnValue(Promise.resolve(true));

    TestBed.configureTestingModule({
      providers: [
        OpportunityService,
        { provide: ApiClientService, useValue: apiClientSpy }
      ]
    });
    service = TestBed.inject(OpportunityService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return opportunities list from api', (done: DoneFn) => {
    service.getOpportunities().subscribe(list => {
      expect(list.length).toBe(2);
      expect(list[0].id).toBeTruthy();
      done();
    });
  });

  it('should filter opportunities by category', (done: DoneFn) => {
    service.getOpportunities({ category: 'Eventos' }).subscribe(list => {
      expect(list.length).toBe(1);
      list.forEach(item => expect(item.category).toBe('Eventos'));
      done();
    });
  });

  it('should filter opportunities by text search query', (done: DoneFn) => {
    service.getOpportunities({ searchQuery: 'Garçom' }).subscribe(list => {
      expect(list.length).toBe(1);
      list.forEach(item => {
        const matches =
          item.title.toLowerCase().includes('garçom') ||
          item.description.toLowerCase().includes('garçom') ||
          item.category.toLowerCase().includes('garçom');
        expect(matches).toBeTrue();
      });
      done();
    });
  });

  it('should treat category "Todas" as all categories and return all active opportunities', (done: DoneFn) => {
    service.getOpportunities({ category: 'Todas' }).subscribe(list => {
      expect(list.length).toBe(2);
      done();
    });
  });

  it('should include jobs created by company from local storage and sync dynamically', async () => {
    const customJob = {
      id: 'custom-company-job-99',
      title: 'Recepcionista Bilíngue',
      companyName: 'Gabriel Imports',
      category: 'Atendimento',
      status: 'open',
      payment: { amount: 200, type: 'diaria', pixImmediate: true },
      location: { city: 'São Paulo', neighborhood: 'Pinheiros', distanceKm: 1.5, address: 'Rua Augusta, 1000' },
      date: 'Hoje',
      isToday: true,
      spotsAvailable: 2,
      spotsTotal: 2,
      description: 'Recepção bilíngue'
    };

    localStorage.setItem(TRAMPOU_COMPANY_JOBS_STORAGE_KEY, JSON.stringify([customJob]));
    const list = await service.fetchOpportunities();
    expect(list.some(o => o.id === 'custom-company-job-99')).toBeTrue();
    expect(list.some(o => o.title === 'Recepcionista Bilíngue')).toBeTrue();
  });

  it('should not populate featured companies when trampou_boost_dismissed is true', async () => {
    localStorage.setItem('trampou_boost_dismissed', 'true');
    const result = await service.fetchFeaturedCompanies();
    expect(result.length).toBe(0);
    expect(service.featuredCompanies().length).toBe(0);
    expect(service.loadStoredBoostCampaigns()).toBeNull();
  });

  it('should not populate featured companies when boost campaigns are cancelled or inactive', async () => {
    localStorage.setItem('trampou_boost_campaigns', JSON.stringify([{
      id: 'camp-old',
      companyId: 'comp-001',
      companyName: 'Buffet Espaço Paulista',
      objective: 'featured_company',
      headline: 'Old headline',
      videoUrl: '',
      radiusKm: 10,
      days: 7,
      price: 99,
      active: false,
      status: 'cancelled',
      createdAt: new Date().toISOString()
    }]));

    const result = await service.fetchFeaturedCompanies();
    expect(result.length).toBe(0);
    expect(service.featuredCompanies().length).toBe(0);
    expect(service.loadStoredBoostCampaigns()).toBeNull();
  });

  it('should populate featured company when there is an active boost campaign in storage', () => {
    localStorage.setItem('trampou_boost_campaigns', JSON.stringify([{
      id: 'camp-active-1',
      companyId: 'comp-001',
      companyName: 'Buffet Novo Destaque',
      objective: 'featured_company',
      headline: 'Vagas abertas com PIX imediato',
      videoUrl: 'https://test.com/v.mp4',
      radiusKm: 12,
      days: 7,
      price: 99,
      active: true,
      status: 'active',
      createdAt: new Date().toISOString()
    }]));

    const feat = service.loadStoredBoostCampaigns();
    expect(feat).toBeTruthy();
    expect(feat?.companyName).toBe('Buffet Novo Destaque');
    expect(service.featuredCompanies().length).toBe(1);
    expect(service.featuredCompanies()[0].headline).toBe('Vagas abertas com PIX imediato');
  });
});

