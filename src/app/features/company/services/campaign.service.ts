import { Injectable, signal, computed, inject } from '@angular/core';
import {
  SponsoredCampaign,
  CampaignMetrics,
  CAMPAIGN_PLANS,
  CampaignPlan,
  CampaignType,
  CampaignDurationDays,
  BoostCampaignStorageItem,
  TRAMPOU_BOOST_CAMPAIGNS_STORAGE_KEY,
  TRAMPOU_BOOST_DISMISSED_STORAGE_KEY
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

  constructor() {
    this.loadStoredCampaigns();

    if (typeof window !== 'undefined') {
      window.addEventListener('trampou:boost-updated', () => {
        this.loadStoredCampaigns();
      });
    }
  }

  /**
   * Carrega do storage local para garantir status de Campanha Ativa após F5
   */
  loadStoredCampaigns(): void {
    if (typeof localStorage === 'undefined') return;
    try {
      const isDismissed = localStorage.getItem(TRAMPOU_BOOST_DISMISSED_STORAGE_KEY) === 'true';
      const raw = localStorage.getItem(TRAMPOU_BOOST_CAMPAIGNS_STORAGE_KEY);

      if (isDismissed) {
        this._campaigns.update(list => list.map(c => ({ ...c, status: 'completed' as const })));
        return;
      }

      if (!raw) return;
      const parsed = JSON.parse(raw);
      const list: BoostCampaignStorageItem[] = Array.isArray(parsed) ? parsed : [parsed];
      if (list.length === 0) return;

      const hasActiveStored = list.some(c => c && c.active === true && c.status !== 'cancelled');
      if (!hasActiveStored) {
        this._campaigns.update(list => list.map(c => ({ ...c, status: 'completed' as const })));
        return;
      }

      const converted: SponsoredCampaign[] = list.map(item => this.mapStorageItemToCampaign(item));
      this._campaigns.update(current => {
        const storedIds = new Set(converted.map(c => c.id));
        const others = current.filter(c => !storedIds.has(c.id));
        const adjustedOthers = others.map(c => (c.status === 'active' ? { ...c, status: 'completed' as const } : c));
        return [...converted, ...adjustedOthers];
      });
    } catch {
      // noop
    }
  }

  private mapStorageItemToCampaign(item: BoostCampaignStorageItem): SponsoredCampaign {
    const createdDate = item.createdAt ? new Date(item.createdAt) : new Date();
    const duration = (item.days || 7) as CampaignDurationDays;
    const endDate = new Date(createdDate.getTime() + duration * 24 * 60 * 60 * 1000).toISOString();
    const isCancelled = item.status === 'cancelled' || item.active === false;
    const isStillActive = !isCancelled && (new Date(endDate).getTime() > Date.now());
    const realApplications = this.getRealApplicationsCount(item.companyId || 'comp-001');
    const hasStoredMetrics = !!item.metrics;

    return {
      id: item.id || `camp-${Date.now()}`,
      companyId: item.companyId || 'comp-001',
      type: (item.objective === 'boost_job' ? 'boost_job' : 'featured_company') as CampaignType,
      title: item.objective === 'boost_job' ? `Impulsionamento de Vagas — ${item.companyName}` : `Destaque — ${item.companyName}`,
      headline: item.headline,
      videoUrl: item.videoUrl || 'https://assets.mixkit.co/videos/preview/mixkit-restaurant-kitchen-staff-working-42998-large.mp4',
      videoThumbnail: item.videoThumbnail || 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop&q=80',
      durationDays: duration,
      status: isStillActive ? 'active' : 'completed',
      startDate: createdDate.toISOString(),
      endDate,
      targeting: {
        radiusKm: item.radiusKm || 10,
        category: 'Gastronomia & Eventos',
        minLevel: 2
      },
      metrics: {
        impressions: hasStoredMetrics ? (item.metrics?.impressions ?? 0) : 0,
        videoViews: hasStoredMetrics ? (item.metrics?.videoViews ?? 0) : 0,
        profileVisits: hasStoredMetrics ? (item.metrics?.profileVisits ?? 0) : 0,
        interestedCount: hasStoredMetrics ? (item.metrics?.interestedCount ?? 0) : 0,
        applicationsCount: realApplications,
        spentAmount: item.price || 99
      }
    };
  }

  private getRealApplicationsCount(companyId: string): number {
    if (typeof localStorage === 'undefined') return 0;
    try {
      let count = 0;
      // 1. Candidaturas salvas na sessão/storage
      const appsRaw = localStorage.getItem('trampou_applications');
      if (appsRaw) {
        const apps = JSON.parse(appsRaw);
        if (Array.isArray(apps)) {
          count += apps.filter((a: any) => !a.status || a.status !== 'cancelled').length;
        }
      }
      // 2. Candidatos das vagas ativas da empresa
      const jobsRaw = localStorage.getItem('trampou_company_jobs');
      if (jobsRaw) {
        const jobs = JSON.parse(jobsRaw);
        if (Array.isArray(jobs)) {
          const candCount = jobs.reduce(
            (sum: number, j: any) => sum + ((j.candidates && Array.isArray(j.candidates)) ? j.candidates.length : 0),
            0
          );
          count = Math.max(count, candCount);
        }
      }
      return count;
    } catch {
      return 0;
    }
  }

  async fetchCampaigns(): Promise<SponsoredCampaign[]> {
    this.isLoading.set(true);
    this.loadStoredCampaigns();
    try {
      const isDismissed = typeof localStorage !== 'undefined' && (
        localStorage.getItem(TRAMPOU_BOOST_DISMISSED_STORAGE_KEY) === 'true'
      );
      const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(TRAMPOU_BOOST_CAMPAIGNS_STORAGE_KEY) : null;
      let hasInactiveOrCancelledStorage = false;
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          const list: BoostCampaignStorageItem[] = Array.isArray(parsed) ? parsed : [parsed];
          const hasActive = list.some(c => c && c.active === true && c.status !== 'cancelled');
          if (!hasActive && list.length > 0) {
            hasInactiveOrCancelledStorage = true;
          }
        } catch {}
      }

      const data = await this.apiClient.get<SponsoredCampaign[]>(API_ENDPOINTS.CAMPAIGNS.LIST);
      if (data && data.length > 0) {
        this._campaigns.update(current => {
          const apiIds = new Set(data.map(d => d.id));
          const localActive = current.filter(c => !apiIds.has(c.id));
          const adjustedData = (isDismissed || hasInactiveOrCancelledStorage)
            ? data.map(c => ({ ...c, status: 'completed' as const }))
            : data;
          return [...localActive, ...adjustedData];
        });
      }
      return this._campaigns();
    } catch (error: any) {
      this.errorMessage.set(error?.message || 'Erro ao buscar campanhas.');
      return this._campaigns();
    } finally {
      this.isLoading.set(false);
    }
  }

  async fetchActiveCampaign(): Promise<SponsoredCampaign | null> {
    this.loadStoredCampaigns();
    const isDismissed = typeof localStorage !== 'undefined' && (
      localStorage.getItem(TRAMPOU_BOOST_DISMISSED_STORAGE_KEY) === 'true'
    );
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(TRAMPOU_BOOST_CAMPAIGNS_STORAGE_KEY) : null;
    let hasInactiveOrCancelledStorage = false;
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        const list: BoostCampaignStorageItem[] = Array.isArray(parsed) ? parsed : [parsed];
        const hasActive = list.some(c => c && c.active === true && c.status !== 'cancelled');
        if (!hasActive && list.length > 0) {
          hasInactiveOrCancelledStorage = true;
        }
      } catch {}
    }

    if (isDismissed || hasInactiveOrCancelledStorage) {
      this._campaigns.update(list => list.map(c => ({ ...c, status: 'completed' as const })));
      return null;
    }

    try {
      const active = await this.apiClient.get<SponsoredCampaign | null>(API_ENDPOINTS.CAMPAIGNS.ACTIVE);
      if (active) {
        this._campaigns.update(list => {
          const exists = list.some(c => c.id === active.id);
          return exists ? list.map(c => (c.id === active.id ? active : c)) : [active, ...list];
        });
        return active;
      }
      return this.activeCampaign();
    } catch (error) {
      return this.activeCampaign();
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
        impressions: 0,
        videoViews: 0,
        profileVisits: 0,
        interestedCount: 0,
        applicationsCount: this.getRealApplicationsCount('comp-001'),
        spentAmount: spent
      }
    };

    // Completa campanhas ativas anteriores para manter uma ativa principal
    this._campaigns.update(list => [
      newCampaign,
      ...list.map(c => (c.status === 'active' ? { ...c, status: 'completed' as const } : c))
    ]);

    // Persiste no storage compartilhado (chave: trampou_boost_campaigns)
    const storageItem: BoostCampaignStorageItem = {
      id: newCampaign.id,
      companyId: newCampaign.companyId,
      companyName: 'Buffet Espaço Paulista',
      objective: newCampaign.type,
      headline: newCampaign.headline,
      videoUrl: newCampaign.videoUrl,
      videoThumbnail: newCampaign.videoThumbnail,
      radiusKm: newCampaign.targeting.radiusKm,
      days: newCampaign.durationDays,
      price: spent,
      active: true,
      createdAt: startDate
    };

    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.removeItem(TRAMPOU_BOOST_DISMISSED_STORAGE_KEY);
        const raw = localStorage.getItem(TRAMPOU_BOOST_CAMPAIGNS_STORAGE_KEY);
        const existing = raw ? JSON.parse(raw) : [];
        const list: BoostCampaignStorageItem[] = Array.isArray(existing) ? existing : [existing];
        const updated = [
          { ...storageItem, status: 'active' as const },
          ...list.map(c => ({ ...c, active: false, status: c.status || ('completed' as const) }))
        ];
        localStorage.setItem(TRAMPOU_BOOST_CAMPAIGNS_STORAGE_KEY, JSON.stringify(updated));
      } catch (err) {
        console.error('Erro ao salvar no storage compartilhado:', err);
      }
    }

    // Tenta persistir no backend .NET caso exista endpoint
    this.apiClient.post(API_ENDPOINTS.CAMPAIGNS.CREATE, newCampaign).catch(() => {});

    // Dispara evento global para o feed e painel
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('trampou:boost-updated', { detail: storageItem }));
    }

    return newCampaign;
  }

  cancelCampaign(campaignId?: string): void {
    const targetId = campaignId || this.activeCampaign()?.id;

    this._campaigns.update(list =>
      list.map(c => (!targetId || c.id === targetId ? { ...c, status: 'completed' as const } : c))
    );

    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(TRAMPOU_BOOST_DISMISSED_STORAGE_KEY, 'true');
        const raw = localStorage.getItem(TRAMPOU_BOOST_CAMPAIGNS_STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          const list: BoostCampaignStorageItem[] = Array.isArray(parsed) ? parsed : [parsed];
          const updated = list.map(c => (!targetId || c.id === targetId ? {
            ...c,
            active: false,
            status: 'cancelled' as const,
            deletedAt: new Date().toISOString()
          } : c));
          localStorage.setItem(TRAMPOU_BOOST_CAMPAIGNS_STORAGE_KEY, JSON.stringify(updated));
        } else {
          localStorage.setItem(TRAMPOU_BOOST_CAMPAIGNS_STORAGE_KEY, JSON.stringify([{
            id: targetId || 'dismissed',
            companyId: 'comp-001',
            companyName: 'Buffet Espaço Paulista',
            objective: 'featured_company',
            headline: '',
            videoUrl: '',
            radiusKm: 10,
            days: 7,
            price: 99,
            active: false,
            status: 'cancelled',
            deletedAt: new Date().toISOString(),
            createdAt: new Date().toISOString()
          }]));
        }
      } catch {}
    }

    try {
      Promise.resolve(this.apiClient.delete(API_ENDPOINTS.CAMPAIGNS.ACTIVE)).catch(() => {});
    } catch {}

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('trampou:boost-updated', { detail: null }));
    }
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
