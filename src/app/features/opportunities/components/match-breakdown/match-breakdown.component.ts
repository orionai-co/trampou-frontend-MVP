import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  OnInit,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  inject,
  Renderer2
} from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { MatchBreakdownData } from '../../../../core/models/match-breakdown.model';
import { TpIconComponent, IconName } from '../../../../shared/components';

@Component({
  selector: 'tp-match-breakdown',
  standalone: true,
  imports: [CommonModule, TpIconComponent],
  templateUrl: './match-breakdown.component.html',
  styleUrl: './match-breakdown.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MatchBreakdownComponent implements OnInit, OnChanges, OnDestroy {
  private readonly renderer = inject(Renderer2);
  private readonly document = inject(DOCUMENT);

  @Input() isOpen = true;
  @Input() data: MatchBreakdownData | null = null;

  @Output() closeModal = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();

  ngOnInit(): void {
    if (this.isOpen && this.data) {
      this.lockScroll();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen'] || changes['data']) {
      if (this.isOpen && this.data) {
        this.lockScroll();
      } else {
        this.unlockScroll();
      }
    }
  }

  ngOnDestroy(): void {
    this.unlockScroll();
  }

  private lockScroll(): void {
    if (this.document?.body) {
      this.renderer.addClass(this.document.body, 'tp-no-scroll');
    }
  }

  private unlockScroll(): void {
    if (this.document?.body) {
      this.renderer.removeClass(this.document.body, 'tp-no-scroll');
    }
  }

  onClose(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.unlockScroll();
    this.closeModal.emit();
    this.closed.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    event.stopPropagation();
    this.onClose();
  }

  getSafeIcon(icon: string): IconName {
    const validIcons: IconName[] = [
      'map-pin',
      'briefcase',
      'award',
      'clock',
      'star',
      'shield-check',
      'sparkles',
      'check',
      'check-circle'
    ];
    if (validIcons.includes(icon as IconName)) {
      return icon as IconName;
    }
    return 'sparkles';
  }
}
