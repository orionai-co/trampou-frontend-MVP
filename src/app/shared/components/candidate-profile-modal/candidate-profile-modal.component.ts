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
    if (!candidate) return 'Profissional Trampou';
    if (candidate.roleTitle) return candidate.roleTitle;
    if (candidate.level === 3) return 'Especialista em Gastronomia & Eventos';
    if (candidate.level === 2) return 'Garçom de Salão • Eventos & Gastronomia';
    return 'Atendimento & Apoio Operacional';
  }

  getLocation(candidate: Candidate | null): string {
    if (!candidate) return 'São Paulo, SP';
    return candidate.location || 'São Paulo, SP (Raio de 3.5 km)';
  }

  getBio(candidate: Candidate | null): string {
    if (!candidate) return '';
    return (
      candidate.bio ||
      'Profissional dedicado com pontualidade comprovada na plataforma Trampou, focado em agilidade, boa apresentação e excelência no atendimento ao cliente.'
    );
  }

  getCompletedShifts(candidate: Candidate | null): number {
    if (!candidate) return 0;
    if (candidate.completedShiftsCount !== undefined) {
      return candidate.completedShiftsCount;
    }
    return Math.max(candidate.reviewsCount + 6, 12);
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
    if (candidate.level === 3) {
      return ['Chefia de Salão', 'Coquetelaria & Bar', 'Atendimento VIP', 'Organização de Buffet', 'Controle de Fluxo'];
    }
    if (candidate.level === 2) {
      return ['Garçom de Salão', 'Serviço de Bandeja', 'Atendimento & Bar', 'Recepção de Eventos', 'Boas Práticas de Higiene'];
    }
    return ['Apoio de Salão', 'Recepção', 'Organização de Mesas', 'Atendimento Ágil'];
  }

  getRecentReviews(candidate: Candidate | null): CandidateReview[] {
    if (!candidate) return [];
    if (candidate.recentReviews && candidate.recentReviews.length > 0) {
      return candidate.recentReviews;
    }
    return [
      {
        companyName: 'Buffet Vila Olímpia',
        rating: 5.0,
        comment: 'Excelente profissional! Chegou com antecedência, muito prestativo e com ótima postura diante dos clientes.',
        date: 'Há 4 dias',
        badge: 'Pontual e Proativo'
      },
      {
        companyName: 'Restaurante Terraço Paulista',
        rating: 4.8,
        comment: 'Muito ágil e focado durante todo o turno. Recomendo para eventos corporativos e alta demanda.',
        date: 'Há 2 semanas',
        badge: 'Excelente Postura'
      }
    ];
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
