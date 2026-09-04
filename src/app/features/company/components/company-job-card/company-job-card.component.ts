import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CompanyJob } from '../../models/company-job.model';
import {
  TpIconComponent,
  TpBadgeComponent,
  TpButtonComponent
} from '../../../../shared/components';

@Component({
  selector: 'tp-company-job-card',
  standalone: true,
  imports: [CommonModule, TpIconComponent, TpBadgeComponent, TpButtonComponent],
  templateUrl: './company-job-card.component.html',
  styleUrl: './company-job-card.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CompanyJobCardComponent {
  @Input({ required: true }) job!: CompanyJob;
  @Output() viewCandidates = new EventEmitter<CompanyJob>();
  @Output() completeJob = new EventEmitter<CompanyJob>();

  get appliedCandidatesCount(): number {
    if (!this.job || !this.job.candidates) return 0;
    return this.job.candidates.filter(c => c.status === 'applied').length;
  }

  get pendingCandidatesCount(): number {
    return this.appliedCandidatesCount;
  }

  get approvedCandidatesCount(): number {
    if (!this.job || !this.job.candidates) return 0;
    return this.job.candidates.filter(c => c.status === 'approved').length;
  }

  get totalCandidatesCount(): number {
    return this.job?.candidates?.length || 0;
  }

  get statusLabel(): string {
    switch (this.job.status) {
      case 'open': return 'Aberta';
      case 'in_progress': return 'Em Andamento';
      case 'completed': return 'Concluída';
      case 'cancelled': return 'Cancelada';
      default: return 'Aberta';
    }
  }

  get statusBadgeVariant(): 'accent' | 'success' | 'neutral' | 'danger' {
    switch (this.job.status) {
      case 'open': return 'accent';
      case 'in_progress': return 'success';
      case 'completed': return 'neutral';
      case 'cancelled': return 'danger';
      default: return 'accent';
    }
  }

  get fillPercentage(): number {
    if (!this.job.slots || this.job.slots.total === 0) return 0;
    return Math.min(100, Math.round((this.job.slots.filled / this.job.slots.total) * 100));
  }

  onCardAction(): void {
    this.viewCandidates.emit(this.job);
  }

  onCompleteAction(): void {
    this.completeJob.emit(this.job);
  }
}

