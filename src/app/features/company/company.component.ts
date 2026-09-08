import { Component, signal, computed, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CompanyService } from './services/company.service';
import { CampaignService } from './services/campaign.service';
import { SponsoredCampaign } from '../../core/models/sponsored-campaign.model';
import { CompanyJob, Candidate } from './models/company-job.model';
import { CompanyDashboardHeaderComponent } from './components/company-dashboard-header/company-dashboard-header.component';
import { CompanyJobCardComponent } from './components/company-job-card/company-job-card.component';
import { CreateJobModalComponent } from './components/create-job-modal/create-job-modal.component';
import { CandidateSelectionModalComponent } from './components/candidate-selection-modal/candidate-selection-modal.component';
import { BoostCampaignModalComponent } from './components/boost-campaign-modal/boost-campaign-modal.component';
import { CompanyCampaignMetricsComponent } from './components/company-campaign-metrics/company-campaign-metrics.component';
import {
  TpIconComponent,
  TpButtonComponent,
  TpModalComponent,
  ShiftChatSidebarComponent,
  ChatContactsListComponent,
  ChatContact,
  RatingModalComponent,
  PixReceiptModalComponent,
  PixReceiptData,
  CandidateProfileModalComponent
} from '../../shared/components';
import { ShiftChatService } from '../../core/services/shift-chat.service';

export type CompanyTab = 'active' | 'history';

@Component({
  selector: 'app-company',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    CompanyDashboardHeaderComponent,
    CompanyJobCardComponent,
    CreateJobModalComponent,
    CandidateSelectionModalComponent,
    CandidateProfileModalComponent,
    BoostCampaignModalComponent,
    CompanyCampaignMetricsComponent,
    ShiftChatSidebarComponent,
    ChatContactsListComponent,
    RatingModalComponent,
    PixReceiptModalComponent,
    TpModalComponent,
    TpIconComponent,
    TpButtonComponent
  ],
  templateUrl: './company.component.html',
  styleUrl: './company.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CompanyComponent {
  readonly companyService = inject(CompanyService);
  readonly campaignService = inject(CampaignService);
  readonly shiftChatService = inject(ShiftChatService);

  activeTab = signal<CompanyTab>('active');
  isCreateModalOpen = signal<boolean>(false);
  isCandidateModalOpen = signal<boolean>(false);
  isBoostModalOpen = signal<boolean>(false);
  selectedJob = signal<CompanyJob | null>(null);
  feedbackMessage = signal<string | null>(null);

  // Lista Reativa de Contatos Ativos para o Painel Central de Mensagens
  readonly activeChatContacts = computed<ChatContact[]>(() => {
    const jobs = this.companyService.jobs();
    const contacts: ChatContact[] = [];

    for (const job of jobs) {
      const approvedCandidates = job.candidates.filter(c => c.status === 'approved');
      for (const cand of approvedCandidates) {
        const room = this.shiftChatService.getRoomByJobAndFreelancer(job.id, cand.id);
        const lastMsg = room?.messages && room.messages.length > 0
          ? room.messages[room.messages.length - 1]
          : undefined;

        contacts.push({
          jobId: job.id,
          jobTitle: job.title,
          candidateId: cand.id,
          candidateName: cand.name,
          avatarInitials: cand.avatarInitials,
          category: job.category,
          lastMessage: lastMsg?.text || 'Canal efêmero ativo para o turno',
          lastMessageTime: lastMsg?.timestamp || 'Hoje',
          isOnline: true
        });
      }
    }

    return contacts;
  });

  // Campo de busca de contatos
  contactSearchTerm = signal<string>('');

  get activeContactsCount(): number {
    return this.activeChatContacts().length;
  }

  readonly filteredChatContacts = computed<ChatContact[]>(() => {
    const term = this.contactSearchTerm().toLowerCase().trim();
    const contacts = this.activeChatContacts();
    if (!term) return contacts;
    return contacts.filter(c =>
      c.candidateName.toLowerCase().includes(term) ||
      c.jobTitle.toLowerCase().includes(term) ||
      (c.category && c.category.toLowerCase().includes(term))
    );
  });

  onContactSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.contactSearchTerm.set(input?.value || '');
  }

  // Chat Efêmero (Coluna da Extrema Direita / Docked)
  activeChatJob = signal<CompanyJob | null>(null);
  activeChatCandidate = signal<Candidate | null>(null);
  activeChatJobId = signal<string>('');
  activeChatJobTitle = signal<string>('');
  activeChatFreelancerName = signal<string>('');
  activeChatFreelancerId = signal<string>('');
  isMobileChatOpen = signal<boolean>(false);

  // Fechamento de Turno e Repasse PIX
  isConfirmPayoutModalOpen = signal<boolean>(false);
  jobPendingPayout = signal<CompanyJob | null>(null);
  candidatePendingPayout = signal<Candidate | null>(null);

  isReceiptModalOpen = signal<boolean>(false);
  receiptData = signal<PixReceiptData | null>(null);

  // Avaliação Mútua
  isRatingModalOpen = signal<boolean>(false);
  ratingShiftId = signal<string>('');
  ratingShiftTitle = signal<string>('');
  ratingTargetName = signal<string>('');
  ratingTargetId = signal<string>('');

  // Visualização de Perfil de Candidato
  isCandidateProfileModalOpen = signal<boolean>(false);
  profileCandidate = signal<Candidate | null>(null);
  profileJob = signal<CompanyJob | null>(null);

  onSelectTab(tab: CompanyTab): void {
    this.activeTab.set(tab);
  }

  openCandidateProfileDirect(candidate: Candidate, job?: CompanyJob): void {
    this.profileCandidate.set(candidate);
    this.profileJob.set(job || this.selectedJob() || null);
    this.isCandidateProfileModalOpen.set(true);
  }

  closeCandidateProfileDirect(): void {
    this.isCandidateProfileModalOpen.set(false);
    this.profileCandidate.set(null);
    this.profileJob.set(null);
  }

  handleProfileCandidateApproved(candidate: Candidate): void {
    const job = this.profileJob() || this.selectedJob();
    if (job) {
      this.handleCandidateApproved({ jobId: job.id, candidateId: candidate.id });
      this.closeCandidateProfileDirect();
    }
  }

  handleProfileCandidateRejected(candidate: Candidate): void {
    const job = this.profileJob() || this.selectedJob();
    if (job) {
      this.handleCandidateRejected({ jobId: job.id, candidateId: candidate.id });
      this.closeCandidateProfileDirect();
    }
  }

  openCreateJobModal(): void {
    this.isCreateModalOpen.set(true);
  }

  closeCreateJobModal(): void {
    this.isCreateModalOpen.set(false);
  }

  handleJobCreated(jobData: Partial<CompanyJob>): void {
    const created = this.companyService.createJob(jobData);
    this.activeTab.set('active');
    this.showFeedback(`Vaga "${created.title}" publicada com sucesso e já está visível para os profissionais!`);
  }

  openBoostModal(): void {
    this.isBoostModalOpen.set(true);
  }

  closeBoostModal(): void {
    this.isBoostModalOpen.set(false);
  }

  handleCampaignCreated(campaign: SponsoredCampaign): void {
    this.showFeedback(`Campanha "${campaign.title}" ativada com sucesso! Destaque visível para milhares de talentos.`);
  }

  openCandidatesModal(job: CompanyJob): void {
    const freshJob = this.companyService.getJobById(job.id) || job;
    this.selectedJob.set(freshJob);
    this.isCandidateModalOpen.set(true);
  }

  closeCandidatesModal(): void {
    this.isCandidateModalOpen.set(false);
    this.selectedJob.set(null);
  }

  handleCandidateApproved(event: { jobId: string; candidateId: string }): void {
    this.companyService.approveCandidate(event.jobId, event.candidateId);
    const updatedJob = this.companyService.getJobById(event.jobId);
    if (updatedJob) {
      this.selectedJob.set(updatedJob);
      const approved = updatedJob.candidates.find(c => c.id === event.candidateId);
      if (approved) {
        // Carrega automaticamente o chat na sidebar
        this.openChatForJob(updatedJob, approved);
      }
    }
    this.showFeedback('Candidato aprovado com sucesso! Chat efêmero aberto na barra lateral.');
  }

  handleCandidateRejected(event: { jobId: string; candidateId: string }): void {
    this.companyService.rejectCandidate(event.jobId, event.candidateId);
    const updatedJob = this.companyService.getJobById(event.jobId);
    if (updatedJob) {
      this.selectedJob.set(updatedJob);
    }
    // Se o chat aberto era com esse candidato, limpa sidebar
    if (this.activeChatCandidate()?.id === event.candidateId) {
      this.closeChatSidebar();
    }
    this.showFeedback('Candidatura recusada.');
  }

  // Abertura de Chat vinda do Modal de Seleção de Candidatos
  handleOpenCandidateChat(event: { candidate: Candidate; job: CompanyJob }): void {
    // 1. Fecha o modal de candidatos para liberar a visão do painel
    this.closeCandidatesModal();

    // 2. Foca no contato e carrega a conversa lateral
    this.openChatForJob(event.job, event.candidate);
  }

  // Abertura de Chat pela Lista Central de Contatos
  handleSelectContact(contact: ChatContact): void {
    const job = this.companyService.getJobById(contact.jobId);
    if (!job) return;
    const cand = job.candidates.find(c => c.id === contact.candidateId);
    this.openChatForJob(job, cand);
  }

  // Abertura de Chat na Janela da Extrema Direita
  openChatForJob(job: CompanyJob, candidate?: Candidate): void {
    this.isCandidateModalOpen.set(false);
    this.selectedJob.set(null);

    const targetCandidate = candidate || job.candidates.find(c => c.status === 'approved') || job.candidates[0];
    this.activeChatJob.set(job);
    this.activeChatCandidate.set(targetCandidate || null);
    this.activeChatJobId.set(job.id);
    this.activeChatJobTitle.set(job.title);
    this.activeChatFreelancerName.set(targetCandidate?.name || 'Profissional');
    this.activeChatFreelancerId.set(targetCandidate?.id || 'freelancer-user');
    this.isMobileChatOpen.set(true);
  }

  closeChatSidebar(): void {
    this.activeChatJob.set(null);
    this.activeChatCandidate.set(null);
    this.activeChatJobId.set('');
    this.activeChatJobTitle.set('');
    this.activeChatFreelancerName.set('');
    this.activeChatFreelancerId.set('');
    this.isMobileChatOpen.set(false);
  }

  // Payout e Fechamento de Turno
  openPayoutConfirmModal(job: CompanyJob, candidate?: Candidate): void {
    const targetCandidate = candidate || job.candidates.find(c => c.status === 'approved') || job.candidates[0];
    this.jobPendingPayout.set(job);
    this.candidatePendingPayout.set(targetCandidate || null);
    this.isConfirmPayoutModalOpen.set(true);
  }

  openPayoutFromSidebar(): void {
    const job = this.activeChatJob();
    if (job) {
      this.openPayoutConfirmModal(job, this.activeChatCandidate() || undefined);
    }
  }

  closePayoutConfirmModal(): void {
    this.isConfirmPayoutModalOpen.set(false);
    this.jobPendingPayout.set(null);
    this.candidatePendingPayout.set(null);
  }

  confirmPayoutAndCompleteShift(): void {
    const job = this.jobPendingPayout();
    if (!job) return;

    const result = this.companyService.completeShiftAndPayout(job.id);
    this.closePayoutConfirmModal();
    this.closeCandidatesModal();
    this.closeChatSidebar();

    if (result) {
      this.receiptData.set(result.receiptData);
      this.ratingShiftId.set(job.id);
      this.ratingShiftTitle.set(job.title);
      this.ratingTargetName.set(result.receiptData.freelancerName);
      this.ratingTargetId.set(this.candidatePendingPayout()?.id || 'cand-user');

      this.isReceiptModalOpen.set(true);
      this.showFeedback(`Turno finalizado com sucesso! Repasse PIX de R$ ${job.paymentAmount},00 transferido.`);
    }
  }

  closeReceiptModal(): void {
    this.isReceiptModalOpen.set(false);
  }

  openRatingModal(): void {
    this.isReceiptModalOpen.set(false);
    this.isRatingModalOpen.set(true);
  }

  closeRatingModal(): void {
    this.isRatingModalOpen.set(false);
  }

  handleReviewSubmitted(): void {
    this.showFeedback('Avaliação enviada com sucesso! Obrigado por fortalecer a comunidade.');
  }

  showFeedback(message: string): void {
    this.feedbackMessage.set(message);
    setTimeout(() => {
      if (this.feedbackMessage() === message) {
        this.feedbackMessage.set(null);
      }
    }, 4500);
  }

  dismissFeedback(): void {
    this.feedbackMessage.set(null);
  }

  trackByJobId(index: number, job: CompanyJob): string {
    return job.id;
  }
}
