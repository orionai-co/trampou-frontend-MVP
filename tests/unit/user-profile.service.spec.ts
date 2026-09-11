import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { UserProfileService } from '../../src/app/core/services/user-profile.service';
import { ApiClientService } from '../../src/app/core/services/api-client.service';
import { UserProfile } from '../../src/app/features/profile/models/user-profile.model';

describe('UserProfileService', () => {
  let service: UserProfileService;
  let apiClientSpy: jasmine.SpyObj<ApiClientService>;

  const mockApiUser: UserProfile = {
    id: 'usr-001',
    name: 'Matheus Silva',
    shortName: 'Matheus S.',
    avatarInitials: 'MS',
    email: 'matheus.silva@email.com',
    verified: true,
    isVerified: true,
    level: 2,
    levelLabel: 'Nível 2',
    rating: 4.9,
    totalReviews: 42,
    reviewsCount: 42,
    punctualityRate: 100,
    completedJobsCount: 42,
    location: {
      city: 'São Paulo',
      neighborhood: 'Pinheiros',
      state: 'SP'
    },
    status: 'available',
    statusLabel: 'Online & Disponível',
    primaryRole: 'Profissional para Eventos & Gastronomia',
    pixKey: {
      type: 'phone',
      key: '11987654321'
    },
    skills: ['Garçom de Salão', 'Recepção de Eventos'],
    reviews: [],
    careerLevel: {
      currentLevel: 2,
      levelName: 'Nível 2 — Experiente',
      nextLevelName: 'Nível 3 — Elite',
      currentPoints: 42,
      targetPoints: 50,
      benefitText: 'Faltam 8 turnos para o Nível 3.'
    },
    reliability: {
      attendanceRate: 100,
      completedShifts: 42,
      cancellationRate: 0,
      avgResponseTime: '< 5 min'
    },
    achievements: [
      {
        id: 'ach-1',
        icon: 'zap',
        title: 'Top Pontualidade',
        description: '+20 turnos seguidos sem atraso.',
        unlockedAt: 'Julho, 2026'
      }
    ]
  };

  beforeEach(() => {
    apiClientSpy = jasmine.createSpyObj('ApiClientService', ['get', 'post', 'put', 'delete']);
    apiClientSpy.get.and.returnValue(Promise.resolve(mockApiUser));
    apiClientSpy.put.and.returnValue(Promise.resolve({ success: true }));

    TestBed.configureTestingModule({
      providers: [
        UserProfileService,
        { provide: ApiClientService, useValue: apiClientSpy }
      ]
    });
    service = TestBed.inject(UserProfileService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with clean default profile before API fetch', () => {
    expect(service.name()).toBe('');
    expect(service.level()).toBe(1);
    expect(service.isVerified()).toBeFalse();
    expect(service.rating()).toBe(0);
    expect(service.pixKey()).toBe('');
  });

  it('should fetch user profile from API and populate reactive signals', fakeAsync(() => {
    service.fetchUserProfile();
    tick();

    expect(apiClientSpy.get).toHaveBeenCalledWith('/users/me');
    expect(service.name()).toBe('Matheus Silva');
    expect(service.shortName()).toBe('Matheus S.');
    expect(service.avatarInitials()).toBe('MS');
    expect(service.level()).toBe(2);
    expect(service.isVerified()).toBeTrue();
    expect(service.rating()).toBe(4.9);
    expect(service.careerLevel().currentLevel).toBe(2);
    expect(service.reliability().attendanceRate).toBe(100);
    expect(service.achievements().length).toBe(1);
    expect(service.pixKey()).toBe('11987654321');
  }));

  it('should allow partial updates to user profile', () => {
    service.updateProfile({ status: 'busy', statusLabel: 'Em Atendimento' });
    expect(service.currentUser().status).toBe('busy');
    expect(service.statusLabel()).toBe('Em Atendimento');
  });

  it('should update PIX key via updatePixKeyRemote and update local state', fakeAsync(() => {
    service.updatePixKeyRemote({ type: 'cpf', key: '12345678900' });
    tick();

    expect(apiClientSpy.put).toHaveBeenCalledWith('/users/me/pix-key', { type: 'cpf', key: '12345678900' });
    expect(service.pixKey()).toBe('12345678900');
    expect(service.pixKeyType()).toBe('CPF');
  }));

  it('deve normalizar role "contractor", "company" ou "enterprise" para "contractor" ao buscar perfil', fakeAsync(() => {
    for (const rawRole of ['contractor', 'company', 'enterprise']) {
      apiClientSpy.get.and.returnValue(Promise.resolve({
        ...mockApiUser,
        role: rawRole
      }));

      service.fetchUserProfile();
      tick();

      expect(service.userRole()).toBe('contractor');
      expect(service.currentUser().role).toBe('contractor');
    }
  }));

  it('deve normalizar role "freelancer" ou "professional" para "professional" ao buscar perfil', fakeAsync(() => {
    for (const rawRole of ['freelancer', 'professional']) {
      apiClientSpy.get.and.returnValue(Promise.resolve({
        ...mockApiUser,
        role: rawRole
      }));

      service.fetchUserProfile();
      tick();

      expect(service.userRole()).toBe('professional');
      expect(service.currentUser().role).toBe('professional');
    }
  }));

  it('deve atualizar userRole signal ao atualizar perfil com role contractor ou professional', () => {
    service.updateProfile({ role: 'contractor' });
    expect(service.userRole()).toBe('contractor');

    service.updateProfile({ role: 'professional' });
    expect(service.userRole()).toBe('professional');
  });
});
