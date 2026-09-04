import { TestBed } from '@angular/core/testing';
import { RatingService } from '../../src/app/core/services/rating.service';
import { UserProfileService } from '../../src/app/core/services/user-profile.service';
import { CompanyService } from '../../src/app/features/company/services/company.service';

describe('RatingService', () => {
  let service: RatingService;
  let userProfileService: UserProfileService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RatingService, UserProfileService, CompanyService]
    });
    service = TestBed.inject(RatingService);
    userProfileService = TestBed.inject(UserProfileService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should load initial reviews', () => {
    expect(service.reviews().length).toBeGreaterThan(0);
  });

  it('should submit a review for freelancer and update user profile rating', () => {
    const initialCount = service.reviews().length;
    const initialProfileReviews = userProfileService.currentUser().reviewsCount || 42;

    const review = service.submitReview({
      shiftId: 'shift-test-1',
      shiftTitle: 'Garçom para Casamento',
      reviewerRole: 'company',
      reviewerName: 'Buffet Espaço Paulista',
      targetId: 'user-freelancer-1',
      targetName: 'Matheus Silva',
      rating: 5,
      tags: ['Pontual', 'Proativo', 'Uniforme Completo'],
      comment: 'Excelente desempenho!'
    });

    expect(review.id).toBeTruthy();
    expect(service.reviews().length).toBe(initialCount + 1);
    expect(userProfileService.currentUser().reviewsCount).toBe(initialProfileReviews + 1);
    expect(service.hasReviewed('shift-test-1', 'company')).toBeTrue();
  });

  it('should submit a review for company by freelancer', () => {
    const initialCount = service.reviews().length;

    const review = service.submitReview({
      shiftId: 'shift-test-2',
      shiftTitle: 'Recepcionista',
      reviewerRole: 'freelancer',
      reviewerName: 'Matheus Silva',
      targetId: 'comp-1',
      targetName: 'Buffet Espaço Paulista',
      rating: 5,
      tags: ['Pagamento Rápido', 'Ambiente Respeitoso'],
      comment: 'Empresa pontual e equipe muito receptiva.'
    });

    expect(review.id).toBeTruthy();
    expect(service.reviews().length).toBe(initialCount + 1);
    expect(service.hasReviewed('shift-test-2', 'freelancer')).toBeTrue();
  });
});
