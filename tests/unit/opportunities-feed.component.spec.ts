import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { OpportunitiesFeedComponent } from '../../src/app/features/opportunities/opportunities-feed.component';
import { OpportunityService } from '../../src/app/features/opportunities/services/opportunity.service';
import { ApiClientService } from '../../src/app/core/services/api-client.service';
import { buildMatchBreakdownFromOpportunity } from '../../src/app/core/models/match-breakdown.model';
import { Opportunity } from '../../src/app/features/opportunities/models/opportunity.model';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

describe('OpportunitiesFeedComponent', () => {
  let component: OpportunitiesFeedComponent;
  let fixture: ComponentFixture<OpportunitiesFeedComponent>;
  let service: OpportunityService;

  const mockList: Opportunity[] = Array.from({ length: 8 }, (_, i) => ({
    id: `opp-${i + 1}`,
    title: i === 0 ? 'Garçom para Casamento e Buffet Noturno' : `Vaga ${i + 1}`,
    companyName: 'Buffet Espaço Paulista',
    companyRating: 4.9,
    companyReviewsCount: 84,
    category: i % 2 === 0 ? 'Eventos' : 'Gastronomia',
    location: {
      city: 'São Paulo',
      neighborhood: 'Vila Olímpia',
      distanceKm: 2.4,
      address: 'Rua Funchal, 418'
    },
    date: 'Hoje',
    isToday: true,
    schedule: { start: '18:00', end: '01:00', totalHours: 7 },
    payment: { amount: 180, type: 'diaria', pixImmediate: true },
    requiredLevel: 2,
    matchPercentage: 98,
    status: 'available',
    spotsAvailable: 2,
    spotsTotal: 6,
    description: 'Atendimento operacional.',
    requirements: []
  }));

  beforeEach(async () => {
    const apiClientSpy = jasmine.createSpyObj('ApiClientService', ['get', 'post', 'delete']);
    (apiClientSpy.get.and.callFake as any)((url: string) => {
      if (url.includes('/companies/featured')) {
        return Promise.resolve([
          {
            id: 'feat-comp-01',
            companyId: 'comp-001',
            companyName: 'Buffet Espaço Paulista',
            companyHandle: '@espacopaulista',
            avatarInitials: 'EP',
            verified: true,
            rating: 4.9,
            reviewCount: 84,
            badgeLabel: 'Patrocinado',
            headline: 'Conheça nossa megaestrutura gastronômica.',
            videoUrl: '',
            videoThumbnail: '',
            location: 'Vila Olímpia, São Paulo',
            distanceKm: 2.4,
            completedShiftsCount: 84,
            matchScore: 96,
            matchReasons: [],
            openJobsCount: 3
          }
        ]);
      }
      return Promise.resolve(mockList);
    });

    await TestBed.configureTestingModule({
      imports: [OpportunitiesFeedComponent],
      providers: [
        OpportunityService,
        { provide: ApiClientService, useValue: apiClientSpy },
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(OpportunitiesFeedComponent);
    component = fixture.componentInstance;
    service = TestBed.inject(OpportunityService);
    localStorage.clear();

    spyOn(service, 'getOpportunities').and.callFake(() => {
      (service as any).opportunitiesState.set(mockList);
      return of(mockList);
    });
  });

  afterEach(() => {
    localStorage.clear();
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
    fixture.detectChanges();
    const opp = service.opportunities()[0];
    component.openDetails(opp);
    expect(component.isModalOpen()).toBeTrue();
    expect(component.selectedOpportunity()).toEqual(opp);

    component.closeDetails();
    expect(component.isModalOpen()).toBeFalse();
    expect(component.selectedOpportunity()).toBeNull();
  });

  it('should open and close centralized match breakdown modal', () => {
    fixture.detectChanges();
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

  it('should render featured company card at the top of the feed', fakeAsync(() => {
    fixture.detectChanges();
    tick(300);
    fixture.detectChanges();

    const sectionEl = fixture.nativeElement.querySelector('.tp-feed-cards-list');
    expect(sectionEl).toBeTruthy();
    const firstChild = sectionEl.children[0];
    expect(firstChild.tagName.toLowerCase()).toBe('tp-featured-company-card');
    expect(firstChild.textContent).toContain('Buffet Espaço Paulista');
    expect(firstChild.textContent).toContain('Patrocinado');
  }));

  it('should reactively update featured company card on trampou:boost-updated event', fakeAsync(() => {
    fixture.detectChanges();
    tick(300);

    const newBoostItem = {
      id: 'camp-reactive-123',
      companyId: 'comp-999',
      companyName: 'Bistrô Paris 6',
      objective: 'featured_company',
      headline: 'Nova campanha ativada em tempo real!',
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-restaurant-kitchen-staff-working-42998-large.mp4',
      radiusKm: 15,
      days: 7,
      price: 99,
      active: true,
      createdAt: new Date().toISOString()
    };
    localStorage.setItem('trampou_boost_campaigns', JSON.stringify([newBoostItem]));
    window.dispatchEvent(new CustomEvent('trampou:boost-updated', { detail: newBoostItem }));

    tick(100);
    fixture.detectChanges();

    const featuredCard = fixture.nativeElement.querySelector('tp-featured-company-card');
    expect(featuredCard).toBeTruthy();
    expect(featuredCard.textContent).toContain('Bistrô Paris 6');
    expect(featuredCard.textContent).toContain('Nova campanha ativada em tempo real!');
  }));
});
