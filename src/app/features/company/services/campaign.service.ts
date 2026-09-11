import { Injectable, signal, computed, inject } from '@angular/core';
import {
  SponsoredCampaign,
  CampaignMetrics,
  CAMPAIGN_PLANS,
  CampaignPlan
} from '../../../core/models/sponsored-campaign.model';
import { ApiClientService } from '../../../core/services/api-client.service';
import { API_ENDPOINTS } from '../../../core/constants/api-endpoints';

@Injectable({
  providedIn: 'root'
})
export class CampaignService {
  private apiClient = inject(ApiClientService);

  private readonly _campaigns = signal<SponsoredCampaign[]>([]);
  readonly isLoading = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);

  readonly campaigns = this._campaigns.asReadonly();

  async fetchCampaigns(): Promise<SponsoredCampaign[]> {
    this.isLoading.set(true);
    try {
      const data = await this.apiClient.get<SponsoredCampaign[]>(API_ENDPOINTS.CAMPAIGNS.LIST);
      this._campaigns.set(data || []);
      return data || [];
    } catch (error: any) {
      this.errorMessage.set(error?.message || 'Erro ao buscar campanhas.');
      return [];
    } finally {
      this.isLoading.set(false);
    }
  }

  async fetchActiveCampaign(): Promise<SponsoredCampaign | null> {
    try {
      const active = await this.apiClient.get<SponsoredCampaign | null>(API_ENDPOINTS.CAMPAIGNS.ACTIVE);
      if (active) {
        this._campaigns.update(list => {
          const exists = list.some(c => c.id === active.id);
          return exists ? list.map(c => (c.id === active.id ? active : c)) : [active, ...list];
        });
      }
      return active;
    } catch (error) {
      return null;
    }
  }

  async saveCampaign(campaignData: Partial<SponsoredCampaign>): Promise<SponsoredCampaign> {
    this.isLoading.set(true);
    try {
      const created = await this.apiClient.post<SponsoredCampaign>(API_ENDPOINTS.CAMPAIGNS.CREATE, campaignData);
      if (created) {
        this._campaigns.update(list => [
          created,
          ...list.map(c => (c.status === 'active' ? { ...c, status: 'completed' as const } : c))
        ]);
      }
      return created;
    } finally {
      this.isLoading.set(false);
    }
  }

  async fetchMetrics(): Promise<CampaignMetrics> {
    try {
      return await this.apiClient.get<CampaignMetrics>(API_ENDPOINTS.CAMPAIGNS.METRICS);
    } catch (error) {
      return {
        impressions: 0,
        videoViews: 0,
        profileVisits: 0,
        interestedCount: 0,
        applicationsCount: 0,
        spentAmount: 0
      };
    }
  }

  readonly activeCampaign = computed<SponsoredCampaign | null>(() => {
    return this._campaigns().find(c => c.status === 'active') || null;
  });

  readonly hasActiveCampaign = computed<boolean>(() => {
    return !!this.activeCampaign();
  });

  readonly currentMetrics = computed<CampaignMetrics>(() => {
    const active = this.activeCampaign();
    if (active) {
      return active.metrics;
    }
    return {
      impressions: 0,
      videoViews: 0,
      profileVisits: 0,
      interestedCount: 0,
      applicationsCount: 0,
      spentAmount: 0
    };
  });

  readonly daysRemaining = computed<number>(() => {
    const active = this.activeCampaign();
    if (!active || !active.endDate) return 0;
    const end = new Date(active.endDate).getTime();
    const now = Date.now();
    const diffDays = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  });

  getPlans(): CampaignPlan[] {
    return CAMPAIGN_PLANS;
  }

  createCampaign(campaignData: Partial<SponsoredCampaign>): SponsoredCampaign {
    const duration = campaignData.durationDays || 7;
    const plan = CAMPAIGN_PLANS.find(p => p.durationDays === duration);
    const spent = plan ? plan.price : 99;

    const startDate = new Date().toISOString();
    const endDate = new Date(Date.now() + duration * 24 * 60 * 60 * 1000).toISOString();

    const newCampaign: SponsoredCampaign = {
      id: `camp-${Date.now()}`,
      companyId: campaignData.companyId || 'comp-001',
      type: campaignData.type || 'featured_company',
      title: campaignData.title || 'Destaque Institucional no Feed',
      headline: campaignData.headline || 'Conheça nossa estrutura e junte-se aos nossos turnos.',
      videoUrl: campaignData.videoUrl || 'https://assets.mixkit.co/videos/preview/mixkit-restaurant-kitchen-staff-working-42998-large.mp4',
      videoThumbnail: campaignData.videoThumbnail || 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop&q=80',
      durationDays: duration,
      status: 'active',
      startDate,
      endDate,
      targeting: campaignData.targeting || {
        radiusKm: 10,
        category: 'Gastronomia & Eventos',
        minLevel: 2
      },
      metrics: {
        impressions: 120,
        videoViews: 45,
        profileVisits: 8,
        interestedCount: 3,
        applicationsCount: 1,
        spentAmount: spent
      }
    };

    // Completa campanhas ativas anteriores para manter uma ativa principal
    this._campaigns.update(list => [
      newCampaign,
      ...list.map(c => (c.status === 'active' ? { ...c, status: 'completed' as const } : c))
    ]);

    return newCampaign;
  }

  cancelCampaign(campaignId: string): void {
    this._campaigns.update(list =>
      list.map(c => (c.id === campaignId ? { ...c, status: 'completed' as const } : c))
    );
  }

  updateMetrics(campaignId: string, metricsDelta: Partial<CampaignMetrics>): void {
    this._campaigns.update(list =>
      list.map(c => {
        if (c.id === campaignId) {
          return {
            ...c,
            metrics: {
              ...c.metrics,
              ...metricsDelta
            }
          };
        }
        return c;
      })
    );
  }
}
