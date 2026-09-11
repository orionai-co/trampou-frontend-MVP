import { Injectable, signal, computed, inject } from '@angular/core';
import { UserProfile, EMPTY_USER_PROFILE, PixKeyConfig, PixKeyType } from '../models/user-profile.model';
import { ApiClientService } from './api-client.service';
import { API_ENDPOINTS } from '../constants/api-endpoints';

@Injectable({
  providedIn: 'root'
})
export class UserProfileService {
  private apiClient = inject(ApiClientService);

  private userProfileState = signal<UserProfile>(EMPTY_USER_PROFILE);

  readonly isLoading = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);

  readonly userRole = signal<'professional' | 'contractor'>('professional');

  readonly currentUser = this.userProfileState.asReadonly();
  readonly user = this.currentUser;

  readonly name = computed(() => this.currentUser().name || '');
  readonly shortName = computed(() => this.currentUser().shortName || this.currentUser().name || 'Usuário');
  readonly avatarInitials = computed(() => {
    if (this.currentUser().avatarInitials) {
      return this.currentUser().avatarInitials;
    }
    const name = this.currentUser().name?.trim();
    if (!name) return 'U';
    const parts = name.split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  });
  readonly email = computed(() => this.currentUser().email || '');
  readonly level = computed(() => this.currentUser().level || 1);
  readonly levelLabel = computed(() => this.currentUser().levelLabel || `Nível ${this.currentUser().level || 1}`);
  readonly rating = computed(() => this.currentUser().rating || 0);
  readonly reviewsCount = computed(() => this.currentUser().totalReviews ?? this.currentUser().reviewsCount ?? 0);
  readonly totalReviews = computed(() => this.currentUser().totalReviews ?? 0);
  readonly punctualityRate = computed(() => this.currentUser().punctualityRate ?? 0);
  readonly completedJobsCount = computed(() => this.currentUser().completedJobsCount ?? 0);
  readonly locationString = computed(() => {
    const loc = this.currentUser().location;
    if (!loc?.neighborhood && !loc?.city) return '';
    return `Base: ${loc.neighborhood || ''}, ${loc.city || ''}`;
  });
  readonly skills = computed(() => this.currentUser().skills || []);
  readonly reviews = computed(() => this.currentUser().reviews || []);
  readonly isVerified = computed(() => !!(this.currentUser().verified ?? this.currentUser().isVerified));
  readonly statusLabel = computed(() => this.currentUser().statusLabel || 'Online');

  readonly careerLevel = computed(() => this.currentUser().careerLevel || {
    currentLevel: this.currentUser().level || 1,
    levelName: this.currentUser().levelLabel || `Nível ${this.currentUser().level || 1}`,
    nextLevelName: `Nível ${(this.currentUser().level || 1) + 1}`,
    currentPoints: this.currentUser().completedJobsCount || 0,
    targetPoints: 20,
    benefitText: 'Complete turnos para avançar de nível e desbloquear novas oportunidades.'
  });

  readonly reliability = computed(() => this.currentUser().reliability || {
    attendanceRate: this.currentUser().punctualityRate || 0,
    completedShifts: this.currentUser().completedJobsCount || 0,
    cancellationRate: 0,
    avgResponseTime: '-'
  });

  readonly achievements = computed(() => this.currentUser().achievements || []);

  readonly pixKey = computed(() => {
    const pk = this.currentUser().pixKey;
    if (typeof pk === 'string') return pk;
    return pk?.key || '';
  });

  readonly pixKeyType = computed(() => {
    const pk = this.currentUser().pixKey;
    if (typeof pk === 'object' && pk?.type) {
      switch (pk.type) {
        case 'cpf': return 'CPF';
        case 'phone': return 'Celular / Telefone';
        case 'email': return 'E-mail';
        case 'random': return 'Chave Aleatória';
      }
    }
    return 'Chave PIX';
  });

  /**
   * Busca os dados reais do usuário logado via GET /users/me
   */
  async fetchUserProfile(): Promise<UserProfile> {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    try {
      const data = await this.apiClient.get<UserProfile>(API_ENDPOINTS.USER_PROFILE.ME);
      if (data) {
        const rawRole = ((data as any).role || '').toLowerCase().trim();
        let role: 'professional' | 'contractor' = 'professional';
        if (rawRole === 'contractor' || rawRole === 'company' || rawRole === 'enterprise') {
          role = 'contractor';
          this.userRole.set('contractor');
        } else if (rawRole === 'freelancer' || rawRole === 'professional') {
          role = 'professional';
          this.userRole.set('professional');
        }

        const normalized: UserProfile = {
          ...EMPTY_USER_PROFILE,
          ...data,
          role,
          location: data.location || EMPTY_USER_PROFILE.location,
          pixKey: data.pixKey || { type: 'phone', key: '' },
          skills: data.skills || [],
          reviews: data.reviews || [],
          achievements: data.achievements || []
        };
        this.userProfileState.set(normalized);
        return normalized;
      }
      return this.userProfileState();
    } catch (error: any) {
      const msg = error?.message || 'Erro ao carregar perfil do usuário.';
      this.errorMessage.set(msg);
      return this.userProfileState();
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Busca métricas de reputação via GET /users/me/reputation
   */
  async fetchReputation(): Promise<any> {
    try {
      const rep = await this.apiClient.get<any>(API_ENDPOINTS.USER_PROFILE.REPUTATION);
      if (rep) {
        this.updateProfile({
          rating: rep.rating ?? this.rating(),
          totalReviews: rep.totalReviews ?? this.totalReviews(),
          punctualityRate: rep.punctualityRate ?? this.punctualityRate(),
          completedJobsCount: rep.completedJobsCount ?? this.completedJobsCount(),
          reliability: {
            attendanceRate: rep.punctualityRate ?? rep.attendanceRate ?? 100,
            completedShifts: rep.completedJobsCount ?? rep.completedShifts ?? 0,
            cancellationRate: rep.cancellationRate ?? 0,
            avgResponseTime: rep.avgResponseTime ?? '-'
          }
        });
      }
      return rep;
    } catch (error) {
      return null;
    }
  }

  /**
   * Atualização remota da chave PIX via PUT /users/me/pix-key
   */
  async updatePixKeyRemote(config: PixKeyConfig): Promise<void> {
    this.updatePixKey(config);
    try {
      await this.apiClient.put(API_ENDPOINTS.USER_PROFILE.UPDATE_PIX, config);
    } catch (err) {
      // continua com estado atualizado
    }
  }

  updateProfile(partial: Partial<UserProfile>): void {
    if (partial.role) {
      const rawRole = partial.role.toLowerCase().trim();
      if (rawRole === 'contractor' || rawRole === 'company' || rawRole === 'enterprise') {
        this.userRole.set('contractor');
      } else if (rawRole === 'freelancer' || rawRole === 'professional') {
        this.userRole.set('professional');
      }
    }
    this.userProfileState.update(current => ({ ...current, ...partial }));
  }

  updatePixKey(config: PixKeyConfig): void {
    this.userProfileState.update(current => ({
      ...current,
      pixKey: config
    }));
  }

  updateSkills(skills: string[]): void {
    this.userProfileState.update(current => ({
      ...current,
      skills
    }));
  }

  addCustomSkill(skillName: string): void {
    const trimmed = skillName.trim();
    if (!trimmed) return;
    const current = this.userProfileState().skills || [];
    if (!current.some(s => s.toLowerCase() === trimmed.toLowerCase())) {
      this.updateSkills([...current, trimmed]);
    }
  }

  removeCustomSkill(skillName: string): void {
    const current = this.userProfileState().skills || [];
    this.updateSkills(current.filter(s => s.toLowerCase() !== skillName.toLowerCase()));
  }
}
