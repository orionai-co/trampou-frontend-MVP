export interface CompanyReputationMetrics {
  averageRating: number; // Ex: 4.87
  totalReviews: number; // Ex: 84
  onTimePaymentRate: number; // Ex: 100% (Pagamentos no prazo via PIX)
  rehireReturnRate: number; // Ex: 96% (Profissionais que voltariam a trabalhar aqui)
  totalCompletedShifts: number; // Ex: 1284 turnos concluídos
  cancellationRate: number; // Ex: 0%
}

export interface CompanyMedia {
  videoUrl?: string;
  videoThumbnail: string;
  videoTitle: string;
  videoDuration: string;
  photos: string[]; // Fotos da estrutura, salão, cozinha e equipe
}

export interface CompanyPublicProfile {
  id: string;
  name: string;
  handle: string; // Ex: '@espacopaulista'
  logoUrl?: string;
  avatarInitials?: string;
  category: string; // Ex: 'Gastronomia & Eventos Corporativos'
  verified: boolean;
  location: {
    neighborhood: string;
    city: string;
    state: string;
    fullAddress?: string;
    distanceKm: number;
  };
  about: string; // História, infraestrutura e proposta
  cultureHighlights: string[]; // Ex: ['Uniforme e alimentação fornecidos no local', 'Equipe acolhedora e briefing claro', 'Repasse PIX pontual ao término do evento']
  reputation: CompanyReputationMetrics;
  media: CompanyMedia;
  isFavorited?: boolean;
  isFollowing?: boolean;
}

