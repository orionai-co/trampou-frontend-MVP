import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CampaignService } from '../../services/campaign.service';
import { TpIconComponent, TpButtonComponent } from '../../../../shared/components';

@Component({
  selector: 'tp-company-campaign-metrics',
  standalone: true,
  imports: [CommonModule, TpIconComponent, TpButtonComponent],
  templateUrl: './company-campaign-metrics.component.html',
  styleUrl: './company-campaign-metrics.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CompanyCampaignMetricsComponent {
  readonly campaignService = inject(CampaignService);

  @Output() openBoostModal = new EventEmitter<void>();

  onBoostClick(): void {
    this.openBoostModal.emit();
  }

  formatNumber(val: number): string {
    return new Intl.NumberFormat('pt-BR').format(val);
  }
}
