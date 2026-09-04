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
  selector: 'app-company-placeholder',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TpCardComponent,
    TpBadgeComponent,
    TpButtonComponent,
    TpIconComponent
  ],
  templateUrl: './company-placeholder.component.html',
  styleUrl: './company-placeholder.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CompanyPlaceholderComponent {}
