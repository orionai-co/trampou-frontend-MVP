import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HeaderComponent } from '../../src/app/layout/header/header.component';
import { OpportunityService } from '../../src/app/features/opportunities/services/opportunity.service';
import { AuthService } from '../../src/app/core/services/auth.service';
import { provideRouter } from '@angular/router';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let oppService: OpportunityService;
  let authService: AuthService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderComponent],
      providers: [OpportunityService, provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    oppService = TestBed.inject(OpportunityService);
    authService = TestBed.inject(AuthService);
    authService.currentUser.set(null);
    fixture.detectChanges();
  });

  it('should create the Header component', () => {
    expect(component).toBeTruthy();
  });

  it('should render brand logo with text TRAMPOU and proper branding classes', () => {
    const brandElement = fixture.nativeElement.querySelector('.tp-brand-name');
    expect(brandElement).toBeTruthy();
    expect(brandElement.textContent).toContain('TRAMPOU');
    expect(fixture.nativeElement.querySelector('.tp-brand-title')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.tp-brand-icon')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.tp-brand-link')).toBeTruthy();
  });

  it('deve exibir botões Entrar, Cadastre-se e Sou Empresa e ocultar avatar quando deslogado', () => {
    authService.currentUser.set(null);
    fixture.detectChanges();

    expect(component.isAuthenticated()).toBeFalse();
    expect(fixture.nativeElement.querySelector('.tp-header-auth-actions')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.tp-btn-header-login')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.tp-btn-header-register')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.tp-user-avatar-btn')).toBeNull();
    const switchBtn = fixture.nativeElement.querySelector('.tp-context-switch-btn');
    expect(switchBtn).toBeTruthy();
    expect(switchBtn.textContent).toContain('Sou Empresa');
  });

  it('deve exibir avatar e ocultar botões de auth quando logado', () => {
    authService.currentUser.set({
      id: 'usr-1',
      name: 'Matheus Silva',
      email: 'matheus.silva@email.com',
      role: 'professional'
    });
    fixture.detectChanges();

    expect(component.isAuthenticated()).toBeTrue();
    expect(fixture.nativeElement.querySelector('.tp-header-auth-actions')).toBeNull();
    expect(fixture.nativeElement.querySelector('.tp-user-avatar-btn')).toBeTruthy();
  });

  it('não deve exibir o botão Sou Empresa quando o usuário for prestador de serviços (role: professional)', () => {
    authService.currentUser.set({
      id: 'usr-prof',
      name: 'Carlos Garçom',
      email: 'carlos@trampou.com',
      role: 'professional'
    });
    fixture.detectChanges();

    expect(component.userRole()).toBe('professional');
    const switchBtn = fixture.nativeElement.querySelector('.tp-context-switch-btn');
    expect(switchBtn).toBeNull();
  });

  it('não deve exibir o botão Sou Empresa quando o usuário for contratante (role: contractor)', () => {
    authService.currentUser.set({
      id: 'usr-comp',
      name: 'Buffet Delícia',
      email: 'buffet@trampou.com',
      role: 'contractor'
    });
    fixture.detectChanges();

    expect(component.userRole()).toBe('contractor');
    const switchBtn = fixture.nativeElement.querySelector('.tp-context-switch-btn');
    expect(switchBtn).toBeNull();
    const publishBtn = fixture.nativeElement.querySelector('.tp-btn-header-publish');
    expect(publishBtn).toBeTruthy();
    expect(publishBtn.textContent).toContain('Publicar Vaga');
  });

  it('should toggle search bar when search trigger button is clicked', () => {
    expect(component.isSearchOpen()).toBeFalse();
    const searchBtn = fixture.nativeElement.querySelector('.tp-header-search-trigger-btn');
    expect(searchBtn).toBeTruthy();

    searchBtn.click();
    fixture.detectChanges();
    expect(component.isSearchOpen()).toBeTrue();

    const searchBar = fixture.nativeElement.querySelector('.tp-header-search-bar');
    expect(searchBar).toBeTruthy();

    const shadcnInput = fixture.nativeElement.querySelector('.tp-input-shadcn');
    expect(shadcnInput).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.tp-search-prefix-icon')).toBeTruthy();

    component.onSearchInput('Garçom');
    expect(component.searchTerm()).toBe('Garçom');
    expect(component.searchQuery()).toBe('Garçom');
    expect(oppService.searchQuery()).toBe('Garçom');

    component.clearSearch();
    expect(component.searchTerm()).toBe('');
    expect(component.searchQuery()).toBe('');
    expect(oppService.searchQuery()).toBe('');

    component.closeSearch();
    fixture.detectChanges();
    expect(component.isSearchOpen()).toBeFalse();
  });

  it('should toggle user menu when avatar button is clicked and display user data', () => {
    authService.currentUser.set({
      id: 'usr-matheus',
      name: 'Matheus Silva',
      email: 'matheus.silva@email.com',
      role: 'professional'
    });
    component.userProfile.updateProfile({
      name: 'Matheus Silva',
      shortName: 'Matheus S.',
      email: 'matheus.silva@email.com',
      avatarInitials: 'MS'
    });
    fixture.detectChanges();

    expect(component.isUserMenuOpen()).toBeFalse();
    const avatarButton = fixture.nativeElement.querySelector('.tp-user-avatar-btn');
    expect(avatarButton.textContent).toContain('MS');
    expect(avatarButton.textContent).toContain('Matheus');

    avatarButton.click();
    fixture.detectChanges();
    expect(component.isUserMenuOpen()).toBeTrue();

    const dropdown = fixture.nativeElement.querySelector('.tp-user-dropdown');
    expect(dropdown).toBeTruthy();
    expect(dropdown.textContent).toContain('Matheus Silva');
    expect(dropdown.textContent).toContain('matheus.silva@email.com');
  });

  it('deve chamar authService.logout ao clicar em Sair da Conta', () => {
    authService.currentUser.set({
      id: 'usr-matheus',
      name: 'Matheus Silva',
      email: 'matheus.silva@email.com',
      role: 'professional'
    });
    fixture.detectChanges();

    spyOn(authService, 'logout');

    component.isUserMenuOpen.set(true);
    fixture.detectChanges();

    const logoutBtn = fixture.nativeElement.querySelector('.tp-dropdown-logout');
    expect(logoutBtn).toBeTruthy();

    logoutBtn.click();
    fixture.detectChanges();

    expect(authService.logout).toHaveBeenCalled();
    expect(component.isUserMenuOpen()).toBeFalse();
  });

  it('should render navigation links including Oportunidades, Meus Trabalhos, Avisos and Meu Perfil', () => {
    const navLinks = fixture.nativeElement.querySelectorAll('.tp-header-nav .tp-nav-link');
    expect(navLinks.length).toBe(4);

    const textContent = fixture.nativeElement.textContent;
    expect(textContent).toContain('Oportunidades');
    expect(textContent).toContain('Meus Trabalhos');
    expect(textContent).toContain('Avisos');
    expect(textContent).toContain('Meu Perfil');

    const avisosLink = fixture.nativeElement.querySelector('.tp-nav-link-notifications');
    expect(avisosLink).toBeTruthy();
    expect(avisosLink.getAttribute('href') || avisosLink.getAttribute('ng-reflect-router-link')).toContain('/avisos');
  });

  it('para empresa (contractor), deve exibir Painel da Empresa, botão Publicar Vaga e dropdown apontando para /empresa', () => {
    authService.currentUser.set({
      id: 'usr-comp-1',
      name: 'Restaurante Fino',
      email: 'fino@trampou.com',
      role: 'contractor'
    });
    fixture.detectChanges();

    expect(component.userRole()).toBe('contractor');

    // Navegação Desktop
    const navText = fixture.nativeElement.querySelector('.tp-header-nav').textContent;
    expect(navText).toContain('Oportunidades');
    expect(navText).toContain('Painel da Empresa');
    expect(navText).not.toContain('Meus Trabalhos');

    // Botão de Destaque "+ Publicar Vaga"
    const publishBtn = fixture.nativeElement.querySelector('.tp-btn-header-publish');
    expect(publishBtn).toBeTruthy();
    expect(publishBtn.textContent).toContain('Publicar Vaga');

    // Dropdown
    component.isUserMenuOpen.set(true);
    fixture.detectChanges();
    const dropdown = fixture.nativeElement.querySelector('.tp-user-dropdown');
    expect(dropdown.textContent).toContain('Meu Perfil');
    expect(dropdown.textContent).not.toContain('Histórico de Serviços');
  });
});
