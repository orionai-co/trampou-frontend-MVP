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
  selector: 'app-my-jobs-placeholder',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TpCardComponent,
    TpBadgeComponent,
    TpButtonComponent,
    TpIconComponent
  ],
  templateUrl: './my-jobs-placeholder.component.html',
  styleUrl: './my-jobs-placeholder.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MyJobsPlaceholderComponent {}
