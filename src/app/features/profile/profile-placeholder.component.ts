import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UserProfileService } from '../../core/services/user-profile.service';
import {
  TpCardComponent,
  TpBadgeComponent,
  TpButtonComponent,
  TpIconComponent
} from '../../shared/components';

@Component({
  selector: 'app-profile-placeholder',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TpCardComponent,
    TpBadgeComponent,
    TpButtonComponent,
    TpIconComponent
  ],
  templateUrl: './profile-placeholder.component.html',
  styleUrl: './profile-placeholder.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfilePlaceholderComponent {
  readonly userProfile = inject(UserProfileService);
}
