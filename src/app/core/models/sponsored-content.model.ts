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
  videoThumbnail: string; // Imagem representativa do ambiente/vídeo institucional
  videoDurationText?: string; // Ex: '0:45'
  location: string; // Ex: 'Vila Olímpia, São Paulo'
  distanceKm: number; // Ex: 2.4
  completedShiftsCount: number; // Ex: 84 turnos realizados
  matchScore: number; // Ex: 94% (calculado organicamente com base nas preferências)
  matchReasons: string[]; // Ex: ['Localização próxima', 'Turnos no setor de Gastronomia', 'Pagamento pontual via PIX']
  openJobsCount: number; // Ex: 3 vagas abertas
}

export const MOCK_FEATURED_COMPANIES: FeaturedCompany[] = [
  {
    id: 'feat-comp-01',
    companyId: 'comp-001',
    companyName: 'Buffet Espaço Paulista',
    companyHandle: '@espacopaulista',
    avatarInitials: 'EP',
    verified: true,
    rating: 4.9,
    reviewCount: 84,
    badgeLabel: 'Patrocinado',
    headline: 'Conheça nossa megaestrutura gastronômica, nossa equipe e como é trabalhar nos maiores eventos de SP.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-restaurant-kitchen-staff-working-42998-large.mp4',
    videoThumbnail: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop&q=80',
    videoDurationText: '0:45',
    location: 'Vila Olímpia, São Paulo',
    distanceKm: 2.4,
    completedShiftsCount: 84,
    matchScore: 96,
    matchReasons: [
      'Localização próxima (2.4 km)',
      'Setor de Gastronomia & Eventos',
      '100% Repasses via PIX no prazo'
    ],
    openJobsCount: 3
  },
  {
    id: 'feat-comp-02',
    companyId: 'comp-002',
    companyName: 'SkyLounge Rooftop & Bar',
    companyHandle: '@skylounge.sp',
    avatarInitials: 'SL',
    verified: true,
    rating: 4.8,
    reviewCount: 52,
    badgeLabel: 'Empresa em Destaque',
    headline: 'Ambiente dinâmico com alta demanda para bartenders, garçons e equipe de salão.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-restaurant-kitchen-staff-working-42998-large.mp4',
    videoThumbnail: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80',
    videoDurationText: '0:30',
    location: 'Itaim Bibi, São Paulo',
    distanceKm: 3.8,
    completedShiftsCount: 52,
    matchScore: 92,
    matchReasons: [
      'Compatível com suas habilidades de Bar',
      'Avaliações 5 estrelas da equipe',
      'Vagas abertas com diárias de até R$ 220'
    ],
    openJobsCount: 2
  }
];
