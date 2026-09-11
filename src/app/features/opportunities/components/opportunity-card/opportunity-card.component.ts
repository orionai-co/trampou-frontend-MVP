import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Opportunity } from '../../models/opportunity.model';
import { AuthService } from '../../../../core/services/auth.service';
import {
  MatchBreakdownData,
  buildMatchBreakdownFromOpportunity
} from '../../../../core/models/match-breakdown.model';
import {
  TpBadgeComponent,
  TpButtonComponent,
  TpIconComponent
} from '../../../../shared/components';

@Component({
  selector: 'tp-opportunity-card',
  standalone: true,
  imports: [
    CommonModule,
    TpBadgeComponent,
    TpButtonComponent,
    TpIconComponent
  ],
  templateUrl: './opportunity-card.component.html',
  styleUrl: './opportunity-card.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OpportunityCardComponent {
  private readonly authService = inject(AuthService);
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

  onManageJob(event: MouseEvent): void {
    event.stopPropagation();
    this.router.navigate(['/empresa']);
  }
  @Input({ required: true }) opportunity!: Opportunity;

  @Output() viewDetails = new EventEmitter<Opportunity>();
  @Output() apply = new EventEmitter<Opportunity>();
  @Output() openMatch = new EventEmitter<MatchBreakdownData>();

  get companyInitials(): string {
    if (!this.opportunity?.companyName) return 'TP';
    const words = this.opportunity.companyName.trim().split(/\s+/);
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
    return (words[0][0] + words[1][0]).toUpperCase();
  }

  get companyHandle(): string {
    if (!this.opportunity?.category) return '@empresa';
    const cat = this.opportunity.category.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return `@${cat}_sp`;
  }

  get relativeTimeText(): string {
    if (this.opportunity?.isToday) {
      return 'Há 15 min';
    }
    return this.opportunity?.date || 'Publicado hoje';
  }

  onViewDetails(): void {
    this.viewDetails.emit(this.opportunity);
  }

  onApply(event: MouseEvent): void {
    event.stopPropagation();
    this.apply.emit(this.opportunity);
  }

  onMatchBadgeClick(event: MouseEvent): void {
    event.stopPropagation();
    const breakdown = buildMatchBreakdownFromOpportunity(this.opportunity);
    this.openMatch.emit(breakdown);
  }

  openMatchBreakdown(event: MouseEvent): void {
    this.onMatchBadgeClick(event);
  }
}
