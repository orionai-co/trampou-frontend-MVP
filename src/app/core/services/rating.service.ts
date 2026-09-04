import { Injectable, signal, computed, inject } from '@angular/core';
import { UserProfileService } from './user-profile.service';
import { CompanyService } from '../../features/company/services/company.service';

export interface ReviewSubmission {
  id: string;
  shiftId: string;
  shiftTitle: string;
  reviewerRole: 'company' | 'freelancer';
  reviewerName: string;
  targetId: string;
  targetName: string;
  rating: number;
  tags: string[];
  comment?: string;
  submittedAt: string;
}

const INITIAL_MOCK_REVIEWS: ReviewSubmission[] = [
  {
    id: 'rev-001',
    shiftId: 'app-005',
    shiftTitle: 'Auxiliar de Salão / Cumim para Jantar',
    reviewerRole: 'company',
    reviewerName: 'Restaurante Terraço Jardins',
    targetId: 'user-freelancer-1',
    targetName: 'Matheus Silva',
    rating: 5,
    tags: ['Pontual', 'Proativo', 'Uniforme Completo'],
    comment: 'Excelente profissional, atencioso com a equipe e impecável na apresentação.',
    submittedAt: '20/08/2026'
  },
  {
    id: 'rev-002',
    shiftId: 'app-005',
    shiftTitle: 'Auxiliar de Salão / Cumim para Jantar',
    reviewerRole: 'freelancer',
    reviewerName: 'Matheus Silva',
    targetId: 'comp-terraco',
    targetName: 'Restaurante Terraço Jardins',
    rating: 5,
    tags: ['Pagamento Rápido', 'Ambiente Respeitoso', 'Alimentação no Local'],
    comment: 'Ambiente muito bom para trabalhar e repasse via PIX feito no mesmo instante.',
    submittedAt: '20/08/2026'
  }
];

@Injectable({
  providedIn: 'root'
})
export class RatingService {
  private readonly userProfileService = inject(UserProfileService);
  private readonly companyService = inject(CompanyService);

  private readonly _reviews = signal<ReviewSubmission[]>(INITIAL_MOCK_REVIEWS);
  readonly reviews = this._reviews.asReadonly();

  readonly totalReviewsCount = computed(() => this._reviews().length);

  readonly freelancerAverageRating = computed(() => {
    const list = this._reviews().filter(r => r.reviewerRole === 'company');
    if (list.length === 0) return 4.9;
    const sum = list.reduce((acc, r) => acc + r.rating, 0);
    return Number((sum / list.length).toFixed(1));
  });

  submitReview(params: {
    shiftId: string;
    shiftTitle: string;
    reviewerRole: 'company' | 'freelancer';
    reviewerName: string;
    targetId: string;
    targetName: string;
    rating: number;
    tags: string[];
    comment?: string;
  }): ReviewSubmission {
    const newReview: ReviewSubmission = {
      id: `rev-${Date.now()}`,
      shiftId: params.shiftId,
      shiftTitle: params.shiftTitle,
      reviewerRole: params.reviewerRole,
      reviewerName: params.reviewerName,
      targetId: params.targetId,
      targetName: params.targetName,
      rating: params.rating,
      tags: params.tags,
      comment: params.comment,
      submittedAt: new Date().toLocaleDateString('pt-BR')
    };

    this._reviews.update(list => [newReview, ...list]);

    // Recálculo reativo se a avaliação foi para o Freelancer
    if (params.reviewerRole === 'company') {
      const currentReviews = this.userProfileService.currentUser().reviewsCount || 42;
      this.userProfileService.updateProfile({
        rating: this.freelancerAverageRating(),
        reviewsCount: currentReviews + 1
      });
    }

    return newReview;
  }

  hasReviewed(shiftId: string, reviewerRole: 'company' | 'freelancer'): boolean {
    return this._reviews().some(r => r.shiftId === shiftId && r.reviewerRole === reviewerRole);
  }

  getReview(shiftId: string, reviewerRole: 'company' | 'freelancer'): ReviewSubmission | undefined {
    return this._reviews().find(r => r.shiftId === shiftId && r.reviewerRole === reviewerRole);
  }
}
