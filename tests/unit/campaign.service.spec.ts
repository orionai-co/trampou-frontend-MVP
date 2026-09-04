import { TestBed } from '@angular/core/testing';
import { CampaignService } from '../../src/app/features/company/services/campaign.service';
import { SponsoredCampaign } from '../../src/app/core/models/sponsored-campaign.model';

describe('CampaignService', () => {
  let service: CampaignService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CampaignService]
    });
    service = TestBed.inject(CampaignService);
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
