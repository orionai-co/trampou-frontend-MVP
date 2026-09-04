import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ShiftChatModalComponent } from '../../src/app/shared/components/shift-chat-modal/shift-chat-modal.component';
import { ShiftChatService } from '../../src/app/core/services/shift-chat.service';

describe('ShiftChatModalComponent', () => {
  let component: ShiftChatModalComponent;
  let fixture: ComponentFixture<ShiftChatModalComponent>;
  let chatService: ShiftChatService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShiftChatModalComponent],
      providers: [ShiftChatService]
    }).compileComponents();

    fixture = TestBed.createComponent(ShiftChatModalComponent);
    component = fixture.componentInstance;
    chatService = TestBed.inject(ShiftChatService);

    component.isOpen = true;
    component.jobId = 'spec-job-1';
    component.jobTitle = 'Garçom para Casamento';
    component.companyName = 'Buffet Espaço Paulista';
    component.freelancerName = 'Lucas Mendes';
    component.freelancerId = 'cand-1';
    component.currentUserRole = 'company';

    component.loadOrCreateRoom();
    fixture.detectChanges();
  });

  it('should create the shift chat modal component', () => {
    expect(component).toBeTruthy();
  });

  it('should render counterpart name and ephemeral banner notice', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Lucas Mendes');
    expect(compiled.textContent).toContain('Canal Operacional Efêmero');
  });

  it('should send a message via text input', () => {
    component.messageText.set('Tudo pronto para o briefing?');
    component.sendMessage();

    const room = component.currentRoom();
    expect(room?.messages.some(m => m.text === 'Tudo pronto para o briefing?')).toBeTrue();
    expect(component.messageText()).toBe('');
  });

  it('should send a message via quick reply click', () => {
    const quickReply = component.quickReplies[0];
    component.onQuickReplyClick(quickReply);

    const room = component.currentRoom();
    expect(room?.messages.some(m => m.text === quickReply)).toBeTrue();
  });

  it('should emit closed when clicking close', () => {
    spyOn(component.closed, 'emit');
    component.close();
    expect(component.closed.emit).toHaveBeenCalled();
  });
});
