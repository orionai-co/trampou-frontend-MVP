export interface CandidateReview {
  companyName: string;
  rating: number;
  comment: string;
  date: string;
  badge?: string;
}

export interface Candidate {
  id: string;
  name: string;
  avatarInitials: string;
  level: 1 | 2 | 3;
  rating: number;
  reviewsCount: number;
  matchPercentage: number;
  punctualityRate: number;
  pixKeyPreview: string;
  status: 'applied' | 'approved' | 'rejected';
  bio?: string;
  roleTitle?: string;
  location?: string;
  verified?: boolean;
  completedShiftsCount?: number;
  matchReasons?: string[];
  skills?: string[];
  recentReviews?: CandidateReview[];
}

export interface CompanyJob {
  id: string;
  title: string;
  category: string;
  location: {
    city: string;
    neighborhood: string;
    address: string;
  };
  date: string;
  schedule: {
    start: string;
    end: string;
    totalHours: number;
  };
  slots: {
    total: number;
    filled: number;
  };
  paymentAmount: number;
  requiredLevel: 1 | 2 | 3;
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  requirements: string[];
  candidates: Candidate[];
}

export interface CompanyMetrics {
  openJobs: number;
  candidatesUnderReview: number;
  completedShifts: number;
}
