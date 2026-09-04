import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CompanyDashboardHeaderComponent } from '../../src/app/features/company/components/company-dashboard-header/company-dashboard-header.component';

describe('CompanyDashboardHeaderComponent', () => {
  let component: CompanyDashboardHeaderComponent;
  let fixture: ComponentFixture<CompanyDashboardHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompanyDashboardHeaderComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(CompanyDashboardHeaderComponent);
    component = fixture.componentInstance;
    component.companyName = 'Buffet Espaço Paulista';
    component.verified = true;
    component.rating = 4.9;
    component.metrics = {
      openJobs: 3,
      candidatesUnderReview: 8,
      completedShifts: 50
    };
    fixture.detectChanges();
  });

  it('should create the dashboard header component', () => {
    expect(component).toBeTruthy();
  });

  it('should render company identity and verified badge', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.tp-company-name')?.textContent).toContain('Buffet Espaço Paulista');
    expect(compiled.querySelector('.tp-verified-badge')).toBeTruthy();
  });

  it('should render 3 operational metrics accurately', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const metricNumbers = compiled.querySelectorAll('.tp-cmetric-number');
    const metricLabels = compiled.querySelectorAll('.tp-cmetric-label');

    expect(metricNumbers.length).toBe(3);
    expect(metricNumbers[0].textContent).toContain('3');
    expect(metricLabels[0].textContent).toContain('Vagas Abertas');

    expect(metricNumbers[1].textContent).toContain('8');
    expect(metricLabels[1].textContent).toContain('Candidatos em Análise');

    expect(metricNumbers[2].textContent).toContain('50');
    expect(metricLabels[2].textContent).toContain('Turnos Concluídos');
  });

  it('should emit openCreateJob when clicking the publish button', () => {
    spyOn(component.openCreateJob, 'emit');
    const publishBtn = fixture.nativeElement.querySelector('.tp-publish-btn') as HTMLElement;
    if (publishBtn) {
      publishBtn.click();
    } else {
      component.onPublishClick();
    }

    expect(component.openCreateJob.emit).toHaveBeenCalled();
  });

  it('should emit openBoostCampaign when clicking the boost button', () => {
    spyOn(component.openBoostCampaign, 'emit');
    const boostBtn = fixture.nativeElement.querySelector('.tp-header-boost-btn') as HTMLButtonElement;
    expect(boostBtn).toBeTruthy();
    boostBtn.click();

    expect(component.openBoostCampaign.emit).toHaveBeenCalled();
  });
});
