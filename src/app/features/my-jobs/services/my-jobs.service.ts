import { Injectable, signal, computed, inject } from '@angular/core';
import { Observable, from, of } from 'rxjs';
import { JobApplication, TRAMPOU_APPLICATIONS_STORAGE_KEY } from '../models/job-application.model';
import { ApiClientService } from '../../../core/services/api-client.service';
import { API_ENDPOINTS } from '../../../core/constants/api-endpoints';

@Injectable({
  providedIn: 'root'
})
export class MyJobsService {
  private apiClient = inject(ApiClientService);

  private applicationsState = signal<JobApplication[]>([]);
  readonly isLoading = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);

  readonly applications = this.applicationsState.asReadonly();

  // 1. Confirmados (Aceitos)
  readonly acceptedJobs = computed(() =>
    this.applications().filter(a => a.status === 'accepted')
  );

  // 2. Em Análise (Aguardando)
  readonly pendingJobs = computed(() =>
    this.applications().filter(a => a.status === 'pending')
  );

  // 3. Histórico (Concluídos)
  readonly completedJobs = computed(() =>
    this.applications().filter(a => a.status === 'completed')
  );

  // Métrica 1: A Receber (Total previsto de confirmados)
  readonly toReceiveAmount = computed(() =>
    this.acceptedJobs().reduce((sum, item) => sum + (item.payment?.amount ?? 0), 0)
  );

  // Métrica 2: Recebido no Mês (Total pago via PIX dos concluídos)
  readonly receivedThisMonthAmount = computed(() =>
    this.completedJobs().reduce((sum, item) => sum + (item.payment?.amount ?? 0), 0)
  );

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('trampou:application-created', (e: any) => {
        const newApp: JobApplication = e?.detail;
        if (newApp) {
          this.applicationsState.update(list => {
            if (list.some(a => a.id === newApp.id || a.opportunityId === newApp.opportunityId)) {
              return list;
            }
            return [newApp, ...list];
          });
        }
      });

      window.addEventListener('trampou:application-updated', (e: any) => {
        const updated = e?.detail;
        if (updated?.id || updated?.opportunityId) {
          this.applicationsState.update(list =>
            list.map(a => {
              if (a.id === updated.id || a.opportunityId === updated.opportunityId || a.opportunityId === updated.id) {
                return { ...a, ...updated };
              }
              return a;
            })
          );
        }
      });
    }
  }

  loadStoredApplications(): JobApplication[] {
    if (typeof localStorage === 'undefined') return [];
    try {
      const raw = localStorage.getItem(TRAMPOU_APPLICATIONS_STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  persistApplicationsLocally(apps: JobApplication[]): void {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(TRAMPOU_APPLICATIONS_STORAGE_KEY, JSON.stringify(apps));
    } catch {}
  }

  async fetchConfirmedJobs(): Promise<JobApplication[]> {
    this.isLoading.set(true);
    try {
      const data = await this.apiClient.get<JobApplication[]>(API_ENDPOINTS.MY_JOBS.CONFIRMED);
      const apiList = (data || []).map(j => ({ ...j, status: 'accepted' as const }));
      const storedAccepted = this.loadStoredApplications().filter(a => a.status === 'accepted');

      const apiOppIds = new Set(apiList.map(a => a.opportunityId || a.id));
      const localMissing = storedAccepted.filter(a => !apiOppIds.has(a.opportunityId) && !apiOppIds.has(a.id));
      const merged = [...localMissing, ...apiList];

      this.applicationsState.update(prev => {
        const others = prev.filter(p => p.status !== 'accepted');
        return [...others, ...merged];
      });
      return merged;
    } catch (error: any) {
      const storedAccepted = this.loadStoredApplications().filter(a => a.status === 'accepted');
      this.applicationsState.update(prev => {
        const others = prev.filter(p => p.status !== 'accepted');
        return [...others, ...storedAccepted];
      });
      return storedAccepted;
    } finally {
      this.isLoading.set(false);
    }
  }

  async fetchUnderReviewJobs(): Promise<JobApplication[]> {
    this.isLoading.set(true);
    try {
      const data = await this.apiClient.get<JobApplication[]>(API_ENDPOINTS.MY_JOBS.UNDER_REVIEW);
      const apiList = (data || []).map(j => ({ ...j, status: 'pending' as const }));
      const storedPending = this.loadStoredApplications().filter(a => a.status === 'pending');

      const apiOppIds = new Set(apiList.map(a => a.opportunityId || a.id));
      const localMissing = storedPending.filter(a => !apiOppIds.has(a.opportunityId) && !apiOppIds.has(a.id));
      const merged = [...localMissing, ...apiList];

      this.applicationsState.update(prev => {
        const others = prev.filter(p => p.status !== 'pending');
        return [...others, ...merged];
      });
      return merged;
    } catch (error: any) {
      const storedPending = this.loadStoredApplications().filter(a => a.status === 'pending');
      this.applicationsState.update(prev => {
        const others = prev.filter(p => p.status !== 'pending');
        return [...others, ...storedPending];
      });
      return storedPending;
    } finally {
      this.isLoading.set(false);
    }
  }

  async fetchHistoryJobs(): Promise<JobApplication[]> {
    this.isLoading.set(true);
    try {
      const data = await this.apiClient.get<JobApplication[]>(API_ENDPOINTS.MY_JOBS.HISTORY);
      const list = (data || []).map(j => ({ ...j, status: 'completed' as const }));
      this.applicationsState.update(prev => {
        const others = prev.filter(p => p.status !== 'completed');
        return [...others, ...list];
      });
      return list;
    } catch (error: any) {
      this.errorMessage.set(error?.message || 'Erro ao carregar histórico de turnos.');
      return [];
    } finally {
      this.isLoading.set(false);
    }
  }

  async loadAllJobs(): Promise<void> {
    await Promise.allSettled([
      this.fetchConfirmedJobs(),
      this.fetchUnderReviewJobs(),
      this.fetchHistoryJobs()
    ]);
  }

  async checkIn(jobId: string): Promise<{ success: boolean; time: string }> {
    try {
      const res = await this.apiClient.post<{ success: boolean; time: string }>(
        API_ENDPOINTS.MY_JOBS.CHECK_IN(jobId)
      );
      if (res?.success) {
        this.applicationsState.update(list =>
          list.map(item =>
            item.id === jobId || item.opportunityId === jobId
              ? { ...item, checkInStatus: 'checked_in', checkInTime: res.time }
              : item
          )
        );
      }
      return res;
    } catch (error) {
      return { success: false, time: '' };
    }
  }

  async cancelShift(jobId: string): Promise<boolean> {
    try {
      const res = await this.apiClient.delete<boolean>(API_ENDPOINTS.MY_JOBS.CANCEL_SHIFT(jobId));
      this.applicationsState.update(list =>
        list.filter(item => item.id !== jobId && item.opportunityId !== jobId)
      );

      const stored = this.loadStoredApplications();
      const updatedStored = stored.filter(a => a.id !== jobId && a.opportunityId !== jobId);
      this.persistApplicationsLocally(updatedStored);

      return !!res;
    } catch (error) {
      this.applicationsState.update(list =>
        list.filter(item => item.id !== jobId && item.opportunityId !== jobId)
      );
      const stored = this.loadStoredApplications();
      const updatedStored = stored.filter(a => a.id !== jobId && a.opportunityId !== jobId);
      this.persistApplicationsLocally(updatedStored);
      return false;
    }
  }

  getApplications(): Observable<JobApplication[]> {
    return of(this.applications());
  }

  confirmCheckIn(applicationId: string): Observable<{ success: boolean; time: string }> {
    return from(this.checkIn(applicationId));
  }

  cancelApplication(applicationId: string): Observable<boolean> {
    return from(this.cancelShift(applicationId));
  }

  withdrawJob(applicationId: string, _reason?: string): Observable<boolean> {
    return from(this.cancelShift(applicationId));
  }

  addPendingApplication(app: Partial<JobApplication>): void {
    const newApp: JobApplication = {
      id: app.id || `app-${Date.now()}`,
      opportunityId: app.opportunityId || `opp-${Date.now()}`,
      title: app.title || app.opportunityTitle || 'Oportunidade',
      opportunityTitle: app.opportunityTitle || app.title || 'Oportunidade',
      companyName: app.companyName || 'Empresa Contratante',
      companyId: app.companyId || 'comp-001',
      candidateId: app.candidateId || 'cand-pedro-1',
      candidateName: app.candidateName || 'Pedro Silva',
      candidateAvatar: app.candidateAvatar || 'PS',
      remuneration: app.remuneration || app.payment?.amount || 150,
      category: app.category || 'Operacional',
      location: app.location || {
        city: 'São Paulo',
        neighborhood: 'Pinheiros',
        address: 'São Paulo, SP'
      },
      date: app.date || 'Hoje',
      isToday: app.isToday !== undefined ? app.isToday : true,
      schedule: app.schedule || { start: '18:00', end: '00:00', totalHours: 6 },
      payment: app.payment || { amount: 150, type: 'diaria', pixImmediate: true },
      status: 'pending',
      appliedAt: app.appliedAt || new Date(),
      responseTimeRemaining: app.responseTimeRemaining || 'Resposta em até 30 min'
    };

    // Salva no storage local persistente
    const stored = this.loadStoredApplications().filter(a => a.id !== newApp.id && a.opportunityId !== newApp.opportunityId);
    this.persistApplicationsLocally([newApp, ...stored]);

    // Atualiza o estado reativo
    this.applicationsState.update(list => [newApp, ...list.filter(a => a.id !== newApp.id && a.opportunityId !== newApp.opportunityId)]);

    // Dispara evento para outros serviços
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('trampou:application-created', { detail: newApp }));
    }
  }
}
