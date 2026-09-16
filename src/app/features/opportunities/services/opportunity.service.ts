import { Injectable, signal, computed, inject } from '@angular/core';
import { Observable, from, of } from 'rxjs';
import {
  Opportunity,
  OpportunityFilters
} from '../models/opportunity.model';
import { FeaturedCompany } from '../../../core/models/sponsored-content.model';
import {
  BoostCampaignStorageItem,
  TRAMPOU_BOOST_CAMPAIGNS_STORAGE_KEY,
  TRAMPOU_BOOST_DISMISSED_STORAGE_KEY
} from '../../../core/models/sponsored-campaign.model';
import { ApiClientService } from '../../../core/services/api-client.service';
import { API_ENDPOINTS } from '../../../core/constants/api-endpoints';
import { AuthService } from '../../../core/services/auth.service';
import { MyJobsService } from '../../my-jobs/services/my-jobs.service';
import { UserProfileService } from '../../../core/services/user-profile.service';
import { VideoStorageService } from '../../../core/services/video-storage.service';

export const TRAMPOU_COMPANY_JOBS_STORAGE_KEY = 'trampou_company_created_jobs';

@Injectable({
  providedIn: 'root'
})
export class OpportunityService {
  private apiClient = inject(ApiClientService);
  private authService = inject(AuthService, { optional: true });
  private myJobsService = inject(MyJobsService, { optional: true });
  private userProfileService = inject(UserProfileService, { optional: true });
  private videoStorageService = inject(VideoStorageService);

  private opportunitiesState = signal<Opportunity[]>([]);
  private featuredCompaniesState = signal<FeaturedCompany[]>([]);
  private appliedIds = signal<Set<string>>(new Set<string>());
  readonly searchQuery = signal<string>('');
  readonly isLoading = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);

  readonly opportunities = this.opportunitiesState.asReadonly();
  readonly featuredCompanies = this.featuredCompaniesState.asReadonly();
  readonly appliedCount = computed(() => this.appliedIds().size);

  private lastFilters?: OpportunityFilters;

  constructor() {
    this.loadStoredBoostCampaigns();

    if (typeof window !== 'undefined') {
      window.addEventListener('trampou:jobs-updated', () => {
        this.fetchOpportunities(this.lastFilters).catch(() => {});
      });

      window.addEventListener('trampou:boost-updated', (evt: any) => {
        const detail = evt?.detail;
        if (detail && detail.videoUrl) {
          this.featuredCompaniesState.update(curr => {
            if (curr.length > 0 && curr[0].id === detail.id) {
              return [{ ...curr[0], videoUrl: detail.videoUrl, videoThumbnail: detail.videoFileName ? '' : curr[0].videoThumbnail }, ...curr.slice(1)];
            }
            return curr;
          });
        }
        this.loadStoredBoostCampaigns();
      });
    }
  }

  /**
   * Lê as campanhas ativas salvas em trampou_boost_campaigns e popula a empresa em destaque do feed
   */
  loadStoredBoostCampaigns(): FeaturedCompany | null {
    if (typeof localStorage === 'undefined') return null;
    try {
      const raw = localStorage.getItem(TRAMPOU_BOOST_CAMPAIGNS_STORAGE_KEY);
      const isDismissed = localStorage.getItem(TRAMPOU_BOOST_DISMISSED_STORAGE_KEY) === 'true';

      if (!raw) {
        if (isDismissed) {
          this.featuredCompaniesState.set([]);
        }
        return null;
      }
      const parsed = JSON.parse(raw);
      const items: BoostCampaignStorageItem[] = Array.isArray(parsed) ? parsed : [parsed];
      const active = items.find(i => i && i.active === true && i.status !== 'cancelled');
      if (!active) {
        this.featuredCompaniesState.set([]);
        return null;
      }

      if (isDismissed) {
        localStorage.removeItem(TRAMPOU_BOOST_DISMISSED_STORAGE_KEY);
      }

      const hasCustomVideo = !!(active.videoFileName || active.videoStorageKey);

      const featCompany: FeaturedCompany = {
        id: active.id || 'feat-001',
        companyId: active.companyId || 'comp-001',
        companyName: active.companyName || 'Buffet Espaço Paulista',
        companyHandle: '@' + (active.companyName || 'espacopaulista').toLowerCase().replace(/\s+/g, ''),
        avatarInitials: (active.companyName || 'EP').substring(0, 2).toUpperCase(),
        verified: true,
        rating: 4.9,
        reviewCount: 84,
        badgeLabel: active.objective === 'boost_job' ? 'Patrocinado' : 'Empresa em Destaque',
        headline: active.headline || 'Conheça nosso espaço e junte-se à nossa equipe.',
        videoUrl: active.videoUrl || (hasCustomVideo ? '' : 'https://assets.mixkit.co/videos/preview/mixkit-restaurant-kitchen-staff-working-42998-large.mp4'),
        videoFileName: active.videoFileName,
        videoStorageKey: active.videoStorageKey || 'active_boost_video',
        videoThumbnail: hasCustomVideo ? '' : (active.videoThumbnail || 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop&q=80'),
        videoDurationText: active.videoDurationText || (hasCustomVideo ? 'Vídeo Anexado' : '0:45'),
        location: 'São Paulo, SP',
        distanceKm: active.radiusKm || 10,
        completedShiftsCount: 84,
        matchScore: 96,
        matchReasons: ['Destaque prioritário no topo do feed', 'Empresa verificada Trampou', 'Pagamento garantido via PIX'],
        openJobsCount: 3
      };

      this.featuredCompaniesState.set([featCompany]);

      // Tenta recuperar do IndexedDB a URL ativa no caso de refresh (F5)
      if (hasCustomVideo) {
        const key = active.videoStorageKey || 'active_boost_video';
        this.videoStorageService.getVideoUrl(key).then(activeBlobUrl => {
          if (activeBlobUrl) {
            this.featuredCompaniesState.update(current => {
              if (current.length > 0 && current[0].id === featCompany.id) {
                return [{ ...current[0], videoUrl: activeBlobUrl, videoThumbnail: '' }, ...current.slice(1)];
              }
              return current;
            });
          }
        }).catch(() => {});
      }

      return featCompany;
    } catch {
      return null;
    }
  }

  setSearchQuery(query: string): void {
    this.searchQuery.set(query);
  }

  /**
   * Recarrega a listagem de oportunidades invalidando estados antigos
   */
  async reloadFeed(): Promise<Opportunity[]> {
    return this.fetchOpportunities(this.lastFilters);
  }

  async fetchOpportunities(filters?: OpportunityFilters): Promise<Opportunity[]> {
    this.lastFilters = filters;
    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      // Sanitiza parâmetros para que valores como 'Todas' não bloqueiem o backend .NET
      const params: any = {};
      if (filters?.searchQuery && filters.searchQuery.trim()) {
        params.searchQuery = filters.searchQuery.trim();
      }
      if (filters?.category && filters.category !== 'Todas' && (filters.category as string) !== 'all') {
        params.category = filters.category;
      }
      if (filters?.maxDistanceKm && filters.maxDistanceKm > 0) {
        params.maxDistanceKm = filters.maxDistanceKm;
      }
      if (filters?.onlyTodayOrUrgent) {
        params.onlyTodayOrUrgent = true;
      }
      if (filters?.sortBy) {
        params.sortBy = filters.sortBy;
      }

      const data = await this.apiClient.get<Opportunity[]>(API_ENDPOINTS.OPPORTUNITIES.FEED, { params });
      const apiList = (Array.isArray(data) ? data : []).map(item => this.normalizeOpportunity(item));

      // Sincroniza e mescla vagas corporativas criadas pela empresa
      const mergedList = this.mergeWithStoredCompanyJobs(apiList);

      const filtered = this.applyFilters(mergedList, filters);
      this.opportunitiesState.set(filtered);
      return filtered;
    } catch (error: any) {
      // Fallback resiliente com as vagas corporativas sincronizadas
      const fallbackList = this.mergeWithStoredCompanyJobs([]);
      const filtered = this.applyFilters(fallbackList, filters);
      this.opportunitiesState.set(filtered);

      if (filtered.length > 0) {
        return filtered;
      }

      const msg = error?.message || 'Erro ao carregar oportunidades.';
      this.errorMessage.set(msg);
      throw error;
    } finally {
      this.isLoading.set(false);
    }
  }

  async fetchOpportunityById(id: string): Promise<Opportunity | undefined> {
    try {
      const data = await this.apiClient.get<Opportunity>(API_ENDPOINTS.OPPORTUNITIES.DETAILS(id));
      if (data) {
        return this.normalizeOpportunity(data);
      }
      const fromState = this.opportunitiesState().find(o => o.id === id);
      return fromState;
    } catch (error) {
      const fromState = this.opportunitiesState().find(o => o.id === id);
      return fromState;
    }
  }

  async submitApplication(id: string, oppData?: Opportunity): Promise<{ success: boolean; opportunity?: Opportunity }> {
    const opp = oppData || this.opportunitiesState().find(o => o.id === id);
    const user = this.authService?.currentUser();
    const candidateName = user?.name || this.userProfileService?.name() || 'Pedro Silva';
    const candidateId = user?.id || 'cand-pedro-1';
    const candidateAvatar = user?.avatarUrl || this.userProfileService?.avatarInitials() || 'PS';

    this.appliedIds.update(set => new Set(set).add(id));
    this.opportunitiesState.update(list =>
      list.map(item => (item.id === id ? { ...item, applied: true, appliedAt: new Date() } : item))
    );

    if (opp && this.myJobsService) {
      this.myJobsService.addPendingApplication({
        opportunityId: opp.id,
        title: opp.title,
        opportunityTitle: opp.title,
        companyName: opp.companyName,
        companyId: opp.companyId || 'comp-001',
        candidateId,
        candidateName,
        candidateAvatar,
        remuneration: opp.payment?.amount || 150,
        category: opp.category,
        location: opp.location,
        date: opp.date,
        isToday: opp.isToday,
        schedule: opp.schedule,
        payment: opp.payment
      });
    }

    try {
      const res = await this.apiClient.post<{ success: boolean; opportunity?: Opportunity }>(
        API_ENDPOINTS.OPPORTUNITIES.APPLY(id)
      );
      return { success: true, opportunity: opp || res?.opportunity };
    } catch {
      return { success: true, opportunity: opp };
    }
  }

  async cancelApplicationRemote(id: string): Promise<boolean> {
    this.appliedIds.update(set => {
      const next = new Set(set);
      next.delete(id);
      return next;
    });
    this.opportunitiesState.update(list =>
      list.map(item => (item.id === id ? { ...item, applied: false } : item))
    );
    this.myJobsService?.cancelShift(id);
    try {
      const res = await this.apiClient.delete<boolean>(API_ENDPOINTS.OPPORTUNITIES.CANCEL_APPLICATION(id));
      return !!res;
    } catch {
      return true;
    }
  }

  getOpportunities(filters?: OpportunityFilters): Observable<Opportunity[]> {
    return from(this.fetchOpportunities(filters));
  }

  async fetchFeaturedCompanies(): Promise<FeaturedCompany[]> {
    this.loadStoredBoostCampaigns();

    if (typeof localStorage !== 'undefined') {
      const isDismissed = localStorage.getItem(TRAMPOU_BOOST_DISMISSED_STORAGE_KEY) === 'true';
      if (isDismissed) {
        this.featuredCompaniesState.set([]);
        return [];
      }

      const raw = localStorage.getItem(TRAMPOU_BOOST_CAMPAIGNS_STORAGE_KEY);
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          const items: BoostCampaignStorageItem[] = Array.isArray(parsed) ? parsed : [parsed];
          const hasActive = items.some(i => i && i.active === true && i.status !== 'cancelled');
          if (!hasActive) {
            this.featuredCompaniesState.set([]);
            return [];
          }
        } catch {}
      }
    }

    try {
      const data = await this.apiClient.get<FeaturedCompany[]>(API_ENDPOINTS.COMPANIES.FEATURED);
      const list = data || [];
      this.featuredCompaniesState.update(current => {
        if (current.length > 0) {
          const storedBoost = current[0];
          const others = list.filter(c => c.id !== storedBoost.id && c.companyId !== storedBoost.companyId);
          return [storedBoost, ...others];
        }
        return list;
      });
      return this.featuredCompaniesState();
    } catch (error) {
      return this.featuredCompaniesState();
    }
  }

  getFeaturedCompanies(): Observable<FeaturedCompany[]> {
    if (this.featuredCompaniesState().length === 0) {
      return from(this.fetchFeaturedCompanies());
    }
    return of(this.featuredCompaniesState());
  }

  getOpportunityById(id: string): Observable<Opportunity | undefined> {
    return from(this.fetchOpportunityById(id));
  }

  applyToOpportunity(id: string, opp?: Opportunity): Observable<{ success: boolean; opportunity?: Opportunity }> {
    return from(this.submitApplication(id, opp));
  }

  isApplied(id: string): boolean {
    return this.appliedIds().has(id);
  }

  /**
   * Normaliza os dados brutos da API para a interface estrita Opportunity
   */
  normalizeOpportunity(raw: any): Opportunity {
    const loc = raw.location || {};
    const sched = raw.schedule || {};
    const pay = raw.payment || {};
    const amount = pay.amount ?? raw.paymentAmount ?? 150;
    const totalSlots = raw.spotsTotal ?? raw.slots?.total ?? 1;
    const availableSlots = raw.spotsAvailable ?? Math.max(0, totalSlots - (raw.slots?.filled ?? 0));

    return {
      id: String(raw.id || `opp-${Date.now()}`),
      companyId: raw.companyId || (raw as any).companyId,
      title: raw.title || 'Novo Turno',
      companyName: raw.companyName || 'Empresa Contratante',
      companyRating: raw.companyRating ?? 5.0,
      companyReviewsCount: raw.companyReviewsCount ?? 0,
      category: raw.category || 'Operacional',
      location: {
        city: loc.city || 'São Paulo',
        neighborhood: loc.neighborhood || 'Centro',
        distanceKm: typeof loc.distanceKm === 'number' ? loc.distanceKm : 2.0,
        address: loc.address || ''
      },
      date: raw.date || 'Hoje',
      isToday: raw.isToday ?? (raw.date === 'Hoje'),
      schedule: {
        start: sched.start || '18:00',
        end: sched.end || '23:00',
        totalHours: sched.totalHours || 5
      },
      payment: {
        amount,
        type: pay.type || 'diaria',
        pixImmediate: pay.pixImmediate ?? true
      },
      requiredLevel: raw.requiredLevel || 1,
      matchPercentage: raw.matchPercentage ?? 100,
      status: raw.status === 'urgency' ? 'urgency' : 'available',
      description: raw.description || raw.title || 'Oportunidade disponível para contratação imediata.',
      requirements: Array.isArray(raw.requirements) && raw.requirements.length > 0
        ? raw.requirements
        : ['Aparência profissional e pontualidade'],
      spotsAvailable: availableSlots,
      spotsTotal: totalSlots,
      applied: !!raw.applied,
      appliedAt: raw.appliedAt ? new Date(raw.appliedAt) : undefined
    };
  }

  /**
   * Mescla as vagas corporativas salvas localmente caso ainda não estejam na lista do backend
   */
  private mergeWithStoredCompanyJobs(apiList: Opportunity[]): Opportunity[] {
    if (typeof localStorage === 'undefined') return apiList;
    try {
      const deletedRaw = localStorage.getItem('trampou_deleted_job_ids');
      const deletedIds = new Set<string>(deletedRaw ? JSON.parse(deletedRaw) : []);
      const cleanApiList = apiList.filter(o => !deletedIds.has(o.id));

      const raw = localStorage.getItem(TRAMPOU_COMPANY_JOBS_STORAGE_KEY) || localStorage.getItem('trampou_company_jobs');
      if (!raw) return cleanApiList;
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return cleanApiList;

      const existingIds = new Set(cleanApiList.map(o => o.id));
      const existingTitles = new Set(cleanApiList.map(o => `${o.title.toLowerCase().trim()}::${o.companyName.toLowerCase().trim()}`));
      const additional: Opportunity[] = [];

      for (const j of parsed) {
        if (!j || (j.status !== 'open' && j.status !== 'Aberta') || deletedIds.has(j.id)) continue;
        const opp = this.convertCompanyJobToOpportunity(j);
        const titleKey = `${opp.title.toLowerCase().trim()}::${opp.companyName.toLowerCase().trim()}`;
        if (!existingIds.has(opp.id) && !existingTitles.has(titleKey)) {
          additional.push(opp);
          existingIds.add(opp.id);
          existingTitles.add(titleKey);
        }
      }

      return [...additional, ...cleanApiList];
    } catch {
      return apiList;
    }
  }

  private convertCompanyJobToOpportunity(job: any): Opportunity {
    const loc = job.location || {};
    const sched = job.schedule || {};
    const totalSlots = job.slots?.total ?? job.spotsTotal ?? 1;
    const filledSlots = job.slots?.filled ?? 0;
    const availableSlots = Math.max(0, totalSlots - filledSlots);

    return {
      id: String(job.id || `comp-opp-${Date.now()}`),
      companyId: job.companyId || 'comp-001',
      title: job.title || 'Novo Turno',
      companyName: job.companyName || 'Empresa Contratante',
      companyRating: 5.0,
      companyReviewsCount: 0,
      category: job.category || 'Gastronomia',
      location: {
        city: loc.city || 'São Paulo',
        neighborhood: loc.neighborhood || 'Centro',
        distanceKm: typeof loc.distanceKm === 'number' ? loc.distanceKm : 2.0,
        address: loc.address || ''
      },
      date: job.date || 'Hoje',
      isToday: job.date === 'Hoje' || job.isToday === true,
      schedule: {
        start: sched.start || '18:00',
        end: sched.end || '23:00',
        totalHours: sched.totalHours || 5
      },
      payment: {
        amount: job.paymentAmount || job.payment?.amount || 150,
        type: 'diaria',
        pixImmediate: true
      },
      requiredLevel: job.requiredLevel || 1,
      matchPercentage: 100,
      status: 'available',
      description: `Oportunidade para ${job.title} com pagamento garantido via PIX.`,
      requirements: Array.isArray(job.requirements) && job.requirements.length > 0
        ? job.requirements
        : ['Aparência profissional e pontualidade'],
      spotsAvailable: availableSlots,
      spotsTotal: totalSlots,
      applied: false
    };
  }

  private applyFilters(list: Opportunity[], filters?: OpportunityFilters): Opportunity[] {
    if (!filters) {
      return list;
    }

    let result = [...list];

    // Busca textual por título, empresa, descrição ou bairro
    if (filters.searchQuery && filters.searchQuery.trim() !== '') {
      const query = filters.searchQuery.toLowerCase().trim();
      result = result.filter(
        o =>
          o.title?.toLowerCase().includes(query) ||
          o.companyName?.toLowerCase().includes(query) ||
          o.description?.toLowerCase().includes(query) ||
          o.location?.neighborhood?.toLowerCase().includes(query) ||
          o.category?.toLowerCase().includes(query)
      );
    }

    // Filtro de Categoria
    if (filters.category && filters.category !== 'Todas' && (filters.category as string) !== 'all') {
      result = result.filter(
        o => o.category?.toLowerCase() === filters.category!.toLowerCase()
      );
    }

    // Filtro de Distância Máxima
    if (filters.maxDistanceKm && filters.maxDistanceKm > 0) {
      result = result.filter(o => {
        const dist = o.location?.distanceKm;
        return dist !== undefined ? dist <= filters.maxDistanceKm! : true;
      });
    }

    // Filtro Para Hoje / Urgentes
    if (filters.onlyTodayOrUrgent) {
      result = result.filter(o => o.isToday || o.status === 'urgency' || o.date === 'Hoje');
    }

    // Na aba "Para Você" (sem filtros restritivos de categoria/busca/urgente):
    // Se nenhum filtro estrito foi preenchido ou o resultado ficou vazio e não há busca específica,
    // garanta exibição das oportunidades disponíveis para que o usuário e a empresa auditando nunca vejam tela vazia
    const hasSpecificSearch = !!(filters.searchQuery && filters.searchQuery.trim() !== '');
    const hasSpecificCategory = !!(filters.category && filters.category !== 'Todas' && (filters.category as string) !== 'all');
    const isAuditingOrNoStrictGeo = !filters.maxDistanceKm || this.authService?.userRole() === 'contractor';

    if (result.length === 0 && list.length > 0 && !hasSpecificSearch && !hasSpecificCategory && isAuditingOrNoStrictGeo) {
      result = [...list];
    }

    // Ordenação
    if (filters.sortBy) {
      switch (filters.sortBy) {
        case 'highest_pay':
          result.sort((a, b) => b.payment.amount - a.payment.amount);
          break;
        case 'closest':
          result.sort((a, b) => (a.location?.distanceKm ?? 0) - (b.location?.distanceKm ?? 0));
          break;
        case 'highest_match':
        default:
          result.sort((a, b) => b.matchPercentage - a.matchPercentage);
          break;
      }
    } else {
      result.sort((a, b) => b.matchPercentage - a.matchPercentage);
    }

    return result;
  }
}

