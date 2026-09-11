export type JobApplicationStatus = 'accepted' | 'pending' | 'completed' | 'cancelled';

export interface JobLocation {
  city: string;
  neighborhood: string;
  address?: string;
  mapUrl?: string;
  distanceKm?: number;
}

export interface JobSchedule {
  start: string;
  end: string;
  totalHours: number;
}

export interface JobPayment {
  amount: number;
  type: string;
  pixImmediate: boolean;
  paidAt?: Date | string;
  receiptId?: string;
  pixKeyType?: string;
}

export const TRAMPOU_APPLICATIONS_STORAGE_KEY = 'trampou_user_applications';

export interface JobApplication {
  id: string;
  opportunityId: string;
  title: string;
  opportunityTitle?: string;
  companyName: string;
  companyId?: string;
  candidateId?: string;
  candidateName?: string;
  candidateAvatar?: string;
  remuneration?: number;
  companyRating?: number;
  category: string;
  location: JobLocation;
  date: string;
  isToday?: boolean;
  schedule: JobSchedule;
  payment: JobPayment;
  status: JobApplicationStatus;
  appliedAt: Date | string;
  responseTimeRemaining?: string;
  checkInStatus?: 'pending' | 'checked_in';
  checkInTime?: string;
  instructions?: string[];
  contactPhone?: string;
}
