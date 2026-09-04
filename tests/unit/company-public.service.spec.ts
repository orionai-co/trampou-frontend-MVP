import { TestBed } from '@angular/core/testing';
import { CompanyPublicService } from '../../src/app/features/company-profile/services/company-public.service';
import { OpportunityService } from '../../src/app/features/opportunities/services/opportunity.service';

describe('CompanyPublicService', () => {
  let service: CompanyPublicService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CompanyPublicService, OpportunityService]
    });
    service = TestBed.inject(CompanyPublicService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should retrieve company profile by ID', (done) => {
    service.getCompanyProfileById('comp-001').subscribe(profile => {
      expect(profile).toBeTruthy();
      expect(profile?.name).toBe('Buffet Espaço Paulista');
      expect(profile?.reputation.onTimePaymentRate).toBe(100);
      done();
    });
  });

  it('should retrieve company profile by slug or handle', (done) => {
    service.getCompanyProfileById('espacopaulista').subscribe(profile => {
      expect(profile).toBeTruthy();
      expect(profile?.id).toBe('comp-001');
      done();
    });
  });

  it('should toggle favorite status for a company', () => {
    expect(service.isFavorited('comp-001')).toBeFalse();

    service.toggleFavoriteCompany('comp-001');
    expect(service.isFavorited('comp-001')).toBeTrue();

    service.toggleFavoriteCompany('comp-001');
    expect(service.isFavorited('comp-001')).toBeFalse();
  });

  it('should toggle follow status for a company', () => {
    expect(service.isFollowing('comp-001')).toBeFalse();

    service.toggleFollowCompany('comp-001');
    expect(service.isFollowing('comp-001')).toBeTrue();

    service.toggleFollowCompany('comp-001');
    expect(service.isFollowing('comp-001')).toBeFalse();
  });

  it('should retrieve open jobs for a company', (done) => {
    service.getOpenJobsByCompanyId('comp-001', 'Buffet Espaço Paulista').subscribe(jobs => {
      expect(jobs).toBeTruthy();
      expect(jobs.length).toBeGreaterThan(0);
      done();
    });
  });
});
