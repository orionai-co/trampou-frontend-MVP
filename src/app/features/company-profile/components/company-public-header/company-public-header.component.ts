import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CompanyPublicProfile } from '../../models/company-profile.model';
import { NotificationsService } from '../../../../core/services/notifications.service';
import { TpIconComponent } from '../../../../shared/components';

@Component({
  selector: 'tp-company-public-header',
  standalone: true,
  imports: [CommonModule, TpIconComponent],
  templateUrl: './company-public-header.component.html',
  styleUrl: './company-public-header.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CompanyPublicHeaderComponent {
  private readonly notificationsService = inject(NotificationsService);

  @Input({ required: true }) company!: CompanyPublicProfile;
  @Input() isFavorited = false;
  @Input() isFollowing = false;

  @Output() toggleFavorite = new EventEmitter<void>();
  @Output() toggleFollow = new EventEmitter<void>();

  onToggleFavorite(): void {
    if (!this.isFavorited && this.company) {
      this.notificationsService.notifyCompanyFavorited(this.company.name, this.company.id);
    }
    this.toggleFavorite.emit();
  }

  onToggleFollow(): void {
    if (!this.isFollowing && this.company) {
      this.notificationsService.notifyCompanyFollowed(this.company.name, this.company.id);
    }
    this.toggleFollow.emit();
  }
}
