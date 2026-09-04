import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

export type BadgeVariant =
  | 'brand'
  | 'accent'
  | 'neutral'
  | 'success'
  | 'warning'
  | 'danger'
  | 'outline';

export type BadgeSize = 'sm' | 'md';

@Component({
  selector: 'tp-badge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './badge.component.html',
  styleUrl: './badge.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TpBadgeComponent {
  @Input() variant: BadgeVariant = 'accent';
  @Input() size: BadgeSize = 'md';
  @Input() dot = false;
}
