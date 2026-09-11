import { TestBed } from '@angular/core/testing';
import { NotificationsService, TrampouNotification } from '../../src/app/core/services/notifications.service';
import { ApiClientService } from '../../src/app/core/services/api-client.service';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let apiClientSpy: jasmine.SpyObj<ApiClientService>;

  const mockNotifications: TrampouNotification[] = [
    {
      id: 'notif-1',
      type: 'shift_reminder',
      title: 'Turno Hoje: Garçom para Casamento',
      message: 'Seu turno no Buffet Espaço Paulista começa às 18:00 (em 2 horas).',
      timestamp: 'Há 15 min',
      read: false,
      actionUrl: '/meus-trabalhos'
    },
    {
      id: 'notif-2',
      type: 'pix_received',
      title: 'Pagamento PIX Liberado',
      message: 'Repasse de R$ 190,00 transferido instantaneamente via PIX.',
      timestamp: 'Hoje às 14:00',
      read: false,
      actionUrl: '/meus-trabalhos'
    },
    {
      id: 'notif-comp-1',
      type: 'company_alert',
      title: 'Nova Vaga de Buffet Espaço Paulista',
      message: 'Seu buffet acompanhado acabou de publicar 2 vagas.',
      timestamp: 'Hoje às 12:40',
      read: false,
      actionUrl: '/empresas/buffet-espaco-paulista'
    },
    {
      id: 'notif-3',
      type: 'shift_approved',
      title: 'Candidatura Aprovada!',
      message: 'Você foi selecionado para Auxiliar de Bar.',
      timestamp: 'Hoje às 11:30',
      read: true,
      actionUrl: '/meus-trabalhos'
    }
  ];

  beforeEach(async () => {
    apiClientSpy = jasmine.createSpyObj('ApiClientService', ['get', 'put']);
    apiClientSpy.get.and.returnValue(Promise.resolve(mockNotifications));
    apiClientSpy.put.and.returnValue(Promise.resolve({ success: true }));

    TestBed.configureTestingModule({
      providers: [
        NotificationsService,
        { provide: ApiClientService, useValue: apiClientSpy }
      ]
    });
    service = TestBed.inject(NotificationsService);
    await service.fetchNotifications();
  });

  it('should be created and contain notifications after fetch', () => {
    expect(service).toBeTruthy();
    expect(service.notifications().length).toBeGreaterThan(0);
  });

  it('should compute unreadCount correctly', () => {
    const unread = service.unreadCount();
    const manualCount = service.notifications().filter(n => !n.read).length;
    expect(unread).toBe(manualCount);
  });

  it('should dynamically add a new notification and increment unreadCount', () => {
    const prevCount = service.notifications().length;
    const prevUnread = service.unreadCount();

    const notif = service.addNotification({
      type: 'company_alert',
      title: 'Teste de Alerta',
      message: 'Mensagem de teste de empresa'
    });

    expect(notif.id).toBeTruthy();
    expect(notif.read).toBeFalse();
    expect(service.notifications().length).toBe(prevCount + 1);
    expect(service.unreadCount()).toBe(prevUnread + 1);
    expect(service.notifications()[0].id).toBe(notif.id);
  });

  it('should generate notification when following a company', () => {
    const notif = service.notifyCompanyFollowed('Buffet Espaço Paulista', 'comp-001');

    expect(notif.type).toBe('company_alert');
    expect(notif.title).toContain('Acompanhando Buffet Espaço Paulista');
    expect(notif.message).toContain('Avisaremos assim que novos turnos forem publicados');
    expect(notif.actionUrl).toBe('/empresas/comp-001');
  });

  it('should generate notification when favoriting a company', () => {
    const notif = service.notifyCompanyFavorited('Buffet Espaço Paulista', 'comp-001');

    expect(notif.type).toBe('company_favorite');
    expect(notif.title).toContain('Empresa Favoritada');
    expect(notif.message).toContain('Buffet Espaço Paulista foi adicionado');
  });

  it('should generate notification when followed company posts a new job', () => {
    const notif = service.notifyCompanyNewJob('Buffet Espaço Paulista', 'Garçom de Salão', 98, 'comp-001');

    expect(notif.type).toBe('company_alert');
    expect(notif.title).toContain('Nova vaga de Buffet Espaço Paulista');
    expect(notif.message).toContain('Garçom de Salão (Match 98%)');
  });

  it('should mark a notification as read', () => {
    const unreadNotif = service.notifications().find(n => !n.read);
    expect(unreadNotif).toBeTruthy();

    service.markAsRead(unreadNotif!.id);

    const updated = service.notifications().find(n => n.id === unreadNotif!.id);
    expect(updated?.read).toBeTrue();
  });

  it('should mark all notifications as read', () => {
    expect(service.unreadCount()).toBeGreaterThan(0);

    service.markAllAsRead();

    expect(service.unreadCount()).toBe(0);
    expect(service.notifications().every(n => n.read)).toBeTrue();
  });

  it('should delete a notification by id', () => {
    const initialCount = service.notifications().length;
    const targetId = service.notifications()[0].id;

    service.deleteNotification(targetId);

    expect(service.notifications().length).toBe(initialCount - 1);
    expect(service.notifications().some(n => n.id === targetId)).toBeFalse();
  });

  it('should filter notifications by tab categories including companies', () => {
    const all = service.getFilteredNotifications('all');
    expect(all.length).toBe(service.notifications().length);

    const shifts = service.getFilteredNotifications('shifts');
    expect(shifts.every(n => n.type === 'shift_reminder' || n.type === 'shift_approved')).toBeTrue();

    const pix = service.getFilteredNotifications('pix');
    expect(pix.every(n => n.type === 'pix_received')).toBeTrue();

    const opportunities = service.getFilteredNotifications('opportunities');
    expect(opportunities.every(n => n.type === 'new_match' || n.type === 'company_alert')).toBeTrue();

    const companies = service.getFilteredNotifications('companies');
    expect(companies.every(n => n.type === 'company_alert' || n.type === 'company_favorite')).toBeTrue();
    expect(companies.length).toBeGreaterThan(0);
  });
});
