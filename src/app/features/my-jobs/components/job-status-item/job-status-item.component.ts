import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JobApplication } from '../../models/job-application.model';
import {
  TpBadgeComponent,
  TpButtonComponent,
  TpIconComponent
} from '../../../../shared/components';

@Component({
  selector: 'tp-job-status-item',
  standalone: true,
  imports: [
    CommonModule,
    TpBadgeComponent,
    TpButtonComponent,
    TpIconComponent
  ],
  templateUrl: './job-status-item.component.html',
  styleUrl: './job-status-item.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class JobStatusItemComponent {
  @Input({ required: true }) job!: JobApplication;

  @Output() checkIn = new EventEmitter<JobApplication>();
  @Output() viewInstructions = new EventEmitter<JobApplication>();
  @Output() withdraw = new EventEmitter<JobApplication>();
  @Output() cancel = new EventEmitter<JobApplication>();
  @Output() viewReceipt = new EventEmitter<JobApplication>();
  @Output() openChat = new EventEmitter<JobApplication>();
  @Output() openRating = new EventEmitter<JobApplication>();

  onCheckIn(): void {
    this.checkIn.emit(this.job);
  }

  onViewInstructions(): void {
    this.viewInstructions.emit(this.job);
  }

  onWithdraw(): void {
    this.withdraw.emit(this.job);
  }

  onCancelApplication(): void {
    this.cancel.emit(this.job);
  }

  onViewReceipt(): void {
    this.viewReceipt.emit(this.job);
  }

  onOpenChat(): void {
    this.openChat.emit(this.job);
  }

  onOpenRating(): void {
    this.openRating.emit(this.job);
  }
}

