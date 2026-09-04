import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserReview } from '../../models/user-profile.model';
import { TpIconComponent } from '../../../../shared/components';

@Component({
  selector: 'tp-reviews-list',
  standalone: true,
  imports: [CommonModule, TpIconComponent],
  templateUrl: './reviews-list.component.html',
  styleUrl: './reviews-list.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReviewsListComponent {
  @Input() reviews: UserReview[] = [];

  trackByReviewId(index: number, item: UserReview): string {
    return item.id;
  }
}
