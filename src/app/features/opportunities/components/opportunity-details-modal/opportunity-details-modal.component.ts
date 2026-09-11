import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  signal,
  inject,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Opportunity } from '../../models/opportunity.model';
import { UserProfileService } from '../../../../core/services/user-profile.service';
import { AuthService } from '../../../../core/services/auth.service';
import {
  TpModalComponent,
  TpBadgeComponent,
  TpButtonComponent,
  TpIconComponent
} from '../../../../shared/components';

export type ApplicationStep = 1 | 2 | 3 | 4;

@Component({
  selector: 'tp-opportunity-details-modal',
  standalone: true,
  imports: [
    CommonModule,
    TpModalComponent,
    TpBadgeComponent,
    TpButtonComponent,
    TpIconComponent
  ],
  templateUrl: './opportunity-details-modal.component.html',
  styleUrl: './opportunity-details-modal.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OpportunityDetailsModalComponent implements OnChanges {
  readonly userProfileService = inject(UserProfileService);
  readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly userRole = this.authService.userRole;
  readonly currentUser = this.authService.currentUser;

  get isOwnJob(): boolean {
    if (this.userRole() !== 'contractor') return false;
    const user = this.currentUser();
    if (!user) return false;

    if (this.opportunity?.companyName && user.name) {
      const oppName = this.opportunity.companyName.trim().toLowerCase();
      const userName = user.name.trim().toLowerCase();
      if (oppName === userName) return true;
    }

    if ((this.opportunity as any)?.companyId && (this.opportunity as any).companyId === user.id) {
      return true;
    }

    if (this.opportunity?.companyName === 'Empresa Contratante' && user.role === 'contractor') {
      return true;
    }

    return false;
  }

  onManageInCompanyPanel(): void {
    this.onClose();
    this.router.navigate(['/empresa']);
  }

  @Input() isOpen = false;
  @Input() opportunity: Opportunity | null = null;

  @Output() closed = new EventEmitter<void>();
  @Output() applied = new EventEmitter<Opportunity>();

  currentStep = signal<ApplicationStep>(1);
  checkAvailability = signal<boolean>(true);
  checkAttire = signal<boolean>(true);
  isSubmitting = signal<boolean>(false);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen'] && this.isOpen) {
      this.resetModalState();
    }
  }

  get modalTitle(): string {
    if (!this.opportunity) return 'Detalhes da Oportunidade';
    if (this.currentStep() === 2) return 'Atividades & Traje Exigido';
    if (this.currentStep() === 3) return 'Compromisso & Chave PIX';
    if (this.currentStep() === 4) return 'Candidatura Enviada!';
    return this.opportunity.title;
  }

  get modalSubtitle(): string {
    if (!this.opportunity) return '';
    const ownSuffix = this.isOwnJob ? ' (Sua vaga)' : '';
    if (this.currentStep() === 2) return `${this.opportunity.companyName}${ownSuffix} • Regras e orientações de apresentação`;
    if (this.currentStep() === 3) return 'Validação de presença e confirmação da chave PIX';
    if (this.currentStep() === 4) return 'Sua solicitação foi registrada no Trampou';
    return `${this.opportunity.companyName}${ownSuffix} • ${this.opportunity.location.neighborhood}`;
  }

  get arrivalTimeText(): string {
    if (!this.opportunity?.schedule?.start) return 'horário combinado';
    const [h, m] = this.opportunity.schedule.start.split(':').map(Number);
    let arrivalMin = m - 15;
    let arrivalHour = h;
    if (arrivalMin < 0) {
      arrivalMin += 60;
      arrivalHour = (arrivalHour - 1 + 24) % 24;
    }
    return `${String(arrivalHour).padStart(2, '0')}h${String(arrivalMin).padStart(2, '0')}`;
  }

  goToStep(step: ApplicationStep): void {
    this.currentStep.set(step);
  }

  onToggleAvailability(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.checkAvailability.set(input.checked);
  }

  onToggleAttire(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.checkAttire.set(input.checked);
  }

  isChecklistComplete(): boolean {
    return this.checkAvailability() && this.checkAttire();
  }

  onClose(): void {
    this.closed.emit();
    setTimeout(() => this.resetModalState(), 200);
  }

  onConfirmApply(): void {
    if (this.opportunity && !this.opportunity.applied && this.isChecklistComplete()) {
      this.isSubmitting.set(true);
      setTimeout(() => {
        this.isSubmitting.set(false);
        this.applied.emit(this.opportunity!);
        this.currentStep.set(4);
      }, 350);
    }
  }

  onNavigateToMyJobs(): void {
    this.onClose();
    this.router.navigate(['/meus-trabalhos'], { queryParams: { tab: 'pending' } });
  }

  private resetModalState(): void {
    this.currentStep.set(1);
    this.checkAvailability.set(true);
    this.checkAttire.set(true);
    this.isSubmitting.set(false);
  }
}
