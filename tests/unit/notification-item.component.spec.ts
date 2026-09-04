import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NotificationItemComponent } from '../../src/app/features/notifications/components/notification-item/notification-item.component';
import { TrampouNotification } from '../../src/app/core/services/notifications.service';
import { provideRouter } from '@angular/router';

describe('NotificationItemComponent', () => {
  let component: NotificationItemComponent;
  let fixture: ComponentFixture<NotificationItemComponent>;

  const mockShiftReminder: TrampouNotification = {
    id: 'notif-test-1',
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
  };

  const mockPixNotification: TrampouNotification = {
    id: 'notif-test-2',
    type: 'pix_received',
    title: 'Pagamento PIX Liberado',
    message: 'Repasse de R$ 190,00 transferido instantaneamente via PIX pelo Buffet Fasano.',
    timestamp: 'Hoje às 14:00',
    read: true,
    actionUrl: '/meus-trabalhos',
    actionLabel: 'Ver Comprovante',
    metadata: {
      amount: 190,
      companyName: 'Buffet Fasano'
    }
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotificationItemComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(NotificationItemComponent);
    component = fixture.componentInstance;
  });

  it('should create notification item component', () => {
    component.notification = mockShiftReminder;
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should render shift reminder details, badge, time, and action buttons', () => {
    component.notification = mockShiftReminder;
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Turno Hoje: Garçom para Casamento');
    expect(compiled.textContent).toContain('Buffet Espaço Paulista');
    expect(compiled.textContent).toContain('Lembrete de Turno');
    expect(compiled.textContent).toContain('Ver Detalhes do Turno');
    expect(compiled.textContent).toContain('Abrir Chat');

    const card = compiled.querySelector('.tp-notif-card');
    expect(card?.classList.contains('tp-notif-unread')).toBeTrue();
    expect(card?.classList.contains('tp-notif-highlight')).toBeTrue();
  });

  it('should emit markAsRead event when card is clicked while unread', () => {
    component.notification = mockShiftReminder;
    fixture.detectChanges();

    spyOn(component.markAsRead, 'emit');
    component.onCardClick();
    expect(component.markAsRead.emit).toHaveBeenCalledWith('notif-test-1');
  });

  it('should not emit markAsRead when card is already read', () => {
    component.notification = mockPixNotification;
    fixture.detectChanges();

    spyOn(component.markAsRead, 'emit');
    component.onCardClick();
    expect(component.markAsRead.emit).not.toHaveBeenCalled();
  });

  it('should emit delete event when delete button is clicked', () => {
    component.notification = mockShiftReminder;
    fixture.detectChanges();

    spyOn(component.delete, 'emit');
    const mockEvent = new MouseEvent('click');
    component.onDelete(mockEvent);
    expect(component.delete.emit).toHaveBeenCalledWith('notif-test-1');
  });
});
