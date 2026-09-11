import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProfileComponent } from '../../src/app/features/profile/profile.component';
import { UserProfileService } from '../../src/app/core/services/user-profile.service';
import { ApiClientService } from '../../src/app/core/services/api-client.service';

describe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;
  let userProfileService: UserProfileService;
  let apiClientSpy: jasmine.SpyObj<ApiClientService>;

  beforeEach(async () => {
    apiClientSpy = jasmine.createSpyObj('ApiClientService', ['get', 'put']);
    apiClientSpy.get.and.resolveTo({
      success: true,
      data: {
        id: 'usr-001',
        name: 'Matheus Silva',
        email: 'matheus@email.com',
        pixKey: { type: 'phone', key: '11987654321' },
        skills: ['Garçom de Salão']
      }
    });
    apiClientSpy.put.and.resolveTo({ success: true, data: { success: true } });

    await TestBed.configureTestingModule({
      imports: [ProfileComponent],
      providers: [
        UserProfileService,
        { provide: ApiClientService, useValue: apiClientSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
    userProfileService = TestBed.inject(UserProfileService);
    fixture.detectChanges();
  });

  it('should create the ProfileComponent', () => {
    expect(component).toBeTruthy();
  });

  it('should render all profile sections (header, career progress, pix, achievements, skills, reviews)', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('tp-profile-header')).toBeTruthy();
    expect(compiled.querySelector('tp-profile-career-progress')).toBeTruthy();
    expect(compiled.querySelector('tp-pix-settings')).toBeTruthy();
    expect(compiled.querySelector('tp-profile-achievements')).toBeTruthy();
    expect(compiled.querySelector('tp-skills-selector')).toBeTruthy();
    expect(compiled.querySelector('tp-reviews-list')).toBeTruthy();
  });

  it('should update PIX key in service when onPixKeyChange is triggered', () => {
    component.onPixKeyChange({
      type: 'email',
      key: 'matheus.pix@empresa.com'
    });

    expect(userProfileService.currentUser().pixKey.key).toBe('matheus.pix@empresa.com');
    expect(userProfileService.currentUser().pixKey.type).toBe('email');
  });

  it('should update skills in service when onSkillsChange is triggered', () => {
    component.onSkillsChange(['Garçom de Salão', 'Logística & Estoque']);

    expect(userProfileService.currentUser().skills).toEqual(['Garçom de Salão', 'Logística & Estoque']);
  });

  it('should toggle skill correctly when onToggleSkill is called', () => {
    component.onSkillsChange(['Garçom de Salão']);
    component.onToggleSkill('Atendimento & Bar');
    expect(userProfileService.skills()).toContain('Atendimento & Bar');

    component.onToggleSkill('Garçom de Salão');
    expect(userProfileService.skills()).not.toContain('Garçom de Salão');
  });
});
