import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { CompanyProfilePageComponent } from '../../src/app/features/company-profile/company-profile-page.component';
import { CompanyPublicService } from '../../src/app/features/company-profile/services/company-public.service';
import { OpportunityService } from '../../src/app/features/opportunities/services/opportunity.service';
import { MyJobsService } from '../../src/app/features/my-jobs/services/my-jobs.service';
import { ApiClientService } from '../../src/app/core/services/api-client.service';
import { provideRouter, ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';

describe('CompanyProfilePageComponent', () => {
  let component: CompanyProfilePageComponent;
  let fixture: ComponentFixture<CompanyProfilePageComponent>;
  let companyService: CompanyPublicService;
  let router: Router;

  const mockProfile: any = {
    id: 'comp-001',
    name: 'Buffet Espaço Paulista',
    handle: '@espacopaulista',
    avatarInitials: 'EP',
    category: 'Gastronomia & Eventos Corporativos',
    verified: true,
    location: {
      neighborhood: 'Vila Olímpia',
      city: 'São Paulo',
      state: 'SP',
      fullAddress: 'Rua Funchal, 418 — Vila Olímpia, São Paulo - SP',
      distanceKm: 2.4
    },
    about: 'Com mais de 15 anos de excelência.',
    cultureHighlights: ['Alimentação completa'],
    reputation: {
      averageRating: 4.87,
      totalReviews: 84,
      onTimePaymentRate: 100,
      rehireReturnRate: 96,
      totalCompletedShifts: 1284,
      cancellationRate: 0
    },
    media: {
      videoUrl: '',
      videoThumbnail: '',
      videoTitle: '',
      videoDuration: '',
      photos: []
    }
  };

  const mockJobs: any[] = [
    {
      id: 'opp-001',
      title: 'Garçom para Casamento',
      companyName: 'Buffet Espaço Paulista',
      companyRating: 4.9,
      companyReviewsCount: 84,
      category: 'Eventos',
      location: { city: 'São Paulo', neighborhood: 'Vila Olímpia', distanceKm: 2.4, address: 'Rua Funchal, 418' },
      date: 'Hoje',
      isToday: true,
      schedule: { start: '18:00', end: '01:00', totalHours: 7 },
      payment: { amount: 180, type: 'diaria', pixImmediate: true },
      requiredLevel: 2,
      matchPercentage: 98,
      status: 'urgency',
      spotsAvailable: 2,
      spotsTotal: 6,
      description: 'Atendimento em evento',
      requirements: []
    }
  ];

  beforeEach(async () => {
    const apiClientSpy = jasmine.createSpyObj('ApiClientService', ['get', 'post', 'put', 'delete']);
    apiClientSpy.get.and.returnValue(Promise.resolve(mockProfile));
    apiClientSpy.put.and.returnValue(Promise.resolve({ success: true }));

    await TestBed.configureTestingModule({
      imports: [CompanyProfilePageComponent],
      providers: [
        CompanyPublicService,
        OpportunityService,
        MyJobsService,
        { provide: ApiClientService, useValue: apiClientSpy },
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of({
              get: (key: string) => (key === 'id' ? 'comp-001' : null)
            })
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CompanyProfilePageComponent);
    component = fixture.componentInstance;
    companyService = TestBed.inject(CompanyPublicService);
    router = TestBed.inject(Router);

    spyOn(companyService, 'getCompanyProfileById').and.returnValue(of(mockProfile));
    spyOn(companyService, 'getOpenJobsByCompanyId').and.returnValue(of(mockJobs));
  });

  it('should create the CompanyProfilePageComponent', () => {
    expect(component).toBeTruthy();
  });

  it('should load company profile and open jobs on init', fakeAsync(() => {
    fixture.detectChanges();
    tick(600);
    fixture.detectChanges();

    expect(component.isLoading()).toBeFalse();
    expect(component.company()).toBeTruthy();
    expect(component.company()?.name).toBe('Buffet Espaço Paulista');
    expect(component.openJobs().length).toBeGreaterThan(0);
  }));

  it('should navigate back to opportunities feed when goBack is called', () => {
    spyOn(router, 'navigate');
    component.goBack();
    expect(router.navigate).toHaveBeenCalledWith(['/oportunidades']);
  });

  it('should toggle favorite and follow states', fakeAsync(() => {
    fixture.detectChanges();
    tick(600);

    expect(component.isFavorited()).toBeFalse();
    component.onToggleFavorite();
    expect(component.isFavorited()).toBeTrue();

    expect(component.isFollowing()).toBeFalse();
    component.onToggleFollow();
    expect(component.isFollowing()).toBeTrue();
  }));

  it('should open and close job details modal', fakeAsync(() => {
    fixture.detectChanges();
    tick(600);

    const firstJob = component.openJobs()[0];
    expect(firstJob).toBeTruthy();

    component.openJobDetails(firstJob);
    expect(component.isModalOpen()).toBeTrue();
    expect(component.selectedOpportunity()).toEqual(firstJob);

    component.closeJobDetails();
    expect(component.isModalOpen()).toBeFalse();
    expect(component.selectedOpportunity()).toBeNull();
  }));
});
