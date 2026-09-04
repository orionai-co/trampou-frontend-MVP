import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NotificationsComponent } from '../../src/app/features/notifications/notifications.component';
import { NotificationsService } from '../../src/app/core/services/notifications.service';
import { provideRouter } from '@angular/router';

describe('NotificationsComponent', () => {
  let component: NotificationsComponent;
  let fixture: ComponentFixture<NotificationsComponent>;
  let service: NotificationsService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotificationsComponent],
      providers: [NotificationsService, provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(NotificationsComponent);
    component = fixture.componentInstance;
    service = TestBed.inject(NotificationsService);
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

  it('should delete a notification when onDelete is invoked', () => {
    const initialLength = service.notifications().length;
    const target = service.notifications()[0];

    component.onDelete(target.id);
    fixture.detectChanges();

    expect(service.notifications().length).toBe(initialLength - 1);
  });
});
