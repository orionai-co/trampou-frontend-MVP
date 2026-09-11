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

  get displayedAchievements(): UserAchievement[] {
    return this.achievements || [];
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
