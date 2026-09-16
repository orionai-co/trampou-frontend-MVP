import { Component, OnInit, signal, computed, ChangeDetectionStrategy, inject, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { JobApplication } from './models/job-application.model';
import { MyJobsService } from './services/my-jobs.service';
import { ShiftChatService, buildChannelId } from '../../core/services/shift-chat.service';
import { JobStatusItemComponent } from './components/job-status-item/job-status-item.component';
import { CheckInModalComponent } from './components/check-in-modal/check-in-modal.component';
import {
  TpButtonComponent,
  TpIconComponent,
  TpModalComponent,
  ChatContactsListComponent,
  ChatContact,
  ShiftChatSidebarComponent,
  ShiftChatModalComponent,
  RatingModalComponent
} from '../../shared/components';

import { UserProfileService } from '../../core/services/user-profile.service';
import { AuthService } from '../../core/services/auth.service';

export type MyJobsTab = 'accepted' | 'pending' | 'completed';

@Component({
  selector: 'app-my-jobs',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    JobStatusItemComponent,
    CheckInModalComponent,
    ChatContactsListComponent,
    ShiftChatSidebarComponent,
    ShiftChatModalComponent,
    RatingModalComponent,
    TpButtonComponent,
    TpIconComponent,
    TpModalComponent
  ],
  templateUrl: './my-jobs.component.html',
  styleUrl: './my-jobs.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MyJobsComponent implements OnInit {
  readonly myJobsService = inject(MyJobsService);
  readonly shiftChatService = inject(ShiftChatService);
  readonly userProfileService = inject(UserProfileService);
  private readonly authService = inject(AuthService, { optional: true });
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  activeTab = signal<MyJobsTab>('accepted');
  selectedJob = signal<JobApplication | null>(null);

  getEffectiveFreelancerId(job?: JobApplication): string {
    const user = this.authService?.currentUser();
    return job?.candidateId || user?.id || 'cand-pedro-1';
  }

  // Chat Integrado (Master-Detail em 3 Colunas)
  activeChatJobId = signal<string>('');
  activeChatJobTitle = signal<string>('');
  activeChatCompanyName = signal<string>('');
  activeChatFreelancerName = signal<string>(this.userProfileService.name() || 'Profissional');
  activeChatFreelancerId = signal<string>(this.getEffectiveFreelancerId());
  isMobileChatOpen = signal<boolean>(false);

  // Lista Reativa de Contatos Ativos (Empresas parceiras com turnos confirmados)
  readonly activeChatContacts = computed<ChatContact[]>(() => {
    // Escuta reativa do signal de salas para atualizar a lista ao vivo
    this.shiftChatService.rooms();
    const accepted = this.myJobsService.acceptedJobs();
    const contacts: ChatContact[] = [];

    for (const job of accepted) {
      const jobId = job.opportunityId || job.id;
      const candId = this.getEffectiveFreelancerId(job);
      const channelId = buildChannelId(jobId, candId);
      const room = this.shiftChatService.getRoomByJobAndFreelancer(jobId, candId) || this.shiftChatService.getRoomByJobId(jobId);
      const storedMsgs = this.shiftChatService.getMessagesByChannel(channelId);
      const msgs = storedMsgs.length > 0 ? storedMsgs : (room?.messages || []);
      const lastMsg = msgs.length > 0 ? msgs[msgs.length - 1] : undefined;

      const initials = job.companyName
        .split(' ')
        .slice(0, 2)
        .map((w: string) => w[0])
        .join('')
        .toUpperCase();

      contacts.push({
        jobId,
        jobTitle: job.title,
        candidateId: candId,
        candidateName: job.companyName,
        avatarInitials: initials || 'EM',
        category: job.category,
        lastMessage: lastMsg?.text || 'Canal de alinhamento operacional ativo',
        lastMessageTime: lastMsg?.timestamp || 'Hoje',
        isOnline: true
      });
    }

    return contacts;
  });

  isCheckInModalOpen = signal<boolean>(false);
  isInstructionsModalOpen = signal<boolean>(false);
  isReceiptModalOpen = signal<boolean>(false);
  isWithdrawModalOpen = signal<boolean>(false);
  isChatModalOpen = signal<boolean>(false);
  isRatingModalOpen = signal<boolean>(false);

  feedbackMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.myJobsService.loadAllJobs();
    this.route.queryParams
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(params => {
        const tab = params['tab'];
        if (tab === 'pending' || tab === 'accepted' || tab === 'completed') {
          this.activeTab.set(tab);
        }
      });
  }

  onSelectTab(tab: MyJobsTab): void {
    this.activeTab.set(tab);
  }

  openCheckInModal(job: JobApplication): void {
    this.selectedJob.set(job);
    this.isCheckInModalOpen.set(true);
  }

  closeCheckInModal(): void {
    this.isCheckInModalOpen.set(false);
  }

  handleCheckInConfirmed(job: JobApplication): void {
    this.myJobsService.confirmCheckIn(job.id).subscribe(res => {
      if (res.success) {
        this.feedbackMessage.set(`Check-in confirmado para "${job.title}" às ${res.time}. Bom trabalho!`);
        this.closeCheckInModal();
      }
    });
  }

  openInstructionsModal(job: JobApplication): void {
    this.selectedJob.set(job);
    this.isInstructionsModalOpen.set(true);
  }

  closeInstructionsModal(): void {
    this.isInstructionsModalOpen.set(false);
  }

  openReceiptModal(job: JobApplication): void {
    this.selectedJob.set(job);
    this.isReceiptModalOpen.set(true);
  }

  closeReceiptModal(): void {
    this.isReceiptModalOpen.set(false);
  }

  openWithdrawModal(job: JobApplication): void {
    this.selectedJob.set(job);
    this.isWithdrawModalOpen.set(true);
  }

  closeWithdrawModal(): void {
    this.isWithdrawModalOpen.set(false);
  }

  confirmWithdrawJob(): void {
    const job = this.selectedJob();
    if (!job) return;

    this.myJobsService.withdrawJob(job.id).subscribe(() => {
      this.feedbackMessage.set(`Presença em "${job.title}" cancelada.`);
      this.closeWithdrawModal();
    });
  }

  openCancelModal(job: JobApplication): void {
    this.myJobsService.cancelApplication(job.id).subscribe(() => {
      this.feedbackMessage.set(`Candidatura para "${job.title}" cancelada.`);
    });
  }

  // Abertura de Chat na Sidebar / Coluna 3
  openChatForJob(job: JobApplication): void {
    const jobId = job.opportunityId || job.id;
    const candId = this.getEffectiveFreelancerId(job);
    this.activeChatJobId.set(jobId);
    this.activeChatJobTitle.set(job.title);
    this.activeChatCompanyName.set(job.companyName);
    this.activeChatFreelancerName.set(this.userProfileService.name() || 'Profissional');
    this.activeChatFreelancerId.set(candId);
    this.shiftChatService.getOrCreateRoom(
      jobId,
      job.title,
      job.companyName,
      this.userProfileService.name() || 'Profissional',
      candId
    );
    this.isMobileChatOpen.set(true);
  }

  handleSelectContact(contact: ChatContact): void {
    const app = this.myJobsService.acceptedJobs().find(
      a => (a.opportunityId || a.id) === contact.jobId
    );
    if (app) {
      this.openChatForJob(app);
    } else {
      const candId = contact.candidateId || this.getEffectiveFreelancerId();
      this.activeChatJobId.set(contact.jobId);
      this.activeChatJobTitle.set(contact.jobTitle);
      this.activeChatCompanyName.set(contact.candidateName);
      this.activeChatFreelancerName.set(this.userProfileService.name() || 'Profissional');
      this.activeChatFreelancerId.set(candId);
      this.shiftChatService.getOrCreateRoom(
        contact.jobId,
        contact.jobTitle,
        contact.candidateName,
        this.userProfileService.name() || 'Profissional',
        candId
      );
      this.isMobileChatOpen.set(true);
    }
  }

  closeChatSidebar(): void {
    this.activeChatJobId.set('');
    this.activeChatJobTitle.set('');
    this.activeChatCompanyName.set('');
    this.isMobileChatOpen.set(false);
  }

  openChatModal(job: JobApplication): void {
    this.openChatForJob(job);
  }

  closeChatModal(): void {
    this.closeChatSidebar();
  }

  openRatingModal(job: JobApplication): void {
    this.selectedJob.set(job);
    this.isRatingModalOpen.set(true);
  }

  closeRatingModal(): void {
    this.isRatingModalOpen.set(false);
  }

  handleReviewSubmitted(): void {
    this.feedbackMessage.set('Avaliação da empresa enviada com sucesso!');
  }

  dismissFeedback(): void {
    this.feedbackMessage.set(null);
  }

  trackByJobId(index: number, job: JobApplication): string {
    return job.id;
  }
}

