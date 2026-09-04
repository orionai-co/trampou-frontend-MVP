import { Injectable, signal, computed } from '@angular/core';

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
  private readonly initialNotifications: TrampouNotification[] = [
    {
      id: 'notif-1',
      type: 'shift_reminder',
      title: 'Turno Hoje: Garçom para Casamento',
      message: 'Seu turno no Buffet Espaço Paulista começa às 18:00 (em 2 horas). Não se esqueça do uniforme preto.',
      timestamp: 'Há 15 min',
      read: false,
      actionUrl: '/meus-trabalhos',
      actionLabel: 'Ver Detalhes do Turno',
      secondaryActionUrl: '/meus-trabalhos',
      secondaryActionLabel: 'Abrir Chat',
      metadata: {
        jobId: 'job-1',
        shiftTime: '18:00 às 02:00',
        companyName: 'Buffet Espaço Paulista'
      }
    },
    {
      id: 'notif-2',
      type: 'pix_received',
      title: 'Pagamento PIX Liberado',
      message: 'Repasse de R$ 190,00 transferido instantaneamente via PIX pelo Buffet Fasano.',
      timestamp: 'Hoje às 14:00',
      read: false,
      actionUrl: '/meus-trabalhos',
      actionLabel: 'Ver Comprovante',
      metadata: {
        amount: 190,
        companyName: 'Buffet Fasano'
      }
    },
    {
      id: 'notif-comp-1',
      type: 'company_alert',
      title: 'Nova Vaga de Buffet Espaço Paulista',
      message: 'Seu buffet acompanhado acabou de publicar 2 vagas de Garçom de Salão (98% de Match) para este final de semana.',
      timestamp: 'Hoje às 12:40',
      read: false,
      actionUrl: '/empresas/buffet-espaco-paulista',
      actionLabel: 'Ver Vaga & Candidatar',
      metadata: {
        companyName: 'Buffet Espaço Paulista',
        companyId: 'comp-001',
        matchScore: 98
      }
    },
    {
      id: 'notif-3',
      type: 'shift_approved',
      title: 'Candidatura Aprovada!',
      message: 'Você foi selecionado para Auxiliar de Bar no SkyLounge Rooftop.',
      timestamp: 'Hoje às 11:30',
      read: false,
      actionUrl: '/meus-trabalhos',
      actionLabel: 'Alinhar no Chat',
      metadata: {
        jobId: 'job-2',
        companyName: 'SkyLounge Rooftop'
      }
    },
    {
      id: 'notif-4',
      type: 'new_match',
      title: 'Oportunidade de Alto Match',
      message: 'Nova vaga com 98% de Match disponível perto de você.',
      timestamp: 'Ontem às 19:45',
      read: true,
      actionUrl: '/oportunidades',
      actionLabel: 'Quero esse Trampo',
      metadata: {
        matchScore: 98
      }
    },
    {
      id: 'notif-5',
      type: 'system',
      title: 'Passaporte de Reputação Atualizado',
      message: 'Parabéns! Sua pontualidade de 100% garantiu o emblema "Pontualidade Britânica" no seu perfil.',
      timestamp: 'Há 2 dias',
      read: true,
      actionUrl: '/perfil',
      actionLabel: 'Ver Conquistas'
    }
  ];

  readonly notifications = signal<TrampouNotification[]>(this.initialNotifications);

  readonly unreadCount = computed<number>(() => {
    return this.notifications().filter(n => !n.read).length;
  });

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
}
