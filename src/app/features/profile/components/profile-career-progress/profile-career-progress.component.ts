import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserCareerLevel } from '../../models/user-profile.model';
import { TpIconComponent } from '../../../../shared/components/icon/icon.component';

@Component({
  selector: 'tp-profile-career-progress',
  standalone: true,
  imports: [CommonModule, TpIconComponent],
  templateUrl: './profile-career-progress.component.html',
  styleUrl: './profile-career-progress.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileCareerProgressComponent {
  @Input() careerLevel: UserCareerLevel | null = null;

  get currentPoints(): number {
    return this.careerLevel?.currentPoints ?? 0;
  }

  get targetPoints(): number {
    return this.careerLevel?.targetPoints ?? 20;
  }

  get progressPercentage(): number {
    if (!this.targetPoints || this.targetPoints <= 0) return 100;
    return Math.min(Math.round((this.currentPoints / this.targetPoints) * 100), 100);
  }

  get remainingShifts(): number {
    return Math.max(this.targetPoints - this.currentPoints, 0);
  }

  get currentLevelTitle(): string {
    return this.careerLevel?.levelName || (this.careerLevel?.currentLevel ? `Nível ${this.careerLevel.currentLevel}` : 'Nível 1 — Iniciante');
  }

  get nextLevelTitle(): string {
    return this.careerLevel?.nextLevelName || (this.careerLevel?.currentLevel ? `Nível ${this.careerLevel.currentLevel + 1}` : 'Nível 2 — Experiente');
  }

  get benefitDescription(): string {
    if (this.careerLevel?.benefitText) {
      return this.careerLevel.benefitText;
    }
    return this.remainingShifts > 0
      ? `Faltam ${this.remainingShifts} turnos para avançar para o ${this.nextLevelTitle}.`
      : `Parabéns! Você alcançou a pontuação para o ${this.nextLevelTitle}.`;
  }
}
