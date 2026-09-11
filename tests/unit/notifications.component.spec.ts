import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NotificationsComponent } from '../../src/app/features/notifications/notifications.component';
import { NotificationsService, TrampouNotification } from '../../src/app/core/services/notifications.service';
import { ApiClientService } from '../../src/app/core/services/api-client.service';
import { provideRouter } from '@angular/router';

describe('NotificationsComponent', () => {
  let component: NotificationsComponent;
  let fixture: ComponentFixture<NotificationsComponent>;
  let service: NotificationsService;

  const mockNotifs: TrampouNotification[] = [
    {
      id: 'notif-1',
      type: 'pix_received',
      title: 'Pagamento PIX',
      message: 'PIX recebido',
      timestamp: 'Hoje às 14:00',
      read: false
    },
    {
      id: 'notif-2',
      type: 'shift_reminder',
      title: 'Turno Hoje',
      message: 'Lembrete de turno',
      timestamp: 'Há 15 min',
      read: false
    },
    {
      id: 'notif-3',
      type: 'company_alert',
      title: 'Alerta Empresa',
      message: 'Nova oportunidade',
      timestamp: 'Hoje às 12:40',
      read: false
    }
  ];

  beforeEach(async () => {
    const apiClientSpy = jasmine.createSpyObj('ApiClientService', ['get', 'put']);
    apiClientSpy.get.and.returnValue(Promise.resolve(mockNotifs));
    apiClientSpy.put.and.returnValue(Promise.resolve());

    await TestBed.configureTestingModule({
      imports: [NotificationsComponent],
      providers: [
        NotificationsService,
        { provide: ApiClientService, useValue: apiClientSpy },
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(NotificationsComponent);
    component = fixture.componentInstance;
    service = TestBed.inject(NotificationsService);
    await service.fetchNotifications();
    fixture.detectChanges();
  });

  it('should create notifications component', () => {
    expect(component).toBeTruthy();
  });

  it('should render page heading and unread badge', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Avisos e Lembretes');
    expect(compiled.textContent).toContain('novas');
  });

  it('should filter notifications by tab selection including companies tab', () => {
    expect(component.activeTab()).toBe('all');
    expect(component.filteredNotifications().length).toBe(service.notifications().length);

    component.onTabChange('pix');
    fixture.detectChanges();
    expect(component.activeTab()).toBe('pix');
    expect(component.filteredNotifications().every(n => n.type === 'pix_received')).toBeTrue();

    component.onTabChange('shifts');
    fixture.detectChanges();
    expect(component.activeTab()).toBe('shifts');
    expect(component.filteredNotifications().every(n => n.type === 'shift_reminder' || n.type === 'shift_approved')).toBeTrue();

    component.onTabChange('companies');
    fixture.detectChanges();
    expect(component.activeTab()).toBe('companies');
    expect(component.filteredNotifications().every(n => n.type === 'company_alert' || n.type === 'company_favorite')).toBeTrue();
  });

  it('should mark all notifications as read when button is clicked', () => {
    expect(service.unreadCount()).toBeGreaterThan(0);

    component.onMarkAllAsRead();
    fixture.detectChanges();

    expect(service.unreadCount()).toBe(0);
  });
});
