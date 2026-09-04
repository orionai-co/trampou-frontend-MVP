import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChatContactsListComponent, ChatContact } from '../../src/app/shared/components/chat-contacts-list/chat-contacts-list.component';

describe('ChatContactsListComponent', () => {
  let component: ChatContactsListComponent;
  let fixture: ComponentFixture<ChatContactsListComponent>;

  const mockContacts: ChatContact[] = [
    {
      jobId: 'job-1',
      jobTitle: 'Garçom para Casamento',
      candidateId: 'cand-1',
      candidateName: 'Lucas Mendes',
      avatarInitials: 'LM',
      category: 'Gastronomia',
      lastMessage: 'Uniforme preto confirmado!',
      lastMessageTime: '14:35',
      isOnline: true
    },
    {
      jobId: 'job-1',
      jobTitle: 'Garçom para Casamento',
      candidateId: 'cand-2',
      candidateName: 'Mariana Costa',
      avatarInitials: 'MC',
      category: 'Gastronomia',
      lastMessage: 'Estou a caminho do local',
      lastMessageTime: '14:40',
      isOnline: true
    }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatContactsListComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ChatContactsListComponent);
    component = fixture.componentInstance;
  });

  it('should create the contacts list component', () => {
    expect(component).toBeTruthy();
  });

  it('should render empty state when contacts list is empty', () => {
    component.contacts = [];
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Nenhum profissional ativo');
  });

  it('should render contacts list with names, avatars, and job titles', () => {
    component.contacts = mockContacts;
    component.selectedCandidateId = 'cand-1';
    component.selectedJobId = 'job-1';
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Lucas Mendes');
    expect(compiled.textContent).toContain('Mariana Costa');
    expect(compiled.textContent).toContain('Garçom para Casamento');
    expect(compiled.textContent).toContain('2 ativos');

    const activeItem = compiled.querySelector('.tp-contact-item-active');
    expect(activeItem?.textContent).toContain('Lucas Mendes');
  });

  it('should emit selectContact event on item click', () => {
    component.contacts = mockContacts;
    fixture.detectChanges();

    spyOn(component.selectContact, 'emit');
    component.onSelect(mockContacts[1]);

    expect(component.selectContact.emit).toHaveBeenCalledWith(mockContacts[1]);
  });

  it('should filter contacts by search term', () => {
    component.contacts = mockContacts;
    component.searchTerm.set('Mariana');
    fixture.detectChanges();

    expect(component.filteredContacts().length).toBe(1);
    expect(component.filteredContacts()[0].candidateName).toBe('Mariana Costa');
  });
});
