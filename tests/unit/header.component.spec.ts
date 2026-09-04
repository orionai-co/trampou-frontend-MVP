import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HeaderComponent } from '../../src/app/layout/header/header.component';
import { OpportunityService } from '../../src/app/features/opportunities/services/opportunity.service';
import { provideRouter } from '@angular/router';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let oppService: OpportunityService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderComponent],
      providers: [OpportunityService, provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    oppService = TestBed.inject(OpportunityService);
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

  it('should toggle user menu when avatar button is clicked and display Matheus Silva user data', () => {
    expect(component.isUserMenuOpen()).toBeFalse();
    const avatarButton = fixture.nativeElement.querySelector('.tp-user-avatar-btn');
    expect(avatarButton.textContent).toContain('MS');
    expect(avatarButton.textContent).toContain('Matheus S.');

    avatarButton.click();
    fixture.detectChanges();
    expect(component.isUserMenuOpen()).toBeTrue();

    const dropdown = fixture.nativeElement.querySelector('.tp-user-dropdown');
    expect(dropdown).toBeTruthy();
    expect(dropdown.textContent).toContain('Matheus Silva');
    expect(dropdown.textContent).toContain('matheus.silva@email.com');
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
});
