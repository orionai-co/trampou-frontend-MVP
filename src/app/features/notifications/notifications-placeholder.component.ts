import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  TpCardComponent,
  TpBadgeComponent,
  TpButtonComponent,
  TpIconComponent
} from '../../shared/components';

@Component({
  selector: 'app-notifications-placeholder',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TpCardComponent,
    TpBadgeComponent,
    TpButtonComponent,
    TpIconComponent
  ],
  templateUrl: './notifications-placeholder.component.html',
  styleUrl: './notifications-placeholder.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificationsPlaceholderComponent {}
