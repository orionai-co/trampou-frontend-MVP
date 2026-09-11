import { Injectable, signal, computed, inject } from '@angular/core';
import { CompanyJob, Candidate, CompanyMetrics } from '../models/company-job.model';
import { ShiftChatService } from '../../../core/services/shift-chat.service';
import { ApiClientService } from '../../../core/services/api-client.service';
import { API_ENDPOINTS } from '../../../core/constants/api-endpoints';
import { ChatContact } from '../../../shared/components';
import { AuthService } from '../../../core/services/auth.service';
import { OpportunityService, TRAMPOU_COMPANY_JOBS_STORAGE_KEY } from '../../opportunities/services/opportunity.service';
import { TRAMPOU_APPLICATIONS_STORAGE_KEY } from '../../my-jobs/models/job-application.model';

@Injectable({
  providedIn: 'root'
})
export class CompanyService {
  private readonly apiClient = inject(ApiClientService);
  private readonly shiftChatService = inject(ShiftChatService);
  private readonly authService = inject(AuthService, { optional: true });
  private readonly opportunityService = inject(OpportunityService, { optional: true });

  private readonly _jobs = signal<CompanyJob[]>([]);
  readonly jobs = this._jobs.asReadonly();

  readonly companyProfile = signal({
    name: 'Empresa Contratante',
    verified: true,
    category: 'Gastronomia & Eventos',
    rating: 5.0,
    completedShiftsTotal: 0
  });

  readonly contacts = signal<ChatContact[]>([]);
  readonly metricsState = signal<CompanyMetrics>({
    openJobs: 0,
    candidatesUnderReview: 0,
    completedShifts: 0
  });

  readonly isLoading = signal<boolean>(false);
  readonly contactsLoading = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);

  // Solicitação reativa para abertura do modal de publicação de vaga corporativa
  readonly isCreateJobModalRequested = signal<boolean>(false);

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('trampou:application-created', (e: any) => {
        const app = e?.detail;
        if (app) {
          this._jobs.update(list => this.enrichJobsWithApplications(list));
        }
      });
    }
  }

  private enrichJobsWithApplications(jobs: CompanyJob[]): CompanyJob[] {
    if (typeof localStorage === 'undefined') return jobs;
    try {
      const raw = localStorage.getItem(TRAMPOU_APPLICATIONS_STORAGE_KEY);
      if (!raw) return jobs;
      const apps = JSON.parse(raw);
      if (!Array.isArray(apps)) return jobs;

      return jobs.map(job => {
        const jobCandidates = [...(job.candidates || [])];
        const existingCandIds = new Set(jobCandidates.map(c => c.id));
        const existingCandNames = new Set(jobCandidates.map(c => c.name.toLowerCase().trim()));

        for (const app of apps) {
          if (!app) continue;
          const matchId = app.opportunityId === job.id || app.id === job.id;
          const matchTitle = (app.opportunityTitle && job.title && app.opportunityTitle.toLowerCase().trim() === job.title.toLowerCase().trim()) ||
                             (app.title && job.title && app.title.toLowerCase().trim() === job.title.toLowerCase().trim());

          if (matchId || matchTitle) {
            const candId = app.candidateId || `cand-${app.id}`;
            const candName = app.candidateName || 'Pedro Silva';

            if (!existingCandIds.has(candId) && !existingCandNames.has(candName.toLowerCase().trim())) {
              const newCand: Candidate = {
                id: candId,
                name: candName,
                avatarInitials: app.candidateAvatar || 'PS',
                level: 2,
                rating: 4.9,
                reviewsCount: 18,
                matchPercentage: 96,
                punctualityRate: 100,
                pixKeyPreview: 'pedro***@gmail.com',
                status: app.status === 'accepted' ? 'approved' : app.status === 'rejected' ? 'rejected' : 'applied',
                roleTitle: job.title,
                bio: 'Profissional pontual e qualificado para suporte operacional.'
              };
              jobCandidates.push(newCand);
              existingCandIds.add(candId);
              existingCandNames.add(candName.toLowerCase().trim());
            }
          }
        }

        return {
          ...job,
          candidates: jobCandidates
        };
      });
    } catch {
      return jobs;
    }
  }

  openCreateJobModalRequest(): void {
    this.isCreateJobModalRequested.set(true);
  }

  clearCreateJobModalRequest(): void {
    this.isCreateJobModalRequested.set(false);
  }

  readonly metrics = computed<CompanyMetrics>(() => {
    const backendMetrics = this.metricsState();
    if (backendMetrics.openJobs > 0 || backendMetrics.candidatesUnderReview > 0 || backendMetrics.completedShifts > 0) {
      return backendMetrics;
    }
    const list = this._jobs();
    const openJobs = list.filter(j => j.status === 'open').length;
    const candidatesUnderReview = list
      .filter(j => j.status === 'open' || j.status === 'in_progress')
      .reduce((total, job) => total + (job.candidates || []).filter(c => c.status === 'applied').length, 0);
    const completedInApp = list.filter(j => j.status === 'completed').length;
    const completedShifts = this.companyProfile().completedShiftsTotal + completedInApp;

    return {
      openJobs,
      candidatesUnderReview,
      completedShifts
    };
  });

  readonly activeJobs = computed<CompanyJob[]>(() => {
    return this._jobs().filter(j => j.status === 'open' || j.status === 'in_progress');
  });

  readonly historyJobs = computed<CompanyJob[]>(() => {
    return this._jobs().filter(j => j.status === 'completed' || j.status === 'cancelled');
  });

  /**
   * Carrega todos os dados do painel da empresa em paralelo
   */
  async fetchAllDashboardData(): Promise<void> {
    this.isLoading.set(true);
    this.contactsLoading.set(true);
    this.errorMessage.set(null);

    try {
      const [profileRes, activeJobsRes, historyJobsRes, contactsRes, metricsRes] = await Promise.allSettled([
        this.fetchProfile(),
        this.fetchActiveJobs(),
        this.fetchHistoryJobs(),
        this.fetchContacts(),
        this.fetchMetrics()
      ]);

      const active = activeJobsRes.status === 'fulfilled' ? activeJobsRes.value : [];
      const history = historyJobsRes.status === 'fulfilled' ? historyJobsRes.value : [];
      this._jobs.set([...active, ...history]);

      if (contactsRes.status === 'fulfilled') {
        this.contacts.set(contactsRes.value);
      }

      if (metricsRes.status === 'fulfilled' && metricsRes.value) {
        this.metricsState.set(metricsRes.value);
      }

      if (profileRes.status === 'fulfilled' && profileRes.value) {
        this.companyProfile.update(current => ({
          ...current,
          ...profileRes.value
        }));
      }
    } catch (error: any) {
      this.errorMessage.set(error?.message || 'Erro ao carregar dados do painel da empresa.');
    } finally {
      this.isLoading.set(false);
      this.contactsLoading.set(false);
    }
  }

  /**
   * Busca perfil da empresa via GET /companies/me
   */
  async fetchProfile(): Promise<any> {
    try {
      const profile = await this.apiClient.get<any>(API_ENDPOINTS.COMPANY_DASHBOARD.PROFILE);
      if (profile) {
        this.companyProfile.update(c => ({
          ...c,
          name: profile.name || c.name,
          verified: profile.verified ?? c.verified,
          category: profile.category || c.category,
          rating: profile.rating ?? profile.reputation?.averageRating ?? c.rating,
          completedShiftsTotal: profile.completedShiftsTotal ?? profile.reputation?.totalCompletedShifts ?? c.completedShiftsTotal
        }));
      }
      return profile;
    } catch (error) {
      return null;
    }
  }

  private persistJobLocally(job: CompanyJob): void {
    if (typeof localStorage === 'undefined') return;
    try {
      const raw = localStorage.getItem(TRAMPOU_COMPANY_JOBS_STORAGE_KEY);
      let list: CompanyJob[] = [];
      if (raw) {
        try {
          list = JSON.parse(raw) || [];
        } catch {}
      }
      const filtered = list.filter(j => j && j.id !== job.id);
      localStorage.setItem(TRAMPOU_COMPANY_JOBS_STORAGE_KEY, JSON.stringify([job, ...filtered]));
    } catch {}
  }

  private notifyJobsUpdated(job?: CompanyJob): void {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('trampou:jobs-updated', { detail: job }));
    }
    this.opportunityService?.fetchOpportunities().catch(() => {});
  }

  /**
   * Busca vagas ativas via GET /companies/me/jobs/active
   */
  async fetchActiveJobs(): Promise<CompanyJob[]> {
    try {
      const jobs = await this.apiClient.get<CompanyJob[]>(API_ENDPOINTS.COMPANY_DASHBOARD.ACTIVE_JOBS);
      let list = Array.isArray(jobs) ? jobs : [];

      // Mescla com vagas locais salvas no localStorage
      if (typeof localStorage !== 'undefined') {
        try {
          const raw = localStorage.getItem(TRAMPOU_COMPANY_JOBS_STORAGE_KEY);
          if (raw) {
            const localJobs: CompanyJob[] = JSON.parse(raw);
            if (Array.isArray(localJobs)) {
              const apiIds = new Set(list.map(j => j.id));
              const extras = localJobs.filter(j => j && (j.status === 'open' || (j.status as any) === 'Aberta') && !apiIds.has(j.id));
              list = [...extras, ...list];
            }
          }
        } catch {}
      }

      // Enriquece com candidaturas ativas dos profissionais
      list = this.enrichJobsWithApplications(list);

      this._jobs.update(current => {
        const history = current.filter(j => j.status === 'completed' || j.status === 'cancelled');
        return [...list, ...history];
      });
      return list;
    } catch (error) {
      if (typeof localStorage !== 'undefined') {
        try {
          const raw = localStorage.getItem(TRAMPOU_COMPANY_JOBS_STORAGE_KEY);
          if (raw) {
            const localJobs: CompanyJob[] = JSON.parse(raw);
            if (Array.isArray(localJobs)) {
              const active = localJobs.filter(j => j && (j.status === 'open' || (j.status as any) === 'Aberta'));
              const enriched = this.enrichJobsWithApplications(active);
              this._jobs.set(enriched);
              return enriched;
            }
          }
        } catch {}
      }
      return [];
    }
  }

  /**
   * Alias de fetchActiveJobs para conformidade com a arquitetura
   */
  fetchCompanyActiveJobs(): Promise<CompanyJob[]> {
    return this.fetchActiveJobs();
  }

  /**
   * Criação de vaga enviando POST /company/jobs para o backend real e atualizando vagas ativas em tempo real
   */
  async createJobRemote(jobData: Partial<CompanyJob>): Promise<CompanyJob> {
    const user = this.authService?.currentUser();
    const companyName = jobData.companyName || this.companyProfile().name || user?.name || 'Empresa Contratante';
    const companyId = jobData.companyId || user?.id || 'comp-001';

    const enrichedJobData: Partial<CompanyJob> = {
      ...jobData,
      companyName,
      companyId,
      status: 'open'
    };

    try {
      const created = await this.apiClient.post<CompanyJob>(API_ENDPOINTS.COMPANY_DASHBOARD.CREATE_JOB, enrichedJobData);
      const finalJob: CompanyJob = {
        ...(created || enrichedJobData),
        id: created?.id || enrichedJobData.id || `comp-job-${Date.now()}`,
        status: 'open',
        companyName,
        companyId
      } as CompanyJob;

      const activeJobs = await this.fetchCompanyActiveJobs();
      if (!activeJobs.some(j => j.id === finalJob.id)) {
        this._jobs.update(list => [finalJob, ...list]);
      }

      this.persistJobLocally(finalJob);
      this.notifyJobsUpdated(finalJob);
      return finalJob;
    } catch (error) {
      const fallbackJob = this.createJob(enrichedJobData);
      this.persistJobLocally(fallbackJob);
      this.notifyJobsUpdated(fallbackJob);
      return fallbackJob;
    }
  }

  /**
   * Busca histórico de vagas via GET /companies/me/jobs/history
   */
  async fetchHistoryJobs(): Promise<CompanyJob[]> {
    try {
      const jobs = await this.apiClient.get<CompanyJob[]>(API_ENDPOINTS.COMPANY_DASHBOARD.HISTORY_JOBS);
      return Array.isArray(jobs) ? jobs : [];
    } catch (error) {
      return [];
    }
  }

  /**
   * Busca contatos de chat da empresa via GET /companies/me/contacts
   */
  async fetchContacts(): Promise<ChatContact[]> {
    this.contactsLoading.set(true);
    try {
      const contacts = await this.apiClient.get<ChatContact[]>(API_ENDPOINTS.COMPANY_DASHBOARD.CONTACTS);
      const list = Array.isArray(contacts) ? contacts : [];
      this.contacts.set(list);
      return list;
    } catch (error) {
      return [];
    } finally {
      this.contactsLoading.set(false);
    }
  }

  /**
   * Busca métricas corporativas via GET /companies/me/metrics
   */
  async fetchMetrics(): Promise<CompanyMetrics> {
    try {
      const metrics = await this.apiClient.get<CompanyMetrics>(API_ENDPOINTS.COMPANY_DASHBOARD.METRICS);
      if (metrics) {
        this.metricsState.set(metrics);
        return metrics;
      }
      return this.metrics();
    } catch (error) {
      return this.metrics();
    }
  }

  createJob(jobData: Partial<CompanyJob>): CompanyJob {
    const newId = jobData.id || `comp-job-${Date.now()}`;
    const user = this.authService?.currentUser();
    const companyName = jobData.companyName || this.companyProfile().name || user?.name || 'Empresa Contratante';
    const companyId = jobData.companyId || user?.id || 'comp-001';

    const newJob: CompanyJob = {
      id: newId,
      title: jobData.title || 'Novo Turno',
      category: jobData.category || 'Gastronomia',
      companyName,
      companyId,
      location: jobData.location || {
        city: 'São Paulo',
        neighborhood: 'Centro',
        address: 'Av. Paulista, 1000',
        distanceKm: 2.0
      },
      date: jobData.date || 'Hoje',
      schedule: jobData.schedule || {
        start: '18:00',
        end: '23:00',
        totalHours: 5
      },
      slots: {
        total: jobData.slots?.total || 1,
        filled: 0
      },
      paymentAmount: jobData.paymentAmount || 150,
      requiredLevel: jobData.requiredLevel || 1,
      status: 'open',
      requirements: jobData.requirements && jobData.requirements.length > 0
        ? jobData.requirements
        : ['Aparência profissional e pontualidade'],
      candidates: []
    };

    this._jobs.update(list => [newJob, ...list]);
    this.persistJobLocally(newJob);
    this.notifyJobsUpdated(newJob);
    return newJob;
  }

  approveCandidate(jobId: string, candidateId: string): void {
    let updatedJobToPersist: CompanyJob | undefined;

    this._jobs.update(list =>
      list.map(job => {
        if (job.id !== jobId) return job;

        let filledCount = job.slots.filled;
        const updatedCandidates = (job.candidates || []).map(candidate => {
          if (candidate.id === candidateId && candidate.status !== 'approved') {
            if (filledCount < job.slots.total) {
              filledCount += 1;
            }
            return { ...candidate, status: 'approved' as const };
          }
          return candidate;
        });

        const newStatus = filledCount >= job.slots.total ? 'in_progress' : job.status;

        const updated = {
          ...job,
          slots: {
            ...job.slots,
            filled: filledCount
          },
          status: newStatus,
          candidates: updatedCandidates
        };
        updatedJobToPersist = updated;
        return updated;
      })
    );

    if (updatedJobToPersist) {
      this.persistJobLocally(updatedJobToPersist);
    }

    // Sincroniza com o armazenamento de candidaturas e notifica Meus Trabalhos
    if (typeof localStorage !== 'undefined') {
      try {
        const raw = localStorage.getItem(TRAMPOU_APPLICATIONS_STORAGE_KEY);
        if (raw) {
          const apps = JSON.parse(raw);
          if (Array.isArray(apps)) {
            const updated = apps.map((a: any) => {
              if (a.opportunityId === jobId || a.id === jobId || a.candidateId === candidateId) {
                return { ...a, status: 'accepted' };
              }
              return a;
            });
            localStorage.setItem(TRAMPOU_APPLICATIONS_STORAGE_KEY, JSON.stringify(updated));
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('trampou:application-updated', {
                detail: { id: candidateId, opportunityId: jobId, status: 'accepted' }
              }));
            }
          }
        }
      } catch {}
    }
  }

  rejectCandidate(jobId: string, candidateId: string): void {
    let updatedJobToPersist: CompanyJob | undefined;

    this._jobs.update(list =>
      list.map(job => {
        if (job.id !== jobId) return job;

        let filledCount = job.slots.filled;
        const updatedCandidates = (job.candidates || []).map(candidate => {
          if (candidate.id === candidateId) {
            if (candidate.status === 'approved' && filledCount > 0) {
              filledCount -= 1;
            }
            return { ...candidate, status: 'rejected' as const };
          }
          return candidate;
        });

        const newStatus = filledCount < job.slots.total && job.status === 'in_progress' ? 'open' : job.status;

        const updated = {
          ...job,
          slots: {
            ...job.slots,
            filled: filledCount
          },
          status: newStatus,
          candidates: updatedCandidates
        };
        updatedJobToPersist = updated;
        return updated;
      })
    );

    if (updatedJobToPersist) {
      this.persistJobLocally(updatedJobToPersist);
    }

    if (typeof localStorage !== 'undefined') {
      try {
        const raw = localStorage.getItem(TRAMPOU_APPLICATIONS_STORAGE_KEY);
        if (raw) {
          const apps = JSON.parse(raw);
          if (Array.isArray(apps)) {
            const updated = apps.map((a: any) => {
              if (a.opportunityId === jobId || a.id === jobId || a.candidateId === candidateId) {
                return { ...a, status: 'cancelled' };
              }
              return a;
            });
            localStorage.setItem(TRAMPOU_APPLICATIONS_STORAGE_KEY, JSON.stringify(updated));
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('trampou:application-updated', {
                detail: { id: candidateId, opportunityId: jobId, status: 'cancelled' }
              }));
            }
          }
        }
      } catch {}
    }
  }

  addCandidateToJob(jobIdOrTitle: string, candidate: Candidate): void {
    this._jobs.update(list =>
      list.map(job => {
        const match = job.id === jobIdOrTitle || job.title.toLowerCase() === jobIdOrTitle.toLowerCase();
        if (!match) return job;
        const cands = job.candidates || [];
        if (cands.some(c => c.id === candidate.id || c.name.toLowerCase().trim() === candidate.name.toLowerCase().trim())) {
          return job;
        }
        const updatedJob = { ...job, candidates: [candidate, ...cands] };
        this.persistJobLocally(updatedJob);
        return updatedJob;
      })
    );
  }

  getJobById(jobId: string): CompanyJob | undefined {
    return this._jobs().find(j => j.id === jobId);
  }

  completeShiftAndPayout(jobId: string): {
    job: CompanyJob;
    receiptData: {
      transactionId: string;
      amount: number;
      paidAt: string;
      companyName: string;
      freelancerName: string;
      pixKeyPreview: string;
      jobTitle: string;
    };
  } | null {
    const job = this.getJobById(jobId);
    if (!job) return null;

    // Atualiza status para 'completed'
    this._jobs.update(list =>
      list.map(j => (j.id === jobId ? { ...j, status: 'completed' as const } : j))
    );

    // Exclui sala efêmera vinculada ao turno encerrado
    this.shiftChatService.deleteRoomOnShiftEnd(jobId);

    // Incrementa métrica de turnos concluídos da empresa
    this.companyProfile.update(prof => ({
      ...prof,
      completedShiftsTotal: prof.completedShiftsTotal + 1
    }));

    const approvedCandidate = (job.candidates || []).find(c => c.status === 'approved') || (job.candidates || [])[0];
    const freelancerName = approvedCandidate?.name || 'Profissional Trampou';
    const pixKeyPreview = approvedCandidate?.pixKeyPreview || '***.842.190-**';

    const now = new Date();
    const paidAt = `${now.toLocaleDateString('pt-BR')} às ${now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;

    const receiptData = {
      transactionId: `PIX-${Date.now()}-${job.category.toUpperCase().slice(0, 4)}`,
      amount: job.paymentAmount,
      paidAt,
      companyName: this.companyProfile().name,
      freelancerName,
      pixKeyPreview,
      jobTitle: job.title
    };

    return {
      job: { ...job, status: 'completed' },
      receiptData
    };
  }
}
