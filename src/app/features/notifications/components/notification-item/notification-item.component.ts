import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TrampouNotification, NotificationType } from '../../../../core/services/notifications.service';
import { TpIconComponent, IconName } from '../../../../shared/components';

@Component({
  selector: 'tp-notification-item',
  standalone: true,
  imports: [CommonModule, RouterModule, TpIconComponent],
  templateUrl: './notification-item.component.html',
  styleUrl: './notification-item.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificationItemComponent {
  @Input({ required: true }) notification!: TrampouNotification;

  @Output() markAsRead = new EventEmitter<string>();
  @Output() delete = new EventEmitter<string>();
  @Output() actionClick = new EventEmitter<TrampouNotification>();

  get iconName(): IconName {
    switch (this.notification.type) {
      case 'shift_reminder':
        return 'clock';
      case 'pix_received':
        return 'banknote';
      case 'shift_approved':
        return 'check-circle';
      case 'new_match':
        return 'sparkles';
      case 'company_alert':
        return 'bell';
      case 'company_favorite':
        return 'star';
      case 'system':
      default:
        return 'bell';
    }
  }

  get iconColorClass(): string {
    switch (this.notification.type) {
      case 'shift_reminder':
        return 'tp-notif-icon-reminder';
      case 'pix_received':
        return 'tp-notif-icon-pix';
      case 'shift_approved':
        return 'tp-notif-icon-approved';
      case 'new_match':
        return 'tp-notif-icon-match';
      case 'company_alert':
        return 'tp-notif-icon-company-alert';
      case 'company_favorite':
        return 'tp-notif-icon-company-fav';
      case 'system':
      default:
        return 'tp-notif-icon-system';
    }
  }

  get typeBadgeLabel(): string {
    switch (this.notification.type) {
      case 'shift_reminder':
        return 'Lembrete de Turno';
      case 'pix_received':
        return 'PIX Recebido';
      case 'shift_approved':
        return 'Aprovação';
      case 'new_match':
        return 'Alto Match';
      case 'company_alert':
        return 'Empresa Acompanhada';
      case 'company_favorite':
        return 'Empresa Favoritada';
      case 'system':
      default:
        return 'Aviso';
    }
  }

  onCardClick(): void {
    if (!this.notification.read) {
      this.markAsRead.emit(this.notification.id);
    }
  }

  onActionClick(event: MouseEvent): void {
    event.stopPropagation();
    if (!this.notification.read) {
      this.markAsRead.emit(this.notification.id);
    }
    this.actionClick.emit(this.notification);
  }

  onDelete(event: MouseEvent): void {
    event.stopPropagation();
    this.delete.emit(this.notification.id);
  }
}
