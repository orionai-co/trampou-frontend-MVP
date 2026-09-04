import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

export type CardVariant = 'default' | 'interactive' | 'flat' | 'outlined';
export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

@Component({
  selector: 'tp-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './card.component.html',
  styleUrl: './card.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TpCardComponent {
  @Input() variant: CardVariant = 'default';
  @Input() padding: CardPadding = 'md';
  @Input() interactive = false;
  @Input() selected = false;
  @Input() hasHeader = false;
  @Input() hasFooter = false;

  @Output() cardClick = new EventEmitter<Event>();

  onClick(event: MouseEvent): void {
    if (this.interactive) {
      this.cardClick.emit(event);
    }
  }

  onKeyEnter(event: Event): void {
    if (this.interactive) {
      this.cardClick.emit(event);
    }
  }
}
