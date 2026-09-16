export interface FeaturedCompany {
  id: string;
  companyId: string;
  companyName: string;
  companyHandle: string; // Ex: '@espacopaulista'
  avatarUrl?: string;
  avatarInitials?: string;
  verified: boolean;
  rating: number; // Ex: 4.9
  reviewCount: number; // Ex: 84
  badgeLabel: 'Patrocinado' | 'Empresa em Destaque';
  headline: string; // Ex: 'Conheça nosso espaço, nossa equipe e como é trabalhar conosco.'
  videoUrl?: string;
  videoFileName?: string;
  videoStorageKey?: string;
  videoThumbnail: string; // Imagem representativa do ambiente/vídeo institucional
  videoDurationText?: string; // Ex: '0:45'
  location: string; // Ex: 'Vila Olímpia, São Paulo'
  distanceKm: number; // Ex: 2.4
  completedShiftsCount: number; // Ex: 84 turnos realizados
  matchScore: number; // Ex: 94% (calculado organicamente com base nas preferências)
  matchReasons: string[]; // Ex: ['Localização próxima', 'Turnos no setor de Gastronomia', 'Pagamento pontual via PIX']
  openJobsCount: number; // Ex: 3 vagas abertas
}

