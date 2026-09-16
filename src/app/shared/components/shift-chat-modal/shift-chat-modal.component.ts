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
  AfterViewChecked,
  OnInit,
  OnDestroy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ShiftChatService, ChatRoom, ChatMessage, buildChannelId } from '../../../core/services/shift-chat.service';
import {
  TpModalComponent,
  TpIconComponent,
  TpButtonComponent
} from '../index';

@Component({
  selector: 'tp-shift-chat-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TpModalComponent,
    TpIconComponent,
    TpButtonComponent
  ],
  templateUrl: './shift-chat-modal.component.html',
  styleUrl: './shift-chat-modal.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ShiftChatModalComponent implements OnInit, OnDestroy, OnChanges, AfterViewChecked {
  readonly shiftChatService = inject(ShiftChatService);

  @Input() isOpen = false;
  @Input() jobId = '';
  @Input() jobTitle = '';
  @Input() companyName = '';
  @Input() freelancerName = '';
  @Input() freelancerId = '';
  @Input() currentUserRole: 'company' | 'freelancer' = 'freelancer';

  @Output() closed = new EventEmitter<void>();

  @ViewChild('messagesContainer') private messagesContainer?: ElementRef<HTMLDivElement>;

  currentRoom = signal<ChatRoom | null>(null);
  messageText = signal<string>('');
  private shouldScrollToBottom = false;

  get quickReplies(): string[] {
    if (this.currentUserRole === 'company') {
      return [
        'Entrada pela lateral / portão de serviços',
        'Favor procurar pelo Metre na chegada',
        'Briefing começa 15 min antes',
        'Uniforme e apresentação aprovados!'
      ];
    } else {
      return [
        'Cheguei no local!',
        'Onde é a entrada de serviço?',
        'Uniforme e traje alinhados!',
        'Estou no ponto de encontro indicado.'
      ];
    }
  }

  get counterpartName(): string {
    return this.currentUserRole === 'company' ? this.freelancerName : this.companyName;
  }

  get counterpartRoleLabel(): string {
    return this.currentUserRole === 'company' ? 'Profissional Aprovado' : 'Empresa Contratante';
  }

  private onMessageSentListener = (event: any) => {
    const msg: ChatMessage = event?.detail;
    if (!msg || !this.currentRoom()) return;
    const room = this.currentRoom()!;
    const channelId = buildChannelId(room.jobId, room.freelancerId);
    if (msg.roomId === room.id || msg.channelId === room.id || msg.channelId === channelId) {
      const alreadyHas = room.messages.some(m => m.id === msg.id);
      if (!alreadyHas) {
        this.currentRoom.set({
          ...room,
          messages: [...room.messages, msg]
        });
        this.shouldScrollToBottom = true;
      }
    }
  };

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('trampou:message-sent', this.onMessageSentListener);
    }
  }

  ngOnDestroy(): void {
    if (typeof window !== 'undefined') {
      window.removeEventListener('trampou:message-sent', this.onMessageSentListener);
    }
  }

  isOutgoing(msg: ChatMessage): boolean {
    if (this.currentUserRole === 'company' || (this.currentUserRole as string) === 'contractor') {
      return msg.senderRole === 'company' || msg.senderRole === 'contractor';
    } else {
      return msg.senderRole === 'freelancer' || msg.senderRole === 'professional';
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['isOpen']?.currentValue || changes['jobId']?.currentValue) && this.isOpen && this.jobId) {
      this.loadOrCreateRoom();
    }
  }

  ngAfterViewChecked(): void {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  loadOrCreateRoom(): void {
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

    // Atualiza sala local
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

  close(): void {
    this.closed.emit();
  }

  private scrollToBottom(): void {
    if (this.messagesContainer) {
      try {
        this.messagesContainer.nativeElement.scrollTop =
          this.messagesContainer.nativeElement.scrollHeight;
      } catch (err) {
        // Ignora caso elemento não esteja no DOM
      }
    }
  }
}
