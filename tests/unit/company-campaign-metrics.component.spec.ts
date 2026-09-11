import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CompanyCampaignMetricsComponent } from '../../src/app/features/company/components/company-campaign-metrics/company-campaign-metrics.component';
import { CampaignService } from '../../src/app/features/company/services/campaign.service';
import { ApiClientService } from '../../src/app/core/services/api-client.service';

describe('CompanyCampaignMetricsComponent', () => {
  let component: CompanyCampaignMetricsComponent;
  let fixture: ComponentFixture<CompanyCampaignMetricsComponent>;
  let campaignService: CampaignService;

  beforeEach(async () => {
    const apiClientSpy = jasmine.createSpyObj('ApiClientService', ['get', 'post']);
    apiClientSpy.get.and.returnValue(Promise.resolve([]));
    apiClientSpy.post.and.returnValue(Promise.resolve({}));

    await TestBed.configureTestingModule({
      imports: [CompanyCampaignMetricsComponent],
      providers: [
        CampaignService,
        { provide: ApiClientService, useValue: apiClientSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CompanyCampaignMetricsComponent);
    component = fixture.componentInstance;
    campaignService = TestBed.inject(CampaignService);

    campaignService.createCampaign({
      title: 'Destaque Institucional — Buffet Espaço Paulista',
      headline: 'Conheça nossa megaestrutura gastronômica.',
      durationDays: 7,
      targeting: {
        radiusKm: 10,
        category: 'Gastronomia & Eventos',
        minLevel: 2
      }
    });

    const active = campaignService.activeCampaign();
    if (active) {
      campaignService.updateMetrics(active.id, {
        impressions: 12480,
        videoViews: 8230,
        profileVisits: 428,
        interestedCount: 87,
        applicationsCount: 31,
        spentAmount: 149
      });
    }

    fixture.detectChanges();
  });

  it('should create the CompanyCampaignMetricsComponent', () => {
    expect(component).toBeTruthy();
  });

  it('should display active campaign metrics correctly', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.textContent).toContain('Desempenho do Destaque Institucional');
    expect(compiled.textContent).toContain('Campanha Ativa');
    expect(compiled.textContent).toContain('12.480');
    expect(compiled.textContent).toContain('8.230');
    expect(compiled.textContent).toContain('428');
    expect(compiled.textContent).toContain('31');
  });

  it('should emit openBoostModal when boost button is clicked', () => {
    spyOn(component.openBoostModal, 'emit');

    const boostBtn = fixture.nativeElement.querySelector('.tp-boost-action-btn') as HTMLButtonElement;
    expect(boostBtn).toBeTruthy();
    boostBtn.click();

    expect(component.openBoostModal.emit).toHaveBeenCalled();
  });

  it('should show empty state when there is no active campaign', () => {
    const active = campaignService.activeCampaign();
    if (active) {
      campaignService.cancelCampaign(active.id);
      fixture.detectChanges();
    }

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Nenhuma campanha ativa');
    expect(compiled.textContent).toContain('Aumente em até 4x o volume de candidatos');
  });
});
