export type PixKeyType = 'cpf' | 'email' | 'phone' | 'random';

export interface PixKeyConfig {
  type: PixKeyType;
  key: string;
}

export interface UserReview {
  id: string;
  companyName: string;
  rating: number;
  comment: string;
  jobTitle: string;
  date: string;
}

export interface UserLocation {
  city: string;
  neighborhood: string;
  state?: string;
}

export interface UserSkill {
  role: string;
  levelName: string;
  variant: 'brand' | 'accent' | 'neutral';
}

export interface UserAchievement {
  id: string;
  icon: string;
  title: string;
  description: string;
  unlockedAt: string;
}

export interface UserCareerLevel {
  currentLevel: number;
  levelName: string; // Ex: 'Nível 2 — Experiente'
  nextLevelName: string; // Ex: 'Nível 3 — Elite'
  currentPoints: number; // Ex: 42
  targetPoints: number; // Ex: 50
  benefitText: string; // Ex: 'Nível 3 desbloqueia prioridade em vagas de alto valor (R$ 200+/dia).'
}

export interface ReliabilityMetrics {
  attendanceRate: number; // 100%
  completedShifts: number; // 42
  cancellationRate: number; // 0%
  avgResponseTime: string; // '< 5 min'
}

export interface UserProfile {
  id: string;
  name: string;
  shortName?: string;
  avatarInitials: string;
  email?: string;
  role?: 'professional' | 'contractor';
  verified: boolean;
  isVerified?: boolean;
  level: 1 | 2 | 3;
  levelLabel?: string;
  rating: number;
  totalReviews: number;
  reviewsCount?: number;
  punctualityRate: number;
  completedJobsCount: number;
  location: UserLocation;
  status?: 'available' | 'busy' | 'offline';
  statusLabel?: string;
  primaryRole?: string;
  pixKey: PixKeyConfig;
  skills: string[];
  reviews: UserReview[];
  careerLevel?: UserCareerLevel;
  reliability?: ReliabilityMetrics;
  achievements?: UserAchievement[];
}

export const EMPTY_USER_PROFILE: UserProfile = {
  id: '',
  name: '',
  shortName: '',
  email: '',
  role: 'professional',
  avatarInitials: '',
  verified: false,
  isVerified: false,
  level: 1,
  levelLabel: 'Nível 1',
  rating: 0,
  totalReviews: 0,
  reviewsCount: 0,
  punctualityRate: 0,
  completedJobsCount: 0,
  location: {
    city: '',
    neighborhood: '',
    state: ''
  },
  status: 'available',
  statusLabel: 'Online',
  primaryRole: '',
  pixKey: {
    type: 'phone',
    key: ''
  },
  skills: [],
  reviews: [],
  careerLevel: {
    currentLevel: 1,
    levelName: 'Nível 1 — Iniciante',
    nextLevelName: 'Nível 2 — Experiente',
    currentPoints: 0,
    targetPoints: 20,
    benefitText: 'Complete turnos para avançar de nível e desbloquear novas oportunidades.'
  },
  reliability: {
    attendanceRate: 0,
    completedShifts: 0,
    cancellationRate: 0,
    avgResponseTime: '-'
  },
  achievements: []
};

export const INITIAL_USER_PROFILE = EMPTY_USER_PROFILE;
