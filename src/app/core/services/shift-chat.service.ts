import { Injectable, signal, computed } from '@angular/core';

export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  senderRole: 'company' | 'freelancer';
  text: string;
  timestamp: string;
}

export interface ChatRoom {
  id: string;
  jobId: string;
  jobTitle: string;
  companyName: string;
  freelancerName: string;
  freelancerId: string;
  status: 'active' | 'closed';
  messages: ChatMessage[];
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class ShiftChatService {
  private readonly _rooms = signal<ChatRoom[]>([]);
  readonly rooms = this._rooms.asReadonly();

  readonly activeRoomsCount = computed(() => {
    return this._rooms().filter(r => r.status === 'active').length;
  });

  getRoomByJobId(jobId: string): ChatRoom | undefined {
    return this._rooms().find(r => r.jobId === jobId && r.status === 'active');
  }

  getRoomByJobAndFreelancer(jobId: string, freelancerId: string): ChatRoom | undefined {
    return this._rooms().find(
      r => r.jobId === jobId && r.freelancerId === freelancerId && r.status === 'active'
    );
  }

  getRoomById(roomId: string): ChatRoom | undefined {
    return this._rooms().find(r => r.id === roomId);
  }

  getOrCreateRoom(
    jobId: string,
    jobTitle: string,
    companyName: string,
    freelancerName: string,
    freelancerId: string
  ): ChatRoom {
    const existing = this._rooms().find(
      r => r.jobId === jobId && r.freelancerId === freelancerId && r.status === 'active'
    );
    if (existing) {
      return existing;
    }

    const newRoom: ChatRoom = {
      id: `room-${jobId}-${freelancerId}`,
      jobId,
      jobTitle,
      companyName,
      freelancerName,
      freelancerId,
      status: 'active',
      createdAt: 'Agora',
      messages: [
        {
          id: `msg-${Date.now()}`,
          roomId: `room-${jobId}-${freelancerId}`,
          senderId: 'system',
          senderName: 'Sistema Trampou',
          senderRole: 'company',
          text: `Canal efêmero iniciado para alinhamento operacional do turno "${jobTitle}". As mensagens serão excluídas ao término do serviço.`,
          timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        }
      ]
    };

    this._rooms.update(list => [newRoom, ...list]);
    return newRoom;
  }

  sendMessage(
    roomId: string,
    senderRole: 'company' | 'freelancer',
    senderName: string,
    text: string
  ): void {
    if (!text || text.trim().length === 0) return;

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      roomId,
      senderId: senderRole === 'company' ? 'company-user' : 'freelancer-user',
      senderName,
      senderRole,
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };

    this._rooms.update(list =>
      list.map(room => {
        if (room.id === roomId) {
          return {
            ...room,
            messages: [...room.messages, newMsg]
          };
        }
        return room;
      })
    );
  }

  deleteRoomOnShiftEnd(jobId: string): void {
    // Exclui automaticamente a sala efêmera vinculada à vaga finalizada
    this._rooms.update(list =>
      list.filter(room => room.jobId !== jobId)
    );
  }

  isRoomActive(jobId: string): boolean {
    return this._rooms().some(r => r.jobId === jobId && r.status === 'active');
  }
}
