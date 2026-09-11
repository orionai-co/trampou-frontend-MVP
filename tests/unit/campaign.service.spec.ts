import { TestBed } from '@angular/core/testing';
import { CampaignService } from '../../src/app/features/company/services/campaign.service';
import { ApiClientService } from '../../src/app/core/services/api-client.service';
import { SponsoredCampaign } from '../../src/app/core/models/sponsored-campaign.model';

describe('CampaignService', () => {
  let service: CampaignService;
  let apiClientSpy: jasmine.SpyObj<ApiClientService>;

  const mockActiveCampaign: SponsoredCampaign = {
    id: 'camp-001',
    companyId: 'comp-001',
    type: 'featured_company',
    title: 'Destaque Institucional — Buffet Espaço Paulista',
    headline: 'Conheça nossa megaestrutura gastronômica, nossa equipe e como é trabalhar nos maiores eventos de SP.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-restaurant-kitchen-staff-working-42998-large.mp4',
    videoThumbnail: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop&q=80',
    durationDays: 7,
    status: 'active',
    startDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    targeting: {
      radiusKm: 10,
      category: 'Gastronomia & Eventos',
      minLevel: 2
    },
    metrics: {
      impressions: 12480,
      videoViews: 8230,
      profileVisits: 428,
      interestedCount: 87,
      applicationsCount: 31,
      spentAmount: 149.00
    }
  };

  beforeEach(async () => {
    apiClientSpy = jasmine.createSpyObj('ApiClientService', ['get', 'post']);
    (apiClientSpy.get.and.callFake as any)((url: string) => {
      if (url.includes('/active')) return Promise.resolve(mockActiveCampaign);
      if (url.includes('/metrics')) return Promise.resolve(mockActiveCampaign.metrics);
      return Promise.resolve([mockActiveCampaign]);
    });
    apiClientSpy.post.and.returnValue(Promise.resolve(mockActiveCampaign));

    TestBed.configureTestingModule({
      providers: [
        CampaignService,
        { provide: ApiClientService, useValue: apiClientSpy }
      ]
    });
    service = TestBed.inject(CampaignService);
    await service.fetchActiveCampaign();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with an active mock campaign and valid metrics', () => {
    expect(service.hasActiveCampaign()).toBeTrue();
    const active = service.activeCampaign();
    expect(active).toBeTruthy();
    expect(active?.title).toContain('Buffet Espaço Paulista');
    expect(service.currentMetrics().impressions).toBe(12480);
    expect(service.currentMetrics().videoViews).toBe(8230);
    expect(service.currentMetrics().profileVisits).toBe(428);
    expect(service.currentMetrics().applicationsCount).toBe(31);
  });

  it('should return campaign plans with predefined options', () => {
    const plans = service.getPlans();
    expect(plans.length).toBeGreaterThanOrEqual(4);
    expect(plans.some(p => p.durationDays === 3 && p.price === 49)).toBeTrue();
    expect(plans.some(p => p.durationDays === 7 && p.price === 99)).toBeTrue();
    expect(plans.some(p => p.durationDays === 14 && p.price === 179)).toBeTrue();
    expect(plans.some(p => p.durationDays === 30 && p.price === 299)).toBeTrue();
  });

  it('should create a new campaign and set it as active', () => {
    const newCamp = service.createCampaign({
      type: 'boost_job',
      title: 'Impulsionamento Garçom Urgente',
      headline: 'Vagas urgentes abertas com pagamento 100% via PIX',
      durationDays: 3,
      targeting: {
        radiusKm: 5,
        category: 'Gastronomia',
        minLevel: 2
      }
    });

    expect(newCamp).toBeTruthy();
    expect(newCamp.id).toContain('camp-');
    expect(service.activeCampaign()?.id).toBe(newCamp.id);
    expect(service.activeCampaign()?.type).toBe('boost_job');
    expect(service.activeCampaign()?.status).toBe('active');
    expect(service.campaigns().length).toBeGreaterThanOrEqual(2);
  });

  it('should cancel an active campaign', () => {
    const active = service.activeCampaign();
    expect(active).toBeTruthy();

    if (active) {
      service.cancelCampaign(active.id);
      expect(service.hasActiveCampaign()).toBeFalse();
      expect(service.activeCampaign()).toBeNull();
      expect(service.currentMetrics().impressions).toBe(0);
    }
  });

  it('should update campaign metrics', () => {
    const active = service.activeCampaign();
    expect(active).toBeTruthy();

    if (active) {
      service.updateMetrics(active.id, { impressions: 15000, applicationsCount: 50 });
      expect(service.currentMetrics().impressions).toBe(15000);
      expect(service.currentMetrics().applicationsCount).toBe(50);
    }
  });
});
