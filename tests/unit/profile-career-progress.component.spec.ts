import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProfileCareerProgressComponent } from '../../src/app/features/profile/components/profile-career-progress/profile-career-progress.component';
import { UserCareerLevel } from '../../src/app/features/profile/models/user-profile.model';

describe('ProfileCareerProgressComponent', () => {
  let component: ProfileCareerProgressComponent;
  let fixture: ComponentFixture<ProfileCareerProgressComponent>;

  const mockCareerLevel: UserCareerLevel = {
    currentLevel: 2,
    levelName: 'Nível 2 — Experiente',
    nextLevelName: 'Nível 3 — Elite',
    currentPoints: 42,
    targetPoints: 50,
    benefitText: 'Faltam 8 turnos para o Nível 3. Profissionais Elite têm acesso prioritário a eventos corporativos de alto valor.'
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileCareerProgressComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileCareerProgressComponent);
    component = fixture.componentInstance;
    component.careerLevel = mockCareerLevel;
    fixture.detectChanges();
  });

  it('should create the ProfileCareerProgressComponent', () => {
    expect(component).toBeTruthy();
  });

  it('should display current level and next level milestone titles', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Nível 2 — Experiente');
    expect(compiled.textContent).toContain('Nível 3 — Elite');
  });

  it('should render progress bar with correct stats (42 de 50 and 84%)', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('42');
    expect(compiled.textContent).toContain('50 turnos concluídos');
    expect(compiled.textContent).toContain('84%');

    const progressBar = compiled.querySelector('.tp-career-bar-fill') as HTMLElement;
    expect(progressBar).toBeTruthy();
    expect(progressBar.style.width).toBe('84%');
  });

  it('should display subtle career benefit text', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Faltam 8 turnos para o Nível 3');
    expect(compiled.textContent).toContain('Profissionais Elite têm acesso prioritário');
  });

  it('should compute fallback percentage when targetPoints is 0 or null', () => {
    component.careerLevel = {
      ...mockCareerLevel,
      currentPoints: 10,
      targetPoints: 0
    };
    expect(component.progressPercentage).toBe(100);
  });
});
