import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CompanyMetrics } from '../../models/company-job.model';
import {
  TpIconComponent,
  TpButtonComponent
} from '../../../../shared/components';

@Component({
  selector: 'tp-company-dashboard-header',
  standalone: true,
  imports: [CommonModule, TpIconComponent, TpButtonComponent],
  templateUrl: './company-dashboard-header.component.html',
  styleUrl: './company-dashboard-header.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CompanyDashboardHeaderComponent {
  @Input() companyName = 'Empresa';
  @Input() verified = false;
  @Input() rating = 5.0;
  @Input() metrics: CompanyMetrics = {
    openJobs: 0,
    candidatesUnderReview: 0,
    completedShifts: 0
  };

  @Output() openCreateJob = new EventEmitter<void>();
  @Output() openBoostCampaign = new EventEmitter<void>();

  onPublishClick(): void {
    this.openCreateJob.emit();
  }

  onBoostClick(): void {
    this.openBoostCampaign.emit();
  }
}
