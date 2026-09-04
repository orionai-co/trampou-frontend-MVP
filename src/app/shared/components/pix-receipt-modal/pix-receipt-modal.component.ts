import {
  Component,
  Input,
  Output,
  EventEmitter,
  signal,
  ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  TpModalComponent,
  TpIconComponent,
  TpButtonComponent
} from '../index';


export interface PixReceiptData {
  transactionId: string;
  amount: number;
  paidAt: string;
  companyName: string;
  freelancerName: string;
  pixKeyPreview: string;
  jobTitle: string;
}

@Component({
  selector: 'tp-pix-receipt-modal',
  standalone: true,
  imports: [
    CommonModule,
    TpModalComponent,
    TpIconComponent,
    TpButtonComponent
  ],
  templateUrl: './pix-receipt-modal.component.html',
  styleUrl: './pix-receipt-modal.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PixReceiptModalComponent {
  @Input() isOpen = false;
  @Input() receiptData: PixReceiptData | null = null;
  @Input() showRatingAction = true;

  @Output() closed = new EventEmitter<void>();
  @Output() downloadReceipt = new EventEmitter<void>();
  @Output() openRating = new EventEmitter<void>();

  isCopied = signal<boolean>(false);

  copyReceiptCode(): void {
    const id = this.receiptData?.transactionId || 'PIX-CONFIRMED';
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(id).catch(() => {
          // Fallback silencioso para ambientes sem foco de tela (ex: headless test runner)
        });
      }
    } catch {
      // Fallback
    }
    this.isCopied.set(true);
    setTimeout(() => {
      this.isCopied.set(false);
    }, 3000);
  }

  onDownload(): void {
    this.downloadReceipt.emit();
    this.copyReceiptCode();
  }

  onOpenRating(): void {
    this.openRating.emit();
  }

  close(): void {
    this.closed.emit();
  }
}
