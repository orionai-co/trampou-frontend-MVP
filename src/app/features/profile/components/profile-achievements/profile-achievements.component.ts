import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserAchievement } from '../../models/user-profile.model';
import { TpIconComponent, IconName } from '../../../../shared/components/icon/icon.component';

@Component({
  selector: 'tp-profile-achievements',
  standalone: true,
  imports: [CommonModule, TpIconComponent],
  templateUrl: './profile-achievements.component.html',
  styleUrl: './profile-achievements.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileAchievementsComponent {
  @Input() achievements: UserAchievement[] = [];

  readonly defaultAchievements: UserAchievement[] = [
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
  ];

  get displayedAchievements(): UserAchievement[] {
    if (this.achievements && this.achievements.length > 0) {
      return this.achievements;
    }
    return this.defaultAchievements;
  }

  get unlockedCount(): number {
    return this.displayedAchievements.length;
  }

  getAchievementIcon(icon: string): IconName {
    switch (icon) {
      case 'zap': return 'zap';
      case 'award': return 'award';
      case 'heart': return 'heart';
      case 'shield-check': return 'shield-check';
      case 'trophy': return 'award';
      case 'diamond': return 'sparkles';
      default: return 'award';
    }
  }

  trackByAchievementId(index: number, item: UserAchievement): string {
    return item.id;
  }
}
