import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CompanyPublicHeaderComponent } from '../../src/app/features/company-profile/components/company-public-header/company-public-header.component';
import { CompanyPublicProfile, MOCK_COMPANY_PUBLIC_PROFILES } from '../../src/app/features/company-profile/models/company-profile.model';
import { NotificationsService } from '../../src/app/core/services/notifications.service';

describe('CompanyPublicHeaderComponent', () => {
  let component: CompanyPublicHeaderComponent;
  let fixture: ComponentFixture<CompanyPublicHeaderComponent>;
  let notificationsService: NotificationsService;

  const mockProfile: CompanyPublicProfile = {
    ...MOCK_COMPANY_PUBLIC_PROFILES[0]
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompanyPublicHeaderComponent],
      providers: [NotificationsService]
    }).compileComponents();

    fixture = TestBed.createComponent(CompanyPublicHeaderComponent);
    component = fixture.componentInstance;
    component.company = { ...mockProfile };
    component.isFollowing = false;
    component.isFavorited = false;
    notificationsService = TestBed.inject(NotificationsService);
    fixture.detectChanges();
  });

  it('should create the CompanyPublicHeaderComponent', () => {
    expect(component).toBeTruthy();
  });

  it('should render company identity and meta tags', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Buffet Espaço Paulista');
    expect(compiled.textContent).toContain('@espacopaulista');
    expect(compiled.textContent).toContain('Gastronomia & Eventos Corporativos');
    expect(compiled.textContent).toContain('Vila Olímpia, São Paulo (2.4 km)');
    expect(compiled.querySelector('.tp-company-verified-badge')).toBeTruthy();
  });

  it('should emit toggleFollow and trigger notification when clicking follow button', () => {
    spyOn(component.toggleFollow, 'emit');
    spyOn(notificationsService, 'notifyCompanyFollowed').and.callThrough();

    const buttons = fixture.nativeElement.querySelectorAll('.tp-btn-relationship');
    const followBtn = buttons[1] as HTMLButtonElement;
    expect(followBtn).toBeTruthy();
    expect(followBtn.textContent).toContain('Acompanhar');

    followBtn.click();

    expect(component.toggleFollow.emit).toHaveBeenCalled();
    expect(notificationsService.notifyCompanyFollowed).toHaveBeenCalledWith(
      'Buffet Espaço Paulista',
      'comp-001'
    );
  });

  it('should emit toggleFavorite and trigger notification when clicking favorite button', () => {
    spyOn(component.toggleFavorite, 'emit');
    spyOn(notificationsService, 'notifyCompanyFavorited').and.callThrough();

    const buttons = fixture.nativeElement.querySelectorAll('.tp-btn-relationship');
    const favBtn = buttons[0] as HTMLButtonElement;
    expect(favBtn).toBeTruthy();
    expect(favBtn.textContent).toContain('Favoritar');

    favBtn.click();

    expect(component.toggleFavorite.emit).toHaveBeenCalled();
    expect(notificationsService.notifyCompanyFavorited).toHaveBeenCalledWith(
      'Buffet Espaço Paulista',
      'comp-001'
    );
  });

  it('should reflect active states when isFollowing and isFavorited are true', () => {
    fixture.componentRef.setInput('isFollowing', true);
    fixture.componentRef.setInput('isFavorited', true);
    fixture.detectChanges();

    const buttons = fixture.nativeElement.querySelectorAll('.tp-btn-relationship');
    expect(buttons[0].textContent).toContain('Favoritada');
    expect(buttons[1].textContent).toContain('Acompanhando');
  });
});
