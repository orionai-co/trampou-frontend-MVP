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
  selector: 'app-opportunities-placeholder',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TpCardComponent,
    TpBadgeComponent,
    TpButtonComponent,
    TpIconComponent
  ],
  templateUrl: './opportunities-placeholder.component.html',
  styleUrl: './opportunities-placeholder.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OpportunitiesPlaceholderComponent {}
