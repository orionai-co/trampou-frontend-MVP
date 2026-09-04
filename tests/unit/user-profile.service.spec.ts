import { TestBed } from '@angular/core/testing';
import { UserProfileService } from '../../src/app/core/services/user-profile.service';

describe('UserProfileService', () => {
  let service: UserProfileService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UserProfileService]
    });
    service = TestBed.inject(UserProfileService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with standardized user Matheus Silva (MS)', () => {
    expect(service.name()).toBe('Matheus Silva');
    expect(service.shortName()).toBe('Matheus S.');
    expect(service.avatarInitials()).toBe('MS');
    expect(service.level()).toBe(2);
    expect(service.isVerified()).toBeTrue();
  });

  it('should provide career level, reliability metrics and achievements data', () => {
    expect(service.careerLevel().currentLevel).toBe(2);
    expect(service.careerLevel().levelName).toBe('Nível 2 — Experiente');
    expect(service.careerLevel().nextLevelName).toBe('Nível 3 — Elite');
    expect(service.careerLevel().currentPoints).toBe(42);
    expect(service.careerLevel().targetPoints).toBe(50);

    expect(service.reliability().attendanceRate).toBe(100);
    expect(service.reliability().completedShifts).toBe(42);
    expect(service.reliability().cancellationRate).toBe(0);

    expect(service.achievements().length).toBe(4);
    expect(service.achievements()[0].title).toBe('Top Pontualidade');
    expect(service.achievements()[3].title).toBe('Presença Blindada');
  });

  it('should allow partial updates to user profile', () => {
    service.updateProfile({ status: 'busy', statusLabel: 'Em Atendimento' });
    expect(service.currentUser().status).toBe('busy');
    expect(service.statusLabel()).toBe('Em Atendimento');
  });
});
