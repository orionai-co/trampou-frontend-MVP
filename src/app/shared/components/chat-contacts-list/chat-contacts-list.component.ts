import {
  Component,
  Input,
  Output,
  EventEmitter,
  signal,
  computed,
  ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TpIconComponent } from '../index';

export interface ChatContact {
  jobId: string;
  jobTitle: string;
  candidateId: string;
  candidateName: string;
  avatarInitials: string;
  category?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  isOnline?: boolean;
  hasUnread?: boolean;
}

@Component({
  selector: 'tp-chat-contacts-list',
  standalone: true,
  imports: [CommonModule, FormsModule, TpIconComponent],
  templateUrl: './chat-contacts-list.component.html',
  styleUrl: './chat-contacts-list.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatContactsListComponent {
  @Input() contacts: ChatContact[] = [];
  @Input() selectedCandidateId = '';
  @Input() selectedJobId = '';

  @Output() selectContact = new EventEmitter<ChatContact>();

  searchTerm = signal<string>('');

  filteredContacts = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    if (!term) {
      return this.contacts;
    }
    return this.contacts.filter(
      c =>
        c.candidateName.toLowerCase().includes(term) ||
        c.jobTitle.toLowerCase().includes(term)
    );
  });

  onSelect(contact: ChatContact): void {
    this.selectContact.emit(contact);
  }

  isSelected(contact: ChatContact): boolean {
    return (
      contact.candidateId === this.selectedCandidateId &&
      contact.jobId === this.selectedJobId
    );
  }

  trackByContact(index: number, contact: ChatContact): string {
    return `${contact.jobId}-${contact.candidateId}`;
  }
}
