import { Injectable, signal, computed, inject } from '@angular/core';
import { ApiClientService } from './api-client.service';
import { API_ENDPOINTS } from '../constants/api-endpoints';

export const TRAMPOU_CHAT_STORAGE_KEY = 'trampou_chat_messages';

export type ChatRole = 'contractor' | 'professional' | 'company' | 'freelancer';

export interface ChatMessage {
  id: string;
  channelId: string;
  roomId?: string;
  senderId: string;
  senderName: string;
  senderRole: ChatRole;
  text: string;
  timestamp: string;
  read?: boolean;
  createdAt?: string;
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

export function buildChannelId(jobId: string, candidateId?: string): string {
  const cleanJobId = (jobId || '').trim();
  const cleanCandId = (candidateId || '').trim();
  if (cleanCandId && cleanCandId !== 'system') {
    return `${cleanJobId}_${cleanCandId}`;
  }
  return cleanJobId;
}

@Injectable({
  providedIn: 'root'
})
export class ShiftChatService {
  private readonly apiClient = inject(ApiClientService);

  private readonly _rooms = signal<ChatRoom[]>([]);
  readonly rooms = this._rooms.asReadonly();

  readonly activeRoomsCount = computed(() => {
    return this._rooms().filter(r => r.status === 'active').length;
  });

  constructor() {
    this.initEventListeners();
  }

  private initEventListeners(): void {
    if (typeof window === 'undefined') return;

    // Escuta evento global disparado quando uma nova mensagem é enviada (mesma aba ou abas sincronizadas)
    window.addEventListener('trampou:message-sent', (event: any) => {
      const msg: ChatMessage = event?.detail;
      if (!msg) return;

      this._rooms.update(list =>
        list.map(room => {
          const channel = buildChannelId(room.jobId, room.freelancerId);
          const isMatching =
            room.id === msg.roomId ||
            room.id === msg.channelId ||
            channel === msg.channelId;

          if (isMatching) {
            const alreadyExists = room.messages.some(m => m.id === msg.id);
            if (!alreadyExists) {
              return {
                ...room,
                messages: [...room.messages, msg]
              };
            }
          }
          return room;
        })
      );
    });

    // Escuta evento nativo do navegador para abas distintas
    window.addEventListener('storage', (event: StorageEvent) => {
      if (event.key === TRAMPOU_CHAT_STORAGE_KEY && event.newValue) {
        try {
          const map: Record<string, ChatMessage[]> = JSON.parse(event.newValue);
          this._rooms.update(list =>
            list.map(room => {
              const channel = buildChannelId(room.jobId, room.freelancerId);
              const storedMsgs = map[channel] || map[room.id];
              if (storedMsgs && storedMsgs.length > room.messages.length) {
                return { ...room, messages: storedMsgs };
              }
              return room;
            })
          );
        } catch {}
      }
    });
  }

  loadStoredMessagesMap(): Record<string, ChatMessage[]> {
    if (typeof localStorage === 'undefined') return {};
    try {
      const raw = localStorage.getItem(TRAMPOU_CHAT_STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  saveStoredMessagesMap(map: Record<string, ChatMessage[]>): void {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(TRAMPOU_CHAT_STORAGE_KEY, JSON.stringify(map));
    } catch (err) {
      console.error('Erro ao gravar trampou_chat_messages no localStorage:', err);
    }
  }

  getMessagesByChannel(channelId: string): ChatMessage[] {
    const map = this.loadStoredMessagesMap();
    return map[channelId] || [];
  }

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
    const channelId = buildChannelId(jobId, freelancerId);
    const roomId = `room-${jobId}-${freelancerId}`;

    // 1. Carrega mensagens persistidas do localStorage (não efêmero entre logins/deslogins)
    const storedMap = this.loadStoredMessagesMap();
    const storedList = storedMap[channelId] || storedMap[roomId] || [];

    // 2. Procura em memória
    let existing = this._rooms().find(
      r =>
        (r.id === roomId || r.id === channelId || (r.jobId === jobId && r.freelancerId === freelancerId)) &&
        r.status === 'active'
    );

    if (existing) {
      if (storedList.length > existing.messages.length) {
        const updated = { ...existing, messages: storedList };
        this._rooms.update(list => list.map(r => (r.id === existing!.id ? updated : r)));
        return updated;
      }
      return existing;
    }

    // Se não há mensagens gravadas ainda, inicializa com mensagem informativa do sistema
    const initialMessages: ChatMessage[] = storedList.length > 0 ? storedList : [
      {
        id: `msg-system-${jobId}`,
        channelId,
        roomId,
        senderId: 'system',
        senderName: 'Sistema Trampou',
        senderRole: 'contractor',
        text: `Canal iniciado para alinhamento operacional do turno "${jobTitle}". Mensagens sincronizadas em tempo real.`,
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        read: true,
        createdAt: new Date().toISOString()
      }
    ];

    if (storedList.length === 0) {
      storedMap[channelId] = initialMessages;
      storedMap[roomId] = initialMessages;
      this.saveStoredMessagesMap(storedMap);
    }

    const newRoom: ChatRoom = {
      id: roomId,
      jobId,
      jobTitle,
      companyName,
      freelancerName,
      freelancerId,
      status: 'active',
      createdAt: 'Agora',
      messages: initialMessages
    };

    this._rooms.update(list => [
      newRoom,
      ...list.filter(r => r.id !== roomId && r.id !== channelId)
    ]);

    // Opcional: tenta sincronizar histórico remoto via API .NET
    try {
      this.apiClient.get<ChatMessage[]>(API_ENDPOINTS.MESSAGES.CHANNEL(channelId))
        .then(remoteMsgs => {
          if (Array.isArray(remoteMsgs) && remoteMsgs.length > 0) {
            const currentMap = this.loadStoredMessagesMap();
            const existingChannelMsgs = currentMap[channelId] || [];
            const merged = [...existingChannelMsgs];
            const existingIds = new Set(merged.map(m => m.id));

            for (const rm of remoteMsgs) {
              if (!existingIds.has(rm.id)) {
                merged.push(rm);
                existingIds.add(rm.id);
              }
            }

            currentMap[channelId] = merged;
            currentMap[roomId] = merged;
            this.saveStoredMessagesMap(currentMap);

            this._rooms.update(list =>
              list.map(r => (r.id === roomId ? { ...r, messages: merged } : r))
            );
          }
        })
        .catch(() => {});
    } catch {}

    return newRoom;
  }

  sendMessage(
    roomId: string,
    senderRole: ChatRole,
    senderName: string,
    text: string,
    options?: { channelId?: string; senderId?: string }
  ): void {
    if (!text || text.trim().length === 0) return;

    const room = this.getRoomById(roomId) || this._rooms().find(r => r.id === roomId);
    const channelId =
      options?.channelId || (room ? buildChannelId(room.jobId, room.freelancerId) : roomId);

    const normalizedRole: 'contractor' | 'professional' =
      senderRole === 'company' || senderRole === 'contractor' ? 'contractor' : 'professional';

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      channelId,
      roomId,
      senderId:
        options?.senderId || (normalizedRole === 'contractor' ? 'contractor-user' : 'professional-user'),
      senderName,
      senderRole: normalizedRole,
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      read: false,
      createdAt: new Date().toISOString()
    };

    // 1. Salva no localStorage compartilhado global
    const map = this.loadStoredMessagesMap();
    const currentList = map[channelId] || map[roomId] || [];
    const updatedList = [...currentList, newMsg];
    map[channelId] = updatedList;
    if (roomId !== channelId) {
      map[roomId] = updatedList;
    }
    this.saveStoredMessagesMap(map);

    // 2. Atualiza estado reativo em memória
    this._rooms.update(list =>
      list.map(r => {
        if (
          r.id === roomId ||
          r.id === channelId ||
          (room && r.jobId === room.jobId && r.freelancerId === room.freelancerId)
        ) {
          return {
            ...r,
            messages: updatedList
          };
        }
        return r;
      })
    );

    // 3. Dispara evento reativo global para atualização instantânea
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('trampou:message-sent', { detail: newMsg }));
    }

    // 4. Grava no banco SQLite via API .NET se disponível
    try {
      this.apiClient.post(API_ENDPOINTS.MESSAGES.SEND, newMsg).catch(() => {});
    } catch {}
  }

  deleteRoomOnShiftEnd(jobId: string): void {
    this._rooms.update(list => list.filter(room => room.jobId !== jobId));
  }

  isRoomActive(jobId: string): boolean {
    return this._rooms().some(r => r.jobId === jobId && r.status === 'active');
  }
}
