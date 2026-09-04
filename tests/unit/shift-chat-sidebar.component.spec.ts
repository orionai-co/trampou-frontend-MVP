import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ShiftChatSidebarComponent } from '../../src/app/shared/components/shift-chat-sidebar/shift-chat-sidebar.component';
import { ShiftChatService } from '../../src/app/core/services/shift-chat.service';

describe('ShiftChatSidebarComponent', () => {
  let component: ShiftChatSidebarComponent;
  let fixture: ComponentFixture<ShiftChatSidebarComponent>;
  let chatService: ShiftChatService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShiftChatSidebarComponent],
      providers: [ShiftChatService]
    }).compileComponents();

    fixture = TestBed.createComponent(ShiftChatSidebarComponent);
    component = fixture.componentInstance;
    chatService = TestBed.inject(ShiftChatService);
  });

  it('should create the sidebar component', () => {
    expect(component).toBeTruthy();
  });

  it('should render elegant empty state when no active chat is selected', () => {
    component.jobId = '';
    component.freelancerName = '';
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Nenhum chat selecionado');
    expect(compiled.textContent).toContain('Selecione um candidato aprovado');
  });

  it('should render active chat details, send messages, and emit events', () => {
    component.jobId = 'sidebar-job-1';
    component.jobTitle = 'Garçom para Casamento';
    component.companyName = 'Buffet Espaço Paulista';
    component.freelancerName = 'Lucas Mendes';
    component.freelancerId = 'cand-1';
    component.currentUserRole = 'company';
    component.canPayPix = true;

    component.loadOrCreateRoom();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Lucas Mendes');
    expect(compiled.textContent).toContain('Garçom para Casamento');
    expect(compiled.textContent).toContain('Chat Efêmero');

    // Envio de mensagem
    component.messageText.set('Uniforme confirmado?');
    component.sendMessage();

    const room = component.currentRoom();
    expect(room?.messages.some(m => m.text === 'Uniforme confirmado?')).toBeTrue();

    // Resposta rápida
    const quick = component.quickReplies[0];
    component.onQuickReplyClick(quick);
    expect(component.currentRoom()?.messages.some(m => m.text === quick)).toBeTrue();

    // Payout emit
    spyOn(component.openPayout, 'emit');
    component.onPayoutClick();
    expect(component.openPayout.emit).toHaveBeenCalled();

    // Close emit
    spyOn(component.closed, 'emit');
    component.close();
    expect(component.closed.emit).toHaveBeenCalled();
  });

  it('should adapt quick replies and empty description for freelancer role', () => {
    component.currentUserRole = 'freelancer';
    expect(component.quickReplies).toContain('Cheguei no local!');
    expect(component.quickReplies).toContain('Traje e uniforme 100% alinhados.');
    expect(component.emptyStateDescription).toContain('Selecione um contratante');
  });

  it('should render mobile brand header with Trampou logo', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const brandHeader = compiled.querySelector('.tp-mobile-chat-brand-header');
    expect(brandHeader).toBeTruthy();
    expect(brandHeader?.textContent).toContain('TRAMPOU');
  });
});
