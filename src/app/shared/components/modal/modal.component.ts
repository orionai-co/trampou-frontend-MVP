import {
  Component,
  Input,
  Output,
  EventEmitter,
  HostListener,
  ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TpIconComponent } from '../icon/icon.component';

@Component({
  selector: 'tp-modal',
  standalone: true,
  imports: [CommonModule, TpIconComponent],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TpModalComponent {
  @Input() isOpen = false;
  @Input() title = '';
  @Input() subtitle?: string;
  @Input() maxWidth = '520px';
  @Input() closeOnBackdrop = true;
  @Input() hasFooter = false;

  @Output() closed = new EventEmitter<void>();

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.isOpen) {
      this.close();
    }
  }

  onBackdropClick(event: MouseEvent): void {
    if (this.closeOnBackdrop) {
      this.close();
    }
  }

  close(): void {
    this.isOpen = false;
    this.closed.emit();
  }
}
