import { Injectable, signal, computed } from '@angular/core';
import { Observable, of, delay, tap, map } from 'rxjs';
import {
  Opportunity,
  OpportunityFilters,
  OpportunityCategory
} from '../models/opportunity.model';
import {
  FeaturedCompany,
  MOCK_FEATURED_COMPANIES
} from '../../../core/models/sponsored-content.model';

const INITIAL_MOCK_OPPORTUNITIES: Opportunity[] = [
  {
    id: 'opp-001',
    title: 'Garçom para Casamento e Buffet Noturno',
    companyName: 'Buffet Espaço Paulista',
    companyRating: 4.9,
    companyReviewsCount: 84,
    category: 'Eventos',
    location: {
      city: 'São Paulo',
      neighborhood: 'Vila Olímpia',
      distanceKm: 2.4,
      address: 'Rua Funchal, 418'
    },
    date: 'Hoje',
    isToday: true,
    schedule: {
      start: '18:00',
      end: '01:00',
      totalHours: 7
    },
    payment: {
      amount: 180,
      type: 'diaria',
      pixImmediate: true
    },
    requiredLevel: 2,
    matchPercentage: 98,
    status: 'urgency',
    spotsAvailable: 2,
    spotsTotal: 6,
    description:
      'Atendimento em evento social formal (casamento para 250 convidados). Serviço volante de canapés, bebidas e empratado.',
    requirements: [
      'Traje social completo (camisa branca social, calça preta e sapato social preto)',
      'Experiência prévia com serviço de bandeja e postura em eventos formais',
      'Pontualidade estrita para alinhamento e briefing da equipe às 17h45'
    ]
  },
  {
    id: 'opp-002',
    title: 'Auxiliar de Bar e Coquetelaria',
    companyName: 'SkyLounge Rooftop',
    companyRating: 4.8,
    companyReviewsCount: 52,
    category: 'Gastronomia',
    location: {
      city: 'São Paulo',
      neighborhood: 'Itaim Bibi',
      distanceKm: 3.8,
      address: 'Av. Brigadeiro Faria Lima, 3477'
    },
    date: 'Hoje',
    isToday: true,
    schedule: {
      start: '19:00',
      end: '02:00',
      totalHours: 7
    },
    payment: {
      amount: 160,
      type: 'diaria',
      pixImmediate: true
    },
    requiredLevel: 2,
    matchPercentage: 94,
    status: 'available',
    spotsAvailable: 1,
    spotsTotal: 3,
    description:
      'Apoio aos bartenders principais, preparo prévio de insumos (gelo, frutas, xaropes), corte de guarnições e reposição de copos higienizados.',
    requirements: [
      'Agilidade em ambiente de alto fluxo',
      'Camisa ou camiseta preta lisa sem estampas',
      'Noções básicas de manipulação de alimentos e higiene'
    ]
  },
  {
    id: 'opp-003',
    title: 'Recepcionista e Credenciamento de Feira',
    companyName: 'Expo Tech & Inovação 2026',
    companyRating: 4.9,
    companyReviewsCount: 112,
    category: 'Eventos',
    location: {
      city: 'São Paulo',
      neighborhood: 'Santana',
      distanceKm: 7.2,
      address: 'Rua José Bernardo Pinto, 333 (Expo Center Norte)'
    },
    date: 'Amanhã',
    isToday: false,
    schedule: {
      start: '08:00',
      end: '17:00',
      totalHours: 9
    },
    payment: {
      amount: 150,
      type: 'diaria',
      pixImmediate: true
    },
    requiredLevel: 1,
    matchPercentage: 92,
    status: 'available',
    spotsAvailable: 4,
    spotsTotal: 10,
    description:
      'Recepção de visitantes corporativos, leitura de QR Codes no aplicativo de credenciamento e entrega de crachás e kits de boas-vindas.',
    requirements: [
      'Excelente comunicação verbal e cordialidade',
      'Facilidade com uso de tablets / leitores digitais',
      'Roupa social / esporte fino neutro'
    ]
  },
  {
    id: 'opp-004',
    title: 'Operador de Caixa para Festival Gastronômico',
    companyName: 'Street Gourmet Eventos',
    companyRating: 4.7,
    companyReviewsCount: 39,
    category: 'Atendimento',
    location: {
      city: 'São Paulo',
      neighborhood: 'Pinheiros',
      distanceKm: 4.1,
      address: 'Praça Benedito Calixto, 85'
    },
    date: 'Hoje',
    isToday: true,
    schedule: {
      start: '12:00',
      end: '22:00',
      totalHours: 10
    },
    payment: {
      amount: 170,
      type: 'diaria',
      pixImmediate: true
    },
    requiredLevel: 2,
    matchPercentage: 96,
    status: 'urgency',
    spotsAvailable: 1,
    spotsTotal: 4,
    description:
      'Operação de sistema POS móvel (maquininhas de cartão e sistema cashless), registro de pedidos de fichas e fechamento do caixa no término.',
    requirements: [
      'Experiência prévia com operação de maquininhas de cartão',
      'Atenção com troco e pagamentos digitais',
      'Disponibilidade para turno integral com intervalo de 1h'
    ]
  },
  {
    id: 'opp-005',
    title: 'Auxiliar de Montagem e Estrutura de Palco',
    companyName: 'Live Pro Produções',
    companyRating: 4.6,
    companyReviewsCount: 28,
    category: 'Operacional',
    location: {
      city: 'São Paulo',
      neighborhood: 'Barra Funda',
      distanceKm: 5.5,
      address: 'Av. Francisco Matarazzo, 1705'
    },
    date: 'Amanhã',
    isToday: false,
    schedule: {
      start: '07:00',
      end: '15:00',
      totalHours: 8
    },
    payment: {
      amount: 190,
      type: 'diaria',
      pixImmediate: true
    },
    requiredLevel: 2,
    matchPercentage: 89,
    status: 'available',
    spotsAvailable: 3,
    spotsTotal: 8,
    description:
      'Carregamento, descarregamento de flight cases, montagem de tablados, organização de cabeamento e posicionamento de iluminação.',
    requirements: [
      'Calçado fechado de proteção obrigatório (bota de segurança ou tênis reforçado)',
      'Boa disposição física e trabalho em equipe',
      'Uso dos EPIs fornecidos no local'
    ]
  },
  {
    id: 'opp-006',
    title: 'Conferente de Ingressos e Acesso VIP',
    companyName: 'Arena Hall Concerts',
    companyRating: 4.8,
    companyReviewsCount: 75,
    category: 'Eventos',
    location: {
      city: 'São Paulo',
      neighborhood: 'Mooca',
      distanceKm: 6.0,
      address: 'Rua Juventus, 120'
    },
    date: 'Sexta-feira',
    isToday: false,
    schedule: {
      start: '19:00',
      end: '00:00',
      totalHours: 5
    },
    payment: {
      amount: 140,
      type: 'diaria',
      pixImmediate: true
    },
    requiredLevel: 1,
    matchPercentage: 91,
    status: 'available',
    spotsAvailable: 2,
    spotsTotal: 5,
    description:
      'Validação de ingressos via smartphone com leitor óptico nas catracas do setor VIP e colocação de pulseiras de identificação.',
    requirements: [
      'Celular próprio com bateria carregada (app fornecido no briefing)',
      'Comportamento prestativo e cordial',
      'Camiseta preta lisa'
    ]
  },
  {
    id: 'opp-007',
    title: 'Auxiliar de Salão / Cumim para Jantar',
    companyName: 'Restaurante Terraço Jardins',
    companyRating: 4.9,
    companyReviewsCount: 91,
    category: 'Gastronomia',
    location: {
      city: 'São Paulo',
      neighborhood: 'Jardins',
      distanceKm: 3.1,
      address: 'Alameda Santos, 1120'
    },
    date: 'Hoje',
    isToday: true,
    schedule: {
      start: '18:30',
      end: '23:30',
      totalHours: 5
    },
    payment: {
      amount: 150,
      type: 'diaria',
      pixImmediate: true
    },
    requiredLevel: 1,
    matchPercentage: 95,
    status: 'available',
    spotsAvailable: 2,
    spotsTotal: 3,
    description:
      'Suporte aos garçons no salão, transporte de pratos prontos da cozinha às mesas auxiliares, limpeza e reposição rápida de mesas.',
    requirements: [
      'Agilidade e atenção à organização das mesas',
      'Uniforme preto completo',
      'Postura profissional em ambiente de alta gastronomia'
    ]
  },
  {
    id: 'opp-008',
    title: 'Apoio Operacional e Reposição em Feira',
    companyName: 'Prime Beverage Logistics',
    companyRating: 4.7,
    companyReviewsCount: 44,
    category: 'Logística',
    location: {
      city: 'São Paulo',
      neighborhood: 'Santo Amaro',
      distanceKm: 8.5,
      address: 'Av. das Nações Unidas, 14401'
    },
    date: 'Sábado',
    isToday: false,
    schedule: {
      start: '14:00',
      end: '22:00',
      totalHours: 8
    },
    payment: {
      amount: 165,
      type: 'diaria',
      pixImmediate: true
    },
    requiredLevel: 1,
    matchPercentage: 88,
    status: 'available',
    spotsAvailable: 4,
    spotsTotal: 6,
    description:
      'Controle de estoque nos pontos de venda internos do evento, reabastecimento de freezers e organização de caixas vazias no depósito.',
    requirements: [
      'Capacidade de manuseio de caixas com carrinho hidráulico manual',
      'Tênis confortável e roupas resistentes',
      'Atenção ao controle de inventário'
    ]
  },
  {
    id: 'opp-009',
    title: 'Promotor de Ativação e Degustação',
    companyName: 'Agência Sparkle Marketing',
    companyRating: 4.8,
    companyReviewsCount: 63,
    category: 'Atendimento',
    location: {
      city: 'São Paulo',
      neighborhood: 'Morumbi',
      distanceKm: 5.8,
      address: 'Av. Roque Petroni Júnior, 1089'
    },
    date: 'Domingo',
    isToday: false,
    schedule: {
      start: '10:00',
      end: '18:00',
      totalHours: 8
    },
    payment: {
      amount: 160,
      type: 'diaria',
      pixImmediate: true
    },
    requiredLevel: 1,
    matchPercentage: 93,
    status: 'available',
    spotsAvailable: 2,
    spotsTotal: 4,
    description:
      'Ativação de produto em estande de shopping, abordagem simpática ao público para degustação e entrega de cupons promocionais.',
    requirements: [
      'Proatividade, simpatia e excelente comunicação',
      'Calça jeans clássica e tênis branco limpo (camiseta fornecida pela marca)'
    ]
  },
  {
    id: 'opp-010',
    title: 'Equipe de Limpeza e Apoio Pós-Evento',
    companyName: 'CleanFest Soluções',
    companyRating: 4.6,
    companyReviewsCount: 37,
    category: 'Operacional',
    location: {
      city: 'São Paulo',
      neighborhood: 'Anhembi',
      distanceKm: 6.8,
      address: 'Av. Olavo Fontoura, 1209'
    },
    date: 'Domingo',
    isToday: false,
    schedule: {
      start: '23:00',
      end: '05:00',
      totalHours: 6
    },
    payment: {
      amount: 175,
      type: 'diaria',
      pixImmediate: true
    },
    requiredLevel: 1,
    matchPercentage: 87,
    status: 'available',
    spotsAvailable: 5,
    spotsTotal: 10,
    description:
      'Higienização rápida de salão pós-show, recolhimento de resíduos descartáveis, varrição e descarte nas caçambas designadas.',
    requirements: [
      'Disponibilidade para turno da madrugada',
      'Agilidade em equipe',
      'EPIs e luvas de proteção fornecidos no local'
    ]
  }
];

@Injectable({
  providedIn: 'root'
})
export class OpportunityService {
  private opportunitiesState = signal<Opportunity[]>(INITIAL_MOCK_OPPORTUNITIES);
  private featuredCompaniesState = signal<FeaturedCompany[]>(MOCK_FEATURED_COMPANIES);
  private appliedIds = signal<Set<string>>(new Set<string>());
  readonly searchQuery = signal<string>('');

  readonly opportunities = this.opportunitiesState.asReadonly();
  readonly featuredCompanies = this.featuredCompaniesState.asReadonly();
  readonly appliedCount = computed(() => this.appliedIds().size);

  setSearchQuery(query: string): void {
    this.searchQuery.set(query);
  }

  getOpportunities(filters?: OpportunityFilters): Observable<Opportunity[]> {
    return of(this.opportunitiesState()).pipe(
      delay(250), // Simula latência realista de rede sem travar a UI
      map(list => this.applyFilters(list, filters))
    );
  }

  getFeaturedCompanies(): Observable<FeaturedCompany[]> {
    return of(this.featuredCompaniesState()).pipe(
      delay(150)
    );
  }

  getOpportunityById(id: string): Observable<Opportunity | undefined> {
    const opp = this.opportunitiesState().find(o => o.id === id);
    return of(opp).pipe(delay(150));
  }

  applyToOpportunity(id: string): Observable<{ success: boolean; opportunity?: Opportunity }> {
    const currentList = this.opportunitiesState();
    const target = currentList.find(o => o.id === id);

    if (!target) {
      return of({ success: false });
    }

    // Atualiza estado reativo marcando como applied
    this.appliedIds.update(set => {
      const next = new Set(set);
      next.add(id);
      return next;
    });

    const updatedList = currentList.map(item => {
      if (item.id === id) {
        return {
          ...item,
          applied: true,
          appliedAt: new Date()
        };
      }
      return item;
    });

    this.opportunitiesState.set(updatedList);
    const updatedTarget = updatedList.find(o => o.id === id);

    return of({ success: true, opportunity: updatedTarget }).pipe(delay(300));
  }

  isApplied(id: string): boolean {
    return this.appliedIds().has(id);
  }

  private applyFilters(list: Opportunity[], filters?: OpportunityFilters): Opportunity[] {
    if (!filters) {
      return list;
    }

    let result = [...list];

    // Busca textual por título, empresa ou bairro
    if (filters.searchQuery && filters.searchQuery.trim() !== '') {
      const query = filters.searchQuery.toLowerCase().trim();
      result = result.filter(
        o =>
          o.title.toLowerCase().includes(query) ||
          o.companyName.toLowerCase().includes(query) ||
          o.location.neighborhood.toLowerCase().includes(query) ||
          o.category.toLowerCase().includes(query)
      );
    }

    // Filtro de Categoria
    if (filters.category && filters.category !== 'Todas') {
      result = result.filter(o => o.category === filters.category);
    }

    // Filtro de Distância Máxima
    if (filters.maxDistanceKm && filters.maxDistanceKm > 0) {
      result = result.filter(o => o.location.distanceKm <= filters.maxDistanceKm!);
    }

    // Filtro Para Hoje / Urgentes
    if (filters.onlyTodayOrUrgent) {
      result = result.filter(o => o.isToday || o.status === 'urgency');
    }

    // Ordenação
    if (filters.sortBy) {
      switch (filters.sortBy) {
        case 'highest_pay':
          result.sort((a, b) => b.payment.amount - a.payment.amount);
          break;
        case 'closest':
          result.sort((a, b) => a.location.distanceKm - b.location.distanceKm);
          break;
        case 'highest_match':
        default:
          result.sort((a, b) => b.matchPercentage - a.matchPercentage);
          break;
      }
    } else {
      // Padrão: maior compatibilidade (match)
      result.sort((a, b) => b.matchPercentage - a.matchPercentage);
    }

    return result;
  }
}
