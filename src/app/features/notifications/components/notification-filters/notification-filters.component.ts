import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationFilterTab } from '../../../../core/services/notifications.service';

export interface NotificationFilterOption {
  id: NotificationFilterTab;
  label: string;
  count?: number;
}

@Component({
  selector: 'tp-notification-filters',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification-filters.component.html',
  styleUrl: './notification-filters.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificationFiltersComponent {
  @Input() activeTab: NotificationFilterTab = 'all';
  @Input() unreadCount = 0;

  @Output() tabChange = new EventEmitter<NotificationFilterTab>();

  readonly filterTabs: NotificationFilterOption[] = [
    { id: 'all', label: 'Todas' },
    { id: 'shifts', label: 'Turnos & Lembretes' },
    { id: 'pix', label: 'Pagamentos PIX' },
    { id: 'opportunities', label: 'Oportunidades' },
    { id: 'companies', label: 'Empresas Seguidas' }
  ];

  onSelect(tab: NotificationFilterTab): void {
    this.tabChange.emit(tab);
  }
}
