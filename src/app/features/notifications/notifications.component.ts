import { Component, OnInit, signal, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  NotificationsService,
  NotificationFilterTab,
  TrampouNotification
} from '../../core/services/notifications.service';
import { NotificationFiltersComponent } from './components/notification-filters/notification-filters.component';
import { NotificationItemComponent } from './components/notification-item/notification-item.component';
import {
  TpIconComponent,
  TpButtonComponent,
  TpBadgeComponent
} from '../../shared/components';

@Component({
  selector: 'tp-notifications',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NotificationFiltersComponent,
    NotificationItemComponent,
    TpIconComponent,
    TpBadgeComponent
  ],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificationsComponent implements OnInit {
  readonly notificationsService = inject(NotificationsService);

  activeTab = signal<NotificationFilterTab>('all');

  readonly filteredNotifications = computed<TrampouNotification[]>(() => {
    return this.notificationsService.getFilteredNotifications(this.activeTab());
  });

  ngOnInit(): void {
    this.notificationsService.fetchNotifications();
  }

  onTabChange(tab: NotificationFilterTab): void {
    this.activeTab.set(tab);
  }

  onMarkAsRead(id: string): void {
    this.notificationsService.syncMarkAsRead(id);
  }

  onMarkAllAsRead(): void {
    this.notificationsService.syncMarkAllAsRead();
  }

  onDelete(id: string): void {
    this.notificationsService.deleteNotification(id);
  }

  trackByNotificationId(index: number, item: TrampouNotification): string {
    return item.id;
  }
}
