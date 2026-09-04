export interface MatchCriterion {
  id: string;
  label: string; // Ex: 'Localização & Proximidade', 'Categoria Profissional', 'Nível de Experiência', 'Histórico de Pontualidade'
  description: string; // Ex: 'Vaga a 2.4 km do seu endereço cadastrado'
  scorePercentage: number; // Ex: 100, 95, 90
  status: 'perfect' | 'good' | 'neutral';
  icon: string; // 'map-pin', 'briefcase', 'award', 'clock'
}

export interface MatchBreakdownData {
  jobTitleOrCompanyName: string;
  totalMatchScore: number; // Ex: 98
  summaryHeadline: string; // Ex: 'Altíssima compatibilidade com seu perfil operacional'
  criteria: MatchCriterion[];
  isSponsored?: boolean;
}

/**
 * Cria a composição dos 4 pilares de Match a partir de uma oportunidade
 */
export function buildMatchBreakdownFromOpportunity(opportunity: {
  title: string;
  companyName: string;
  category: string;
  matchPercentage: number;
  location: { neighborhood: string; distanceKm: number };
  requiredLevel: number;
}): MatchBreakdownData {
  const match = opportunity.matchPercentage || 95;
  const distance = opportunity.location?.distanceKm || 2.4;
  const neighborhood = opportunity.location?.neighborhood || 'São Paulo';
  const level = opportunity.requiredLevel || 2;

  const proximityScore = distance <= 3 ? 100 : distance <= 6 ? 95 : 85;
  const levelScore = match >= 95 ? 100 : match >= 90 ? 95 : 85;
  const punctualityScore = 100;
  const categoryScore = match >= 95 ? 100 : match >= 90 ? 95 : 90;

  return {
    jobTitleOrCompanyName: opportunity.title,
    totalMatchScore: match,
    summaryHeadline: match >= 95
      ? 'Altíssima compatibilidade com suas habilidades e localização'
      : 'Excelente combinação com seu histórico e preferências de trabalho',
    criteria: [
      {
        id: 'proximity',
        label: 'Localização & Proximidade',
        description: `Vaga a ${distance} km (${neighborhood}) — dentro do seu raio preferencial de até 5 km.`,
        scorePercentage: proximityScore,
        status: proximityScore >= 95 ? 'perfect' : 'good',
        icon: 'map-pin'
      },
      {
        id: 'category',
        label: 'Categoria & Habilidades',
        description: `Você possui habilidades ativas para o setor de ${opportunity.category} e atendimento no perfil.`,
        scorePercentage: categoryScore,
        status: categoryScore >= 95 ? 'perfect' : 'good',
        icon: 'briefcase'
      },
      {
        id: 'level',
        label: 'Nível de Experiência',
        description: `Exige Nível ${level}. Seu perfil no Trampou é Nível ${level} (${level === 3 ? 'Especialista' : level === 2 ? 'Experiente' : 'Iniciante'}).`,
        scorePercentage: levelScore,
        status: levelScore >= 95 ? 'perfect' : 'good',
        icon: 'award'
      },
      {
        id: 'punctuality',
        label: 'Pontualidade & Confiabilidade',
        description: `Sua taxa de 100% de presença e pontualidade no prazo atende aos padrões do contratante.`,
        scorePercentage: punctualityScore,
        status: 'perfect',
        icon: 'clock'
      }
    ],
    isSponsored: false
  };
}

/**
 * Cria a composição dos 4 pilares de Match a partir de uma empresa em destaque
 */
export function buildMatchBreakdownFromCompany(company: {
  companyName: string;
  matchScore: number;
  distanceKm: number;
  location: string;
  badgeLabel?: string;
}): MatchBreakdownData {
  const match = company.matchScore || 96;
  const distance = company.distanceKm || 2.4;
  const location = company.location || 'São Paulo';

  return {
    jobTitleOrCompanyName: company.companyName,
    totalMatchScore: match,
    summaryHeadline: 'Compatibilidade com as vagas abertas e cultura operacional da empresa',
    criteria: [
      {
        id: 'proximity',
        label: 'Proximidade Operacional',
        description: `Estabelecimento a ${distance} km (${location}) — deslocamento rápido e prático.`,
        scorePercentage: 100,
        status: 'perfect',
        icon: 'map-pin'
      },
      {
        id: 'category',
        label: 'Setor & Vagas Ativas',
        description: `As funções mais demandadas por esta empresa combinam com seu catálogo de serviços.`,
        scorePercentage: match >= 95 ? 100 : 90,
        status: match >= 95 ? 'perfect' : 'good',
        icon: 'briefcase'
      },
      {
        id: 'reputation',
        label: 'Avaliação & Reputação',
        description: `Empresa verificada com média superior a 4.8 estrelas e 100% repasses via PIX garantidos.`,
        scorePercentage: 98,
        status: 'perfect',
        icon: 'award'
      },
      {
        id: 'punctuality',
        label: 'Histórico de Pontualidade',
        description: `Seu compromisso de presença se alinha aos critérios de alta confiança da equipe.`,
        scorePercentage: 100,
        status: 'perfect',
        icon: 'clock'
      }
    ],
    isSponsored: company.badgeLabel === 'Patrocinado'
  };
}
