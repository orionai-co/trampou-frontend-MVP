import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BoostCampaignModalComponent } from '../../src/app/features/company/components/boost-campaign-modal/boost-campaign-modal.component';
import { CampaignService } from '../../src/app/features/company/services/campaign.service';

describe('BoostCampaignModalComponent', () => {
  let component: BoostCampaignModalComponent;
  let fixture: ComponentFixture<BoostCampaignModalComponent>;
  let campaignService: CampaignService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BoostCampaignModalComponent],
      providers: [CampaignService]
    }).compileComponents();

    fixture = TestBed.createComponent(BoostCampaignModalComponent);
    component = fixture.componentInstance;
    campaignService = TestBed.inject(CampaignService);
    component.isOpen = true;
    fixture.detectChanges();
  });

  it('should create the BoostCampaignModalComponent', () => {
    expect(component).toBeTruthy();
  });

  it('should render campaign type options, radius pills and duration plans', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.textContent).toContain('Apresentar Empresa & Cultura');
    expect(compiled.textContent).toContain('Impulsionar Vagas Abertas');
    expect(compiled.textContent).toContain('5 km');
    expect(compiled.textContent).toContain('10 km');
    expect(compiled.textContent).toContain('3 Dias');
    expect(compiled.textContent).toContain('7 Dias');
    expect(compiled.textContent).toContain('14 Dias');
    expect(compiled.textContent).toContain('30 Dias');
  });

  it('should switch campaign type and update default headline', () => {
    component.selectType('boost_job');
    fixture.detectChanges();

    expect(component.selectedType()).toBe('boost_job');
    expect(component.headline()).toContain('Vagas urgentes');

    component.selectType('featured_company');
    fixture.detectChanges();

    expect(component.selectedType()).toBe('featured_company');
    expect(component.headline()).toContain('Conheça nossa megaestrutura');
  });

  it('should change duration and update selected plan and price', () => {
    component.selectDuration(14);
    fixture.detectChanges();

    expect(component.selectedDuration()).toBe(14);
    expect(component.selectedPlan().price).toBe(179);
    expect(fixture.nativeElement.textContent).toContain('179,00');
  });

  it('should change radius', () => {
    component.selectRadius(25);
    fixture.detectChanges();

    expect(component.selectedRadius()).toBe(25);
  });

  it('should select a different video', () => {
    component.selectVideo(1);
    fixture.detectChanges();

    expect(component.selectedVideoIndex()).toBe(1);
    expect(component.currentVideo().title).toContain('Salão, Bar & Ambientação');
  });

  it('should call campaignService.createCampaign and emit event when confirmed', () => {
    spyOn(component.campaignCreated, 'emit');
    spyOn(component.closed, 'emit');
    spyOn(campaignService, 'createCampaign').and.callThrough();

    component.confirmCampaign();

    expect(campaignService.createCampaign).toHaveBeenCalled();
    expect(component.campaignCreated.emit).toHaveBeenCalled();
    expect(component.closed.emit).toHaveBeenCalled();
  });
});
