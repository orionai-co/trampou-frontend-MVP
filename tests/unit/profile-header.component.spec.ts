import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProfileHeaderComponent } from '../../src/app/features/profile/components/profile-header/profile-header.component';
import { INITIAL_USER_PROFILE, UserProfile } from '../../src/app/features/profile/models/user-profile.model';

describe('ProfileHeaderComponent', () => {
  let component: ProfileHeaderComponent;
  let fixture: ComponentFixture<ProfileHeaderComponent>;

  const mockProfile: UserProfile = {
    ...INITIAL_USER_PROFILE,
    name: 'Matheus Silva',
    avatarInitials: 'MS',
    level: 2,
    rating: 4.9,
    punctualityRate: 100,
    completedJobsCount: 42,
    totalReviews: 42,
    verified: true,
    location: {
      city: 'São Paulo',
      neighborhood: 'Pinheiros',
      state: 'SP'
    },
    reliability: {
      attendanceRate: 100,
      completedShifts: 42,
      cancellationRate: 0,
      avgResponseTime: '< 5 min'
    }
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileHeaderComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileHeaderComponent);
    component = fixture.componentInstance;
    component.profile = { ...mockProfile };
    fixture.detectChanges();
  });

  it('should create the ProfileHeaderComponent', () => {
    expect(component).toBeTruthy();
  });

  it('should render avatar initials and user name', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('MS');
    expect(compiled.textContent).toContain('Matheus Silva');
  });

  it('should render level badge and verified badge', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Nível 2');
    expect(compiled.textContent).toContain('Verificado');
  });

  it('should render location and operational reliability metrics strip', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Pinheiros, São Paulo');
    expect(compiled.textContent).toContain('Avaliação');
    expect(compiled.textContent).toContain('4.9');
    expect(compiled.textContent).toContain('42 avaliações');
    expect(compiled.textContent).toContain('Pontualidade');
    expect(compiled.textContent).toContain('100%');
    expect(compiled.textContent).toContain('Confiabilidade');
    expect(compiled.textContent).toContain('42/42 cumpridos');
    expect(compiled.textContent).toContain('Cancelamentos');
    expect(compiled.textContent).toContain('0%');
    expect(compiled.textContent).toContain('Presença garantida');
  });
});
