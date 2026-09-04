import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CompanyCampaignMetricsComponent } from '../../src/app/features/company/components/company-campaign-metrics/company-campaign-metrics.component';
import { CampaignService } from '../../src/app/features/company/services/campaign.service';

describe('CompanyCampaignMetricsComponent', () => {
  let component: CompanyCampaignMetricsComponent;
  let fixture: ComponentFixture<CompanyCampaignMetricsComponent>;
  let campaignService: CampaignService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompanyCampaignMetricsComponent],
      providers: [CampaignService]
    }).compileComponents();

    fixture = TestBed.createComponent(CompanyCampaignMetricsComponent);
    component = fixture.componentInstance;
    campaignService = TestBed.inject(CampaignService);
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
