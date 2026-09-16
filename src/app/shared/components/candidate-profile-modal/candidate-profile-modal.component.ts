import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Candidate, CandidateReview, CompanyJob } from '../../../features/company/models/company-job.model';
import { TpModalComponent } from '../modal/modal.component';
import { TpButtonComponent } from '../button/button.component';
import { TpIconComponent } from '../icon/icon.component';

@Component({
  selector: 'tp-candidate-profile-modal',
  standalone: true,
  imports: [
    CommonModule,
    TpModalComponent,
    TpButtonComponent,
    TpIconComponent
  ],
  templateUrl: './candidate-profile-modal.component.html',
  styleUrl: './candidate-profile-modal.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CandidateProfileModalComponent {
  @Input() isOpen = false;
  @Input() candidate: Candidate | null = null;
  @Input() job: CompanyJob | null = null;
  @Input() isSlotsFull = false;

  @Output() closed = new EventEmitter<void>();
  @Output() approve = new EventEmitter<Candidate>();
  @Output() reject = new EventEmitter<Candidate>();

  getLevelLabel(level: number | undefined): string {
    switch (level) {
      case 3:
        return 'Nível 3 — Especialista';
      case 2:
        return 'Nível 2 — Experiente';
      case 1:
        return 'Nível 1 — Iniciante';
      default:
        return `Nível ${level || 1}`;
    }
  }

  getRoleTitle(candidate: Candidate | null): string {
    if (!candidate) return 'Profissional Cadastrado';
    return candidate.roleTitle || 'Profissional Cadastrado';
  }

  getLocation(candidate: Candidate | null): string {
    if (!candidate) return 'São Paulo, SP';
    return candidate.location || 'São Paulo, SP';
  }

  getBio(candidate: Candidate | null): string {
    if (!candidate) return '';
    return candidate.bio || 'Profissional cadastrado na plataforma Trampou.';
  }

  getCompletedShifts(candidate: Candidate | null): number {
    if (!candidate) return 0;
    return candidate.completedShiftsCount ?? (candidate.reviewsCount > 0 ? candidate.reviewsCount : 0);
  }

  hasReviews(candidate: Candidate | null): boolean {
    return !!(candidate && (candidate.reviewsCount > 0 || (candidate.recentReviews && candidate.recentReviews.length > 0)));
  }

  getMatchReasons(candidate: Candidate | null): string[] {
    if (!candidate) return [];
    if (candidate.matchReasons && candidate.matchReasons.length > 0) {
      return candidate.matchReasons;
    }
    const reasons: string[] = ['Categoria compatível', 'Proximidade geográfica'];
    if (candidate.punctualityRate >= 95) reasons.push('Alta pontualidade');
    if (candidate.level >= (this.job?.requiredLevel || 1)) reasons.push('Nível exigido atendido');
    return reasons;
  }

  getSkills(candidate: Candidate | null): string[] {
    if (!candidate) return [];
    if (candidate.skills && candidate.skills.length > 0) {
      return candidate.skills;
    }
    return ['Atendimento & Salão', 'Recepção', 'Organização Operacional', 'Pontualidade'];
  }

  getRecentReviews(candidate: Candidate | null): CandidateReview[] {
    if (!candidate) return [];
    return candidate.recentReviews || [];
  }

  onApprove(): void {
    if (this.candidate) {
      this.approve.emit(this.candidate);
    }
  }

  onReject(): void {
    if (this.candidate) {
      this.reject.emit(this.candidate);
    }
  }

  close(): void {
    this.closed.emit();
  }
}
