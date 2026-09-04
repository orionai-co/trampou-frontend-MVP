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

const INITIAL_MOCK_ROOMS: ChatRoom[] = [
  {
    id: 'room-comp-job-1-cand-1',
    jobId: 'comp-job-1',
    jobTitle: 'Garçom para Evento Corporativo',
    companyName: 'Buffet Espaço Paulista',
    freelancerName: 'Lucas Mendes',
    freelancerId: 'cand-1',
    status: 'active',
    createdAt: 'Hoje, 14:30',
    messages: [
      {
        id: 'msg-1',
        roomId: 'room-comp-job-1-cand-1',
        senderId: 'company-1',
        senderName: 'Buffet Espaço Paulista',
        senderRole: 'company',
        text: 'Olá Lucas! Sua presença foi aprovada para o turno de hoje. Por favor, apresente-se na lateral da Alameda Santos às 17h45 para o briefing com o metre Roberto.',
        timestamp: '14:32'
      },
      {
        id: 'msg-2',
        roomId: 'room-comp-job-1-cand-1',
        senderId: 'cand-1',
        senderName: 'Lucas Mendes',
        senderRole: 'freelancer',
        text: 'Perfeito! Traje social preto e sapato engraxado conforme solicitado. Estarei lá pontualmente!',
        timestamp: '14:35'
      }
    ]
  },
  {
    id: 'room-opp-001-app-001',
    jobId: 'opp-001',
    jobTitle: 'Garçom para Casamento e Buffet Noturno',
    companyName: 'Buffet Espaço Paulista',
    freelancerName: 'Matheus Silva',
    freelancerId: 'user-freelancer-1',
    status: 'active',
    createdAt: 'Hoje, 15:00',
    messages: [
      {
        id: 'msg-101',
        roomId: 'room-opp-001-app-001',
        senderId: 'company-1',
        senderName: 'Buffet Espaço Paulista',
        senderRole: 'company',
        text: 'Olá Matheus, tudo pronto para o seu turno hoje à noite? Entrada liberada na portaria de serviços.',
        timestamp: '15:10'
      },
      {
        id: 'msg-102',
        roomId: 'room-opp-001-app-001',
        senderId: 'user-freelancer-1',
        senderName: 'Matheus Silva',
        senderRole: 'freelancer',
        text: 'Tudo certo! Já estou com o uniforme alinhado. Chego às 17h40.',
        timestamp: '15:15'
      }
    ]
  }
];

@Injectable({
  providedIn: 'root'
})
export class ShiftChatService {
  private readonly _rooms = signal<ChatRoom[]>(INITIAL_MOCK_ROOMS);
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
