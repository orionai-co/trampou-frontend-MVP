import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CompanyJob, Candidate } from '../../models/company-job.model';
import {
  TpModalComponent,
  TpButtonComponent,
  TpIconComponent,
  CandidateProfileModalComponent
} from '../../../../shared/components';

@Component({
  selector: 'tp-candidate-selection-modal',
  standalone: true,
  imports: [
    CommonModule,
    TpModalComponent,
    TpButtonComponent,
    TpIconComponent,
    CandidateProfileModalComponent
  ],
  templateUrl: './candidate-selection-modal.component.html',
  styleUrl: './candidate-selection-modal.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CandidateSelectionModalComponent {
  @Input() isOpen = false;
  @Input() job: CompanyJob | null = null;

  @Output() closed = new EventEmitter<void>();
  @Output() candidateApproved = new EventEmitter<{ jobId: string; candidateId: string }>();
  @Output() candidateRejected = new EventEmitter<{ jobId: string; candidateId: string }>();
  @Output() openChat = new EventEmitter<{ candidate: Candidate; job: CompanyJob }>();
  @Output() payoutCandidate = new EventEmitter<{ candidate: Candidate; job: CompanyJob }>();
  @Output() viewProfile = new EventEmitter<{ candidate: Candidate; job: CompanyJob }>();

  selectedCandidateForProfile: Candidate | null = null;
  isProfileModalOpen = false;

  get candidates(): Candidate[] {
    return this.job?.candidates || [];
  }

  get isSlotsFull(): boolean {
    if (!this.job) return false;
    return this.job.slots.filled >= this.job.slots.total;
  }

  openCandidateProfile(candidate: Candidate): void {
    this.selectedCandidateForProfile = candidate;
    this.isProfileModalOpen = true;
    if (this.job) {
      this.viewProfile.emit({ candidate, job: this.job });
    }
  }

  closeCandidateProfile(): void {
    this.isProfileModalOpen = false;
    this.selectedCandidateForProfile = null;
  }

  onProfileApprove(candidate: Candidate): void {
    this.onApprove(candidate);
    // Atualiza estado local no modal de perfil aberto se aplicável
    if (this.selectedCandidateForProfile && this.selectedCandidateForProfile.id === candidate.id) {
      this.selectedCandidateForProfile = {
        ...this.selectedCandidateForProfile,
        status: 'approved'
      };
    }
  }

  onProfileReject(candidate: Candidate): void {
    this.onReject(candidate);
    // Atualiza estado local no modal de perfil aberto se aplicável
    if (this.selectedCandidateForProfile && this.selectedCandidateForProfile.id === candidate.id) {
      this.selectedCandidateForProfile = {
        ...this.selectedCandidateForProfile,
        status: 'rejected'
      };
    }
  }

  onApprove(candidate: Candidate): void {
    if (!this.job) return;
    this.candidateApproved.emit({
      jobId: this.job.id,
      candidateId: candidate.id
    });
  }

  onReject(candidate: Candidate): void {
    if (!this.job) return;
    this.candidateRejected.emit({
      jobId: this.job.id,
      candidateId: candidate.id
    });
  }

  onOpenChat(candidate: Candidate): void {
    if (!this.job) return;
    this.openChat.emit({ candidate, job: this.job });
    this.close();
  }

  onPayout(candidate: Candidate): void {
    if (!this.job) return;
    this.payoutCandidate.emit({ candidate, job: this.job });
  }

  close(): void {
    this.closed.emit();
  }

  trackByCandidateId(index: number, candidate: Candidate): string {
    return candidate.id;
  }
}
