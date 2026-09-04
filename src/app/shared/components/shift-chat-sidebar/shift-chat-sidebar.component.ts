import {
  Component,
  Input,
  Output,
  EventEmitter,
  signal,
  inject,
  OnChanges,
  SimpleChanges,
  ChangeDetectionStrategy,
  ViewChild,
  ElementRef,
  AfterViewChecked
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ShiftChatService, ChatRoom } from '../../../core/services/shift-chat.service';
import {
  TpIconComponent,
  TpButtonComponent
} from '../index';

@Component({
  selector: 'tp-shift-chat-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TpIconComponent,
    TpButtonComponent
  ],
  templateUrl: './shift-chat-sidebar.component.html',
  styleUrl: './shift-chat-sidebar.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ShiftChatSidebarComponent implements OnChanges, AfterViewChecked {
  readonly shiftChatService = inject(ShiftChatService);

  @Input() jobId = '';
  @Input() jobTitle = '';
  @Input() companyName = '';
  @Input() freelancerName = '';
  @Input() freelancerId = '';
  @Input() currentUserRole: 'company' | 'freelancer' = 'company';
  @Input() canPayPix = true;
  @Input() isMobileOpen = false;

  @Output() closed = new EventEmitter<void>();
  @Output() openPayout = new EventEmitter<void>();

  @ViewChild('messagesContainer') private messagesContainer?: ElementRef<HTMLDivElement>;

  currentRoom = signal<ChatRoom | null>(null);
  messageText = signal<string>('');
  private shouldScrollToBottom = false;

  get hasActiveChat(): boolean {
    return !!this.jobId && !!(this.freelancerName || this.companyName);
  }

  get quickReplies(): string[] {
    if (this.currentUserRole === 'company') {
      return [
        'Local e uniforme confirmados',
        'Ponto de encontro na portaria',
        'Briefing começa 15 min antes',
        'Favor procurar pelo Metre'
      ];
    } else {
      return [
        'Cheguei no local!',
        'Qual o ponto de encontro / portão de entrada?',
        'Traje e uniforme 100% alinhados.'
      ];
    }
  }

  get inputPlaceholder(): string {
    return this.currentUserRole === 'company'
      ? 'Alinhe o turno com o profissional...'
      : 'Alinhe com a empresa contratante...';
  }

  get emptyStateDescription(): string {
    return this.currentUserRole === 'company'
      ? 'Selecione um candidato aprovado ou clique em "Chat" em uma vaga ativa para alinhar detalhes operacionais.'
      : 'Selecione um contratante para alinhar detalhes de chegada e uniforme.';
  }

  get initials(): string {
    const name = this.counterpartName || 'TF';
    return name
      .split(' ')
      .slice(0, 2)
      .map(n => n[0])
      .join('')
      .toUpperCase();
  }

  get counterpartName(): string {
    return this.currentUserRole === 'company' ? this.freelancerName : this.companyName;
  }

  get counterpartRoleLabel(): string {
    return this.currentUserRole === 'company' ? 'Profissional Aprovado' : 'Empresa Contratante';
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['jobId']?.currentValue || changes['freelancerId']?.currentValue || changes['freelancerName']?.currentValue) {
      if (this.jobId) {
        this.loadOrCreateRoom();
      } else {
        this.currentRoom.set(null);
      }
    }
  }

  ngAfterViewChecked(): void {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  loadOrCreateRoom(): void {
    if (!this.jobId) return;
    const fId = this.freelancerId || 'freelancer-user';
    const room = this.shiftChatService.getOrCreateRoom(
      this.jobId,
      this.jobTitle || 'Turno sob demanda',
      this.companyName || 'Empresa Contratante',
      this.freelancerName || 'Profissional',
      fId
    );
    this.currentRoom.set(room);
    this.shouldScrollToBottom = true;
  }

  sendMessage(textToSend?: string): void {
    const text = textToSend || this.messageText();
    if (!text || !text.trim() || !this.currentRoom()) return;

    const senderName = this.currentUserRole === 'company' ? this.companyName : this.freelancerName;
    this.shiftChatService.sendMessage(
      this.currentRoom()!.id,
      this.currentUserRole,
      senderName || (this.currentUserRole === 'company' ? 'Empresa' : 'Profissional'),
      text
    );

    const updated = this.shiftChatService.getRoomById(this.currentRoom()!.id);
    if (updated) {
      this.currentRoom.set({ ...updated });
    }

    this.messageText.set('');
    this.shouldScrollToBottom = true;
  }

  onQuickReplyClick(reply: string): void {
    this.sendMessage(reply);
  }

  onPayoutClick(): void {
    this.openPayout.emit();
  }

  close(): void {
    this.closed.emit();
  }

  private scrollToBottom(): void {
    if (this.messagesContainer) {
      try {
        this.messagesContainer.nativeElement.scrollTop =
          this.messagesContainer.nativeElement.scrollHeight;
      } catch (err) {
        // Ignora se não renderizado
      }
    }
  }
}
