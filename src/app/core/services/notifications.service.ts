import { Injectable, signal, computed, inject } from '@angular/core';
import { ApiClientService } from './api-client.service';
import { API_ENDPOINTS } from '../constants/api-endpoints';

export type NotificationType =
  | 'shift_reminder'
  | 'pix_received'
  | 'shift_approved'
  | 'new_match'
  | 'company_alert'    // Alerta de empresa seguida
  | 'company_favorite' // Confirmação de empresa favoritada
  | 'system';

export interface TrampouNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string; // Ex: 'Há 15 min', 'Hoje às 14:00', 'Agora'
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
  secondaryActionUrl?: string;
  secondaryActionLabel?: string;
  metadata?: {
    jobId?: string;
    amount?: number;
    shiftTime?: string;
    companyName?: string;
    companyId?: string;
    matchScore?: number;
  };
}

export type NotificationFilterTab = 'all' | 'shifts' | 'pix' | 'opportunities' | 'companies';

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {
  private apiClient = inject(ApiClientService);

  readonly notifications = signal<TrampouNotification[]>([]);
  readonly isLoading = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);

  readonly unreadCount = computed<number>(() => {
    return this.notifications().filter(n => !n.read).length;
  });

  async fetchNotifications(): Promise<TrampouNotification[]> {
    this.isLoading.set(true);
    try {
      const data = await this.apiClient.get<TrampouNotification[]>(API_ENDPOINTS.NOTIFICATIONS.LIST);
      this.notifications.set(data || []);
      return data || [];
    } catch (error: any) {
      this.errorMessage.set(error?.message || 'Erro ao carregar notificações.');
      return [];
    } finally {
      this.isLoading.set(false);
    }
  }

  addNotification(notification: Omit<TrampouNotification, 'id' | 'read' | 'timestamp'> & {
    id?: string;
    read?: boolean;
    timestamp?: string;
  }): TrampouNotification {
    const newNotif: TrampouNotification = {
      id: notification.id || `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      timestamp: notification.timestamp || 'Agora',
      read: notification.read ?? false,
      actionUrl: notification.actionUrl,
      actionLabel: notification.actionLabel,
      secondaryActionUrl: notification.secondaryActionUrl,
      secondaryActionLabel: notification.secondaryActionLabel,
      metadata: notification.metadata
    };

    this.notifications.update(list => [newNotif, ...list]);
    return newNotif;
  }

  notifyCompanyFollowed(companyName: string, companyId?: string): TrampouNotification {
    return this.addNotification({
      type: 'company_alert',
      title: `Acompanhando ${companyName}`,
      message: `Você agora está acompanhando o ${companyName}. Avisaremos assim que novos turnos forem publicados!`,
      actionUrl: companyId ? `/empresas/${companyId}` : '/oportunidades',
      actionLabel: 'Ver Perfil da Empresa',
      metadata: {
        companyName,
        companyId
      }
    });
  }

  notifyCompanyFavorited(companyName: string, companyId?: string): TrampouNotification {
    return this.addNotification({
      type: 'company_favorite',
      title: `Empresa Favoritada: ${companyName}`,
      message: `${companyName} foi adicionado à sua lista de empresas favoritas.`,
      actionUrl: companyId ? `/empresas/${companyId}` : '/oportunidades',
      actionLabel: 'Conhecer Mais Vagas',
      metadata: {
        companyName,
        companyId
      }
    });
  }

  notifyCompanyNewJob(companyName: string, jobTitle: string, matchScore = 98, companyId?: string): TrampouNotification {
    return this.addNotification({
      type: 'company_alert',
      title: `Nova vaga de ${companyName}`,
      message: `${companyName} abriu novas vagas para ${jobTitle} (Match ${matchScore}%).`,
      actionUrl: companyId ? `/empresas/${companyId}` : '/oportunidades',
      actionLabel: 'Ver Vaga & Candidatar',
      metadata: {
        companyName,
        companyId,
        matchScore
      }
    });
  }

  markAsRead(id: string): void {
    this.notifications.update(list =>
      list.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  }

  markAllAsRead(): void {
    this.notifications.update(list =>
      list.map(n => ({ ...n, read: true }))
    );
  }

  deleteNotification(id: string): void {
    this.notifications.update(list =>
      list.filter(n => n.id !== id)
    );
  }

  getFilteredNotifications(tab: NotificationFilterTab): TrampouNotification[] {
    const list = this.notifications();
    switch (tab) {
      case 'shifts':
        return list.filter(n => n.type === 'shift_reminder' || n.type === 'shift_approved');
      case 'pix':
        return list.filter(n => n.type === 'pix_received');
      case 'opportunities':
        return list.filter(n => n.type === 'new_match' || n.type === 'company_alert');
      case 'companies':
        return list.filter(n => n.type === 'company_alert' || n.type === 'company_favorite');
      case 'all':
      default:
        return list;
    }
  }

  async syncMarkAsRead(id: string): Promise<void> {
    this.markAsRead(id);
    try {
      await this.apiClient.put(API_ENDPOINTS.NOTIFICATIONS.MARK_AS_READ(id));
    } catch {
      // Falha silenciosa para manter fluidez de UI
    }
  }

  async syncMarkAllAsRead(): Promise<void> {
    this.markAllAsRead();
    try {
      await this.apiClient.put(API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ);
    } catch {
      // Falha silenciosa para manter fluidez de UI
    }
  }
}
