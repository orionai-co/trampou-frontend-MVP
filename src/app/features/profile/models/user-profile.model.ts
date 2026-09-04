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

export const INITIAL_USER_PROFILE: UserProfile = {
  id: 'usr-001',
  name: 'Matheus Silva',
  shortName: 'Matheus S.',
  email: 'matheus.silva@email.com',
  avatarInitials: 'MS',
  verified: true,
  isVerified: true,
  level: 2,
  levelLabel: 'Nível 2',
  rating: 4.9,
  totalReviews: 42,
  reviewsCount: 42,
  punctualityRate: 100,
  completedJobsCount: 42,
  location: {
    city: 'São Paulo',
    neighborhood: 'Pinheiros',
    state: 'SP'
  },
  status: 'available',
  statusLabel: 'Online & Disponível',
  primaryRole: 'Profissional para Eventos & Gastronomia',
  pixKey: {
    type: 'phone',
    key: '(11) 98765-4321'
  },
  skills: [
    'Garçom de Salão',
    'Recepção de Eventos',
    'Atendimento & Bar',
    'Operação de Caixa'
  ],
  reviews: [
    {
      id: 'rev-1',
      companyName: 'Buffet Fasano SP',
      rating: 5.0,
      comment: 'Excelente postura, agilidade no salão e pontualidade impecável em todo o serviço.',
      jobTitle: 'Garçom de Salão',
      date: '18 de Agosto, 2026'
    },
    {
      id: 'rev-2',
      companyName: 'Renaissance São Paulo Hotel',
      rating: 5.0,
      comment: 'Profissional muito educado e proativo no atendimento aos convidados do coquetel.',
      jobTitle: 'Recepção e Apoio',
      date: '12 de Agosto, 2026'
    },
    {
      id: 'rev-3',
      companyName: 'Bar Brahma Centro',
      rating: 4.8,
      comment: 'Muito pontual, trabalhou com energia positiva e cuidou bem do fechamento das mesas.',
      jobTitle: 'Atendente de Bar',
      date: '04 de Agosto, 2026'
    },
    {
      id: 'rev-4',
      companyName: 'Casa Traffô Eventos',
      rating: 5.0,
      comment: 'Impecável apresentação pessoal e facilidade para trabalhar em equipe sob alta demanda.',
      jobTitle: 'Garçom de Banquete',
      date: '28 de Julho, 2026'
    }
  ],
  careerLevel: {
    currentLevel: 2,
    levelName: 'Nível 2 — Experiente',
    nextLevelName: 'Nível 3 — Elite',
    currentPoints: 42,
    targetPoints: 50,
    benefitText: 'Faltam 8 turnos para o Nível 3. Profissionais Elite têm acesso prioritário a eventos corporativos de alto valor.'
  },
  reliability: {
    attendanceRate: 100,
    completedShifts: 42,
    cancellationRate: 0,
    avgResponseTime: '< 5 min'
  },
  achievements: [
    {
      id: 'ach-1',
      icon: 'zap',
      title: 'Top Pontualidade',
      description: '+20 turnos seguidos sem nenhum atraso registrado.',
      unlockedAt: 'Desbloqueado em Julho, 2026'
    },
    {
      id: 'ach-2',
      icon: 'award',
      title: 'Veterano do Salão',
      description: '+30 turnos concluídos no setor de Gastronomia.',
      unlockedAt: 'Desbloqueado em Junho, 2026'
    },
    {
      id: 'ach-3',
      icon: 'heart',
      title: 'Favorito dos Buffets',
      description: 'Recontratado por 3 ou mais empresas diferentes.',
      unlockedAt: 'Desbloqueado em Maio, 2026'
    },
    {
      id: 'ach-4',
      icon: 'shield-check',
      title: 'Presença Blindada',
      description: '0 cancelamentos em todo o histórico.',
      unlockedAt: 'Desbloqueado em Abril, 2026'
    }
  ]
};
