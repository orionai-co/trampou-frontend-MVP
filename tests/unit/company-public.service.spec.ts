import { TestBed } from '@angular/core/testing';
import { CompanyPublicService } from '../../src/app/features/company-profile/services/company-public.service';
import { ApiClientService } from '../../src/app/core/services/api-client.service';
import { CompanyPublicProfile } from '../../src/app/features/company-profile/models/company-profile.model';

describe('CompanyPublicService', () => {
  let service: CompanyPublicService;
  let apiClientSpy: jasmine.SpyObj<ApiClientService>;

  const mockProfile: CompanyPublicProfile = {
    id: 'comp-001',
    name: 'Buffet Espaço Paulista',
    handle: '@espacopaulista',
    category: 'Gastronomia',
    verified: true,
    location: {
      neighborhood: 'Vila Olímpia',
      city: 'São Paulo',
      state: 'SP',
      fullAddress: 'Rua Funchal, 418',
      distanceKm: 2.4
    },
    about: 'Buffet de alta gastronomia.',
    cultureHighlights: ['Ambiente acolhedor'],
    reputation: {
      averageRating: 4.9,
      totalReviews: 84,
      onTimePaymentRate: 100,
      rehireReturnRate: 96,
      totalCompletedShifts: 120,
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

  beforeEach(() => {
    apiClientSpy = jasmine.createSpyObj('ApiClientService', ['get', 'post', 'put', 'delete']);
    (apiClientSpy.get.and.callFake as any)((url: string) => {
      if (url.includes('/jobs')) {
        return Promise.resolve([{ id: 'opp-001', title: 'Garçom', companyName: 'Buffet Espaço Paulista' }]);
      }
      return Promise.resolve(mockProfile);
    });
    apiClientSpy.put.and.returnValue(Promise.resolve({ success: true }));

    TestBed.configureTestingModule({
      providers: [
        CompanyPublicService,
        { provide: ApiClientService, useValue: apiClientSpy }
      ]
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

  it('should toggle favorite status for a company', async () => {
    expect(service.isFavorited('comp-001')).toBeFalse();

    await service.toggleFavoriteCompany('comp-001');
    expect(service.isFavorited('comp-001')).toBeTrue();

    await service.toggleFavoriteCompany('comp-001');
    expect(service.isFavorited('comp-001')).toBeFalse();
  });

  it('should toggle follow status for a company', async () => {
    expect(service.isFollowing('comp-001')).toBeFalse();

    await service.toggleFollowCompany('comp-001');
    expect(service.isFollowing('comp-001')).toBeTrue();

    await service.toggleFollowCompany('comp-001');
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
