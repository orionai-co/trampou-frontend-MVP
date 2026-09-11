import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserProfile, ReliabilityMetrics } from '../../models/user-profile.model';
import { TpBadgeComponent, TpIconComponent } from '../../../../shared/components';

@Component({
  selector: 'tp-profile-header',
  standalone: true,
  imports: [CommonModule, TpBadgeComponent, TpIconComponent],
  templateUrl: './profile-header.component.html',
  styleUrl: './profile-header.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileHeaderComponent {
  @Input() profile?: UserProfile;
  @Input() user?: UserProfile;
  @Input() reliability?: ReliabilityMetrics;

  get activeProfile(): UserProfile | undefined {
    return this.user || this.profile;
  }

  get totalReviewsCount(): number {
    return this.activeProfile?.totalReviews ?? this.activeProfile?.reviewsCount ?? 0;
  }

  get punctualityRate(): number {
    return this.activeProfile?.punctualityRate ?? this.reliability?.attendanceRate ?? 0;
  }

  get attendanceRate(): number {
    return this.reliability?.attendanceRate ?? this.activeProfile?.reliability?.attendanceRate ?? this.activeProfile?.punctualityRate ?? 0;
  }

  get completedShifts(): number {
    return this.reliability?.completedShifts ?? this.activeProfile?.reliability?.completedShifts ?? this.activeProfile?.completedJobsCount ?? 0;
  }

  get cancellationRate(): number {
    return this.reliability?.cancellationRate ?? this.activeProfile?.reliability?.cancellationRate ?? 0;
  }
}
