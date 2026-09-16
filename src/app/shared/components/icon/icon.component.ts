import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

export type IconName =
  | 'search'
  | 'map-pin'
  | 'calendar'
  | 'clock'
  | 'banknote'
  | 'briefcase'
  | 'user'
  | 'users'
  | 'check'
  | 'check-circle'
  | 'alert-circle'
  | 'alert-triangle'
  | 'x'
  | 'x-circle'
  | 'chevron-right'
  | 'chevron-left'
  | 'chevron-down'
  | 'chevron-up'
  | 'star'
  | 'filter'
  | 'arrow-right'
  | 'eye'
  | 'shield-check'
  | 'bell'
  | 'sparkles'
  | 'message-square'
  | 'chat'
  | 'share-2'
  | 'bookmark'
  | 'sliders'
  | 'zap'
  | 'award'
  | 'heart'
  | 'plus'
  | 'play'
  | 'pause'
  | 'volume-2'
  | 'volume-x'
  | 'loader'
  | 'upload'
  | 'refresh-cw'
  | 'edit'
  | 'trash'
  | 'more-vertical';

export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

@Component({
  selector: 'tp-icon',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './icon.component.html',
  styleUrl: './icon.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TpIconComponent {
  @Input({ required: true }) name!: IconName;
  @Input() size: IconSize = 'md';
  @Input() customClass = '';

  get dimension(): number {
    switch (this.size) {
      case 'xs': return 14;
      case 'sm': return 16;
      case 'md': return 20;
      case 'lg': return 24;
      case 'xl': return 32;
      default: return 20;
    }
  }
}
