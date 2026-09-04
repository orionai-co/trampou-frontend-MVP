export type CampaignType = 'featured_company' | 'boost_job';
export type CampaignDurationDays = 1 | 3 | 7 | 14 | 30;

export interface CampaignTargeting {
  radiusKm: number; // 10
  category: string; // 'Gastronomia & Eventos'
  minLevel: number; // 2
}

export interface CampaignMetrics {
  impressions: number; // 12480
  videoViews: number; // 8230
  profileVisits: number; // 428
  interestedCount: number; // 87
  applicationsCount: number; // 31
  spentAmount: number; // 149.00
}

export interface SponsoredCampaign {
  id: string;
  companyId: string;
  type: CampaignType;
  title: string;
  headline: string;
  videoUrl: string;
  videoThumbnail: string;
  durationDays: CampaignDurationDays;
  status: 'active' | 'completed' | 'draft';
  startDate: string;
  endDate: string;
  targeting: CampaignTargeting;
  metrics: CampaignMetrics;
}

export interface CampaignPlan {
  durationDays: CampaignDurationDays;
  price: number;
  label: string;
  isPopular?: boolean;
  estimatedReach: string;
}

export const CAMPAIGN_PLANS: CampaignPlan[] = [
  {
    durationDays: 3,
    price: 49,
    label: '3 dias — R$ 49',
    estimatedReach: '3.000 ~ 5.000 profissionais'
  },
  {
    durationDays: 7,
    price: 99,
    label: '7 dias — R$ 99',
    isPopular: true,
    estimatedReach: '8.000 ~ 15.000 profissionais'
  },
  {
    durationDays: 14,
    price: 179,
    label: '14 dias — R$ 179',
    estimatedReach: '18.000 ~ 30.000 profissionais'
  },
  {
    durationDays: 30,
    price: 299,
    label: '30 dias — R$ 299',
    estimatedReach: '40.000 ~ 70.000 profissionais'
  }
];
