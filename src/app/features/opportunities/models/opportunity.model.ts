export type OpportunityCategory =
  | 'Todas'
  | 'Eventos'
  | 'Gastronomia'
  | 'Atendimento'
  | 'Logística'
  | 'Operacional';

export type OpportunityStatus = 'available' | 'urgency' | 'filled';

export type PaymentType = 'diaria' | 'hora' | 'tarefa';

export type SortOption = 'highest_match' | 'highest_pay' | 'closest';

export interface OpportunityLocation {
  city: string;
  neighborhood: string;
  distanceKm: number;
  address?: string;
}

export interface OpportunitySchedule {
  start: string;
  end: string;
  totalHours: number;
}

export interface OpportunityPayment {
  amount: number;
  type: PaymentType;
  pixImmediate: boolean;
}

export interface Opportunity {
  id: string;
  companyId?: string;
  title: string;
  companyName: string;
  companyRating: number;
  companyReviewsCount?: number;
  category: OpportunityCategory;
  location: OpportunityLocation;
  date: string;
  isToday?: boolean;
  schedule: OpportunitySchedule;
  payment: OpportunityPayment;
  requiredLevel: 1 | 2 | 3;
  matchPercentage: number;
  status: OpportunityStatus;
  description: string;
  requirements: string[];
  spotsAvailable: number;
  spotsTotal: number;
  applied?: boolean;
  appliedAt?: Date;
}

export interface OpportunityFilters {
  searchQuery?: string;
  category?: OpportunityCategory;
  maxDistanceKm?: number;
  onlyTodayOrUrgent?: boolean;
  sortBy?: SortOption;
}
