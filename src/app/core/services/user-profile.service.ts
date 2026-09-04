import { Injectable, signal, computed } from '@angular/core';
import { UserProfile, MOCK_USER_PROFILE, PixKeyConfig, PixKeyType } from '../models/user-profile.model';

@Injectable({
  providedIn: 'root'
})
export class UserProfileService {
  private userProfileState = signal<UserProfile>(MOCK_USER_PROFILE);

  readonly currentUser = this.userProfileState.asReadonly();
  readonly user = this.currentUser;
  readonly name = computed(() => this.currentUser().name);
  readonly shortName = computed(() => this.currentUser().shortName || this.currentUser().name);
  readonly avatarInitials = computed(() => this.currentUser().avatarInitials);
  readonly email = computed(() => this.currentUser().email || 'matheus.silva@email.com');
  readonly level = computed(() => this.currentUser().level);
  readonly levelLabel = computed(() => this.currentUser().levelLabel || `Nível ${this.currentUser().level}`);
  readonly rating = computed(() => this.currentUser().rating);
  readonly reviewsCount = computed(() => this.currentUser().totalReviews ?? this.currentUser().reviewsCount ?? 42);
  readonly totalReviews = computed(() => this.currentUser().totalReviews);
  readonly punctualityRate = computed(() => this.currentUser().punctualityRate);
  readonly completedJobsCount = computed(() => this.currentUser().completedJobsCount);
  readonly locationString = computed(() => `Base: ${this.currentUser().location.neighborhood}, ${this.currentUser().location.city}`);
  readonly skills = computed(() => this.currentUser().skills);
  readonly reviews = computed(() => this.currentUser().reviews);
  readonly isVerified = computed(() => this.currentUser().verified ?? this.currentUser().isVerified ?? true);
  readonly statusLabel = computed(() => this.currentUser().statusLabel || 'Online & Disponível');

  readonly careerLevel = computed(() => this.currentUser().careerLevel || {
    currentLevel: 2,
    levelName: 'Nível 2 — Experiente',
    nextLevelName: 'Nível 3 — Elite',
    currentPoints: 42,
    targetPoints: 50,
    benefitText: 'Faltam 8 turnos para o Nível 3. Profissionais Elite têm acesso prioritário a eventos corporativos de alto valor.'
  });

  readonly reliability = computed(() => this.currentUser().reliability || {
    attendanceRate: 100,
    completedShifts: 42,
    cancellationRate: 0,
    avgResponseTime: '< 5 min'
  });

  readonly achievements = computed(() => this.currentUser().achievements || [
    {
      id: 'ach-1',
      icon: 'zap',
      title: 'Top Pontualidade',
      description: '+20 turnos seguidos sem nenhum atraso registrado.',
      unlockedAt: 'Desbloqueado em Julho, 2026'
    },
    {
      id: 'ach-2',
      icon: 'award',
      title: 'Veterano do Salão',
      description: '+30 turnos concluídos no setor de Gastronomia.',
      unlockedAt: 'Desbloqueado em Junho, 2026'
    },
    {
      id: 'ach-3',
      icon: 'heart',
      title: 'Favorito dos Buffets',
      description: 'Recontratado por 3 ou mais empresas diferentes.',
      unlockedAt: 'Desbloqueado em Maio, 2026'
    },
    {
      id: 'ach-4',
      icon: 'shield-check',
      title: 'Presença Blindada',
      description: '0 cancelamentos em todo o histórico.',
      unlockedAt: 'Desbloqueado em Abril, 2026'
    }
  ]);

  readonly pixKey = computed(() => {
    const pk = this.currentUser().pixKey;
    if (typeof pk === 'string') return pk;
    return pk?.key || '(11) 98765-4321';
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
    return 'Chave Telefone / Celular';
  });

  updateProfile(partial: Partial<UserProfile>): void {
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
