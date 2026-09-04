import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { CompanyProfilePageComponent } from '../../src/app/features/company-profile/company-profile-page.component';
import { CompanyPublicService } from '../../src/app/features/company-profile/services/company-public.service';
import { OpportunityService } from '../../src/app/features/opportunities/services/opportunity.service';
import { MyJobsService } from '../../src/app/features/my-jobs/services/my-jobs.service';
import { provideRouter, ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';

describe('CompanyProfilePageComponent', () => {
  let component: CompanyProfilePageComponent;
  let fixture: ComponentFixture<CompanyProfilePageComponent>;
  let companyService: CompanyPublicService;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompanyProfilePageComponent],
      providers: [
        CompanyPublicService,
        OpportunityService,
        MyJobsService,
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
