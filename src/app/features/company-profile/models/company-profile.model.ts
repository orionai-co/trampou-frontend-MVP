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

export const MOCK_COMPANY_PUBLIC_PROFILES: CompanyPublicProfile[] = [
  {
    id: 'comp-001',
    name: 'Buffet Espaço Paulista',
    handle: '@espacopaulista',
    avatarInitials: 'EP',
    category: 'Gastronomia & Eventos Corporativos',
    verified: true,
    location: {
      neighborhood: 'Vila Olímpia',
      city: 'São Paulo',
      state: 'SP',
      fullAddress: 'Rua Funchal, 418 — Vila Olímpia, São Paulo - SP',
      distanceKm: 2.4
    },
    about:
      'Com mais de 15 anos de excelência no mercado paulistano de eventos de alto padrão, o Buffet Espaço Paulista realiza casamentos, congressos e coquetéis corporativos para até 1.000 pessoas. Nossa operação valoriza os profissionais sob demanda com infraestrutura completa de apoio, vestiários climatizados, refeição de qualidade e pagamento imediato ao término de cada turno.',
    cultureHighlights: [
      'Alimentação completa e vestiários equipados no local',
      'Briefing claro e alinhamento prévio com os líderes de salão',
      'Repasses 100% pontuais via PIX logo após o encerramento do evento',
      'Ambiente profissional e equipe com alta taxa de recontratação'
    ],
    reputation: {
      averageRating: 4.87,
      totalReviews: 84,
      onTimePaymentRate: 100,
      rehireReturnRate: 96,
      totalCompletedShifts: 1284,
      cancellationRate: 0
    },
    media: {
      videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
      videoThumbnail: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&auto=format&fit=crop&q=80',
      videoTitle: 'Bastidores & Estrutura Operacional — Buffet Espaço Paulista',
      videoDuration: '0:45',
      photos: [
        'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1578474846511-04ba529f0b88?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80'
      ]
    },
    isFavorited: false,
    isFollowing: false
  },
  {
    id: 'comp-002',
    name: 'SkyLounge Rooftop & Bar',
    handle: '@skylounge.sp',
    avatarInitials: 'SL',
    category: 'Bares & Coquetelaria Noturna',
    verified: true,
    location: {
      neighborhood: 'Itaim Bibi',
      city: 'São Paulo',
      state: 'SP',
      fullAddress: 'Av. Brigadeiro Faria Lima, 3477 — Itaim Bibi, São Paulo - SP',
      distanceKm: 3.8
    },
    about:
      'Localizado no coração financeiro de São Paulo, o SkyLounge combina coquetelaria autoral com vista panorâmica da cidade. Trabalhamos com eventos noturnos de alta energia e buscamos talentos em atendimento, bar e apoio operacional que prezem pela agilidade e cortesia.',
    cultureHighlights: [
      'Ambiente moderno com alta remuneração e gorjetas compartilhadas',
      'Treinamento rápido na abertura do turno com o head bartender',
      'PIX no encerramento do expediente sem burocracia'
    ],
    reputation: {
      averageRating: 4.82,
      totalReviews: 52,
      onTimePaymentRate: 100,
      rehireReturnRate: 94,
      totalCompletedShifts: 620,
      cancellationRate: 0
    },
    media: {
      videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
      videoThumbnail: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&auto=format&fit=crop&q=80',
      videoTitle: 'A Experiência de Salão e Bar — SkyLounge',
      videoDuration: '0:30',
      photos: [
        'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=800&auto=format&fit=crop&q=80'
      ]
    },
    isFavorited: false,
    isFollowing: false
  }
];
