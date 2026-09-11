import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProfileAchievementsComponent } from '../../src/app/features/profile/components/profile-achievements/profile-achievements.component';
import { UserAchievement } from '../../src/app/features/profile/models/user-profile.model';

describe('ProfileAchievementsComponent', () => {
  let component: ProfileAchievementsComponent;
  let fixture: ComponentFixture<ProfileAchievementsComponent>;

  const mockAchievements: UserAchievement[] = [
    {
      id: 'ach-1',
      icon: 'zap',
      title: 'Top Pontualidade',
      description: '+20 turnos seguidos sem nenhum atraso registrado.',
      unlockedAt: 'Desbloqueado em Julho, 2026'
    },
    {
      id: 'ach-2',
      icon: 'award',
      title: 'Veterano do Salão',
      description: '+30 turnos concluídos no setor de Gastronomia.',
      unlockedAt: 'Desbloqueado em Junho, 2026'
    },
    {
      id: 'ach-3',
      icon: 'heart',
      title: 'Favorito dos Buffets',
      description: 'Recontratado por 3 ou mais empresas diferentes.',
      unlockedAt: 'Desbloqueado em Maio, 2026'
    },
    {
      id: 'ach-4',
      icon: 'shield-check',
      title: 'Presença Blindada',
      description: '0 cancelamentos em todo o histórico.',
      unlockedAt: 'Desbloqueado em Abril, 2026'
    }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileAchievementsComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileAchievementsComponent);
    component = fixture.componentInstance;
    component.achievements = mockAchievements;
    fixture.detectChanges();
  });

  it('should create the ProfileAchievementsComponent', () => {
    expect(component).toBeTruthy();
  });

  it('should render header with title and unlocked count badge', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Conquistas & Prova de Experiência');
    expect(compiled.textContent).toContain('4 desbloqueadas');
  });

  it('should render all achievement items with title, description and unlocked date', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Top Pontualidade');
    expect(compiled.textContent).toContain('+20 turnos seguidos sem nenhum atraso registrado.');
    expect(compiled.textContent).toContain('Veterano do Salão');
    expect(compiled.textContent).toContain('+30 turnos concluídos no setor de Gastronomia.');
    expect(compiled.textContent).toContain('Favorito dos Buffets');
    expect(compiled.textContent).toContain('Recontratado por 3 ou mais empresas diferentes.');
    expect(compiled.textContent).toContain('Presença Blindada');
    expect(compiled.textContent).toContain('0 cancelamentos em todo o histórico.');
  });

  it('should render empty state when input list is empty', () => {
    fixture.componentRef.setInput('achievements', []);
    fixture.detectChanges();

    expect(component.displayedAchievements.length).toBe(0);
    expect(component.unlockedCount).toBe(0);
    expect(fixture.nativeElement.textContent).toContain('Nenhuma conquista desbloqueada');
  });
});
