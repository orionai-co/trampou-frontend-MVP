import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

export type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg';
export type SpinnerColor = 'primary' | 'accent' | 'white' | 'current';

@Component({
  selector: 'tp-spinner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './spinner.component.html',
  styleUrl: './spinner.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TpSpinnerComponent {
  @Input() size: SpinnerSize = 'md';
  @Input() color: SpinnerColor = 'current';

  get dimension(): number {
    switch (this.size) {
      case 'xs': return 14;
      case 'sm': return 18;
      case 'md': return 24;
      case 'lg': return 32;
      default: return 24;
    }
  }
}
