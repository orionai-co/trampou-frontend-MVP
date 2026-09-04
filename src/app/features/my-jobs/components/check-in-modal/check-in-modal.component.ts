import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JobApplication } from '../../models/job-application.model';
import {
  TpModalComponent,
  TpButtonComponent,
  TpIconComponent
} from '../../../../shared/components';

@Component({
  selector: 'tp-check-in-modal',
  standalone: true,
  imports: [
    CommonModule,
    TpModalComponent,
    TpButtonComponent,
    TpIconComponent
  ],
  templateUrl: './check-in-modal.component.html',
  styleUrl: './check-in-modal.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CheckInModalComponent {
  @Input() isOpen = false;
  @Input() job: JobApplication | null = null;

  @Output() closed = new EventEmitter<void>();
  @Output() confirmed = new EventEmitter<JobApplication>();

  isSubmitting = signal<boolean>(false);

  onClose(): void {
    this.isSubmitting.set(false);
    this.closed.emit();
  }

  onConfirm(): void {
    if (!this.job) return;
    this.isSubmitting.set(true);
    setTimeout(() => {
      this.isSubmitting.set(false);
      this.confirmed.emit(this.job!);
      this.onClose();
    }, 400);
  }
}
