import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { OpportunitiesFeedComponent } from '../../src/app/features/opportunities/opportunities-feed.component';
import { OpportunityService } from '../../src/app/features/opportunities/services/opportunity.service';
import { buildMatchBreakdownFromOpportunity } from '../../src/app/core/models/match-breakdown.model';
import { provideRouter } from '@angular/router';

describe('OpportunitiesFeedComponent', () => {
  let component: OpportunitiesFeedComponent;
  let fixture: ComponentFixture<OpportunitiesFeedComponent>;
  let service: OpportunityService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OpportunitiesFeedComponent],
      providers: [OpportunityService, provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(OpportunitiesFeedComponent);
    component = fixture.componentInstance;
    service = TestBed.inject(OpportunityService);
  });

  it('should create the OpportunitiesFeedComponent', () => {
    expect(component).toBeTruthy();
  });

  it('should start directly with tabs header without bulky top title bar', () => {
    fixture.detectChanges();
    const topBar = fixture.nativeElement.querySelector('.tp-timeline-top-bar');
    expect(topBar).toBeFalsy();

    const tabsHeader = fixture.nativeElement.querySelector('.tp-timeline-tabs-header');
    expect(tabsHeader).toBeTruthy();
  });

  it('should load opportunities on init', fakeAsync(() => {
    fixture.detectChanges();
    tick(300);
    fixture.detectChanges();

    expect(component.isLoading()).toBeFalse();
    expect(component.opportunities().length).toBeGreaterThanOrEqual(8);
  }));

  it('should open and close details modal', () => {
    const opp = service.opportunities()[0];
    component.openDetails(opp);
    expect(component.isModalOpen()).toBeTrue();
    expect(component.selectedOpportunity()).toEqual(opp);

    component.closeDetails();
    expect(component.isModalOpen()).toBeFalse();
    expect(component.selectedOpportunity()).toBeNull();
  });

  it('should open and close centralized match breakdown modal', () => {
    const opp = service.opportunities()[0];
    const matchData = buildMatchBreakdownFromOpportunity(opp);

    expect(component.selectedMatchData()).toBeNull();

    component.openMatchModal(matchData);
    fixture.detectChanges();

    expect(component.selectedMatchData()).toEqual(matchData);
    const modalEl = fixture.nativeElement.querySelector('tp-match-breakdown');
    expect(modalEl).toBeTruthy();
    expect(fixture.nativeElement.textContent).toContain('Por que esta vaga combina com você?');

    component.closeMatchModal();
    fixture.detectChanges();

    expect(component.selectedMatchData()).toBeNull();
    expect(fixture.nativeElement.querySelector('tp-match-breakdown')).toBeFalsy();
  });

  it('should switch timeline tabs correctly', fakeAsync(() => {
    fixture.detectChanges();
    tick(300);
    fixture.detectChanges();

    // Seleciona aba Urgentes
    component.onSelectTab('urgent');
    expect(component.activeTab()).toBe('urgent');
    expect(component.filters().onlyTodayOrUrgent).toBeTrue();
    tick(300);
    fixture.detectChanges();

    // Seleciona aba Mais Próximos
    component.onSelectTab('closest');
    expect(component.activeTab()).toBe('closest');
    expect(component.filters().sortBy).toBe('closest');
    tick(300);
    fixture.detectChanges();
  }));

  it('should reset all filters to default when resetAllFilters is called', fakeAsync(() => {
    fixture.detectChanges();
    tick(300);

    component.onSelectCategory('Gastronomia');
    expect(component.filters().category).toBe('Gastronomia');

    component.resetAllFilters();
    expect(component.filters().category).toBe('Todas');
    expect(component.activeTab()).toBe('for_you');
  }));

  it('should render featured company card interleaved in feed after second job card', fakeAsync(() => {
    fixture.detectChanges();
    tick(300);
    fixture.detectChanges();

    const featuredCard = fixture.nativeElement.querySelector('tp-featured-company-card');
    expect(featuredCard).toBeTruthy();
    expect(featuredCard.textContent).toContain('Buffet Espaço Paulista');
    expect(featuredCard.textContent).toContain('Patrocinado');
  }));
});
