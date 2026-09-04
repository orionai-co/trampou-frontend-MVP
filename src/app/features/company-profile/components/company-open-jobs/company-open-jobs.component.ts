import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Opportunity } from '../../../opportunities/models/opportunity.model';
import { OpportunityCardComponent } from '../../../opportunities/components/opportunity-card/opportunity-card.component';
import { TpIconComponent } from '../../../../shared/components';

@Component({
  selector: 'tp-company-open-jobs',
  standalone: true,
  imports: [CommonModule, OpportunityCardComponent, TpIconComponent],
  templateUrl: './company-open-jobs.component.html',
  styleUrl: './company-open-jobs.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CompanyOpenJobsComponent {
  @Input({ required: true }) jobs: Opportunity[] = [];
  @Input() companyName = '';

  @Output() viewJobDetails = new EventEmitter<Opportunity>();
  @Output() applyJob = new EventEmitter<Opportunity>();

  onViewDetails(job: Opportunity): void {
    this.viewJobDetails.emit(job);
  }

  onApply(job: Opportunity): void {
    this.applyJob.emit(job);
  }

  trackByJobId(index: number, job: Opportunity): string {
    return job.id;
  }
}
