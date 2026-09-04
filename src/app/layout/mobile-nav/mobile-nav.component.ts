import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TpIconComponent } from '../../shared/components';
import { NotificationsService } from '../../core/services/notifications.service';

@Component({
  selector: 'tp-mobile-nav',
  standalone: true,
  imports: [CommonModule, RouterModule, TpIconComponent],
  templateUrl: './mobile-nav.component.html',
  styleUrl: './mobile-nav.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MobileNavComponent {
  readonly notificationsService = inject(NotificationsService);
}
