import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CompanyReputationMetrics } from '../../models/company-profile.model';
import { TpIconComponent } from '../../../../shared/components';

@Component({
  selector: 'tp-company-reputation-stats',
  standalone: true,
  imports: [CommonModule, TpIconComponent],
  templateUrl: './company-reputation-stats.component.html',
  styleUrl: './company-reputation-stats.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CompanyReputationStatsComponent {
  @Input({ required: true }) reputation!: CompanyReputationMetrics;

  formatNumber(val: number): string {
    return val.toLocaleString('pt-BR');
  }
}
