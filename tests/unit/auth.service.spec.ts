import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthService, AUTH_USER_STORAGE_KEY, DEFAULT_MOCK_USER } from '../../src/app/core/services/auth.service';
import { ApiClientService, AUTH_TOKEN_STORAGE_KEY } from '../../src/app/core/services/api-client.service';
import { API_ENDPOINTS } from '../../src/app/core/constants/api-endpoints';
import {
  CompanyRegisterPayload,
  LoginPayload,
  ProfessionalRegisterPayload
} from '../../src/app/core/models/auth.model';

describe('AuthService', () => {
  let service: AuthService;
  let apiClientSpy: jasmine.SpyObj<ApiClientService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
    localStorage.removeItem(AUTH_USER_STORAGE_KEY);
    localStorage.removeItem('trampou_user');

    apiClientSpy = jasmine.createSpyObj<ApiClientService>('ApiClientService', ['get', 'post']);
    routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: ApiClientService, useValue: apiClientSpy },
        { provide: Router, useValue: routerSpy }
      ]
    });

    service = TestBed.inject(AuthService);
  });

  afterEach(() => {
    localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
    localStorage.removeItem(AUTH_USER_STORAGE_KEY);
    localStorage.removeItem('trampou_user');
  });

  it('deve ser instanciado com usuário mock padrão autenticado quando não houver usuário no storage', () => {
    expect(service).toBeTruthy();
    expect(service.currentUser()).toEqual(DEFAULT_MOCK_USER);
    expect(service.isAuthenticated()).toBeTrue();
    expect(service.userRole()).toBe('professional');
  });

  describe('login', () => {
    it('deve realizar login com sucesso, persistir token no localStorage e atualizar signals reativos', async () => {
      const loginPayload: LoginPayload = {
        email: 'marcos@trampou.com',
        password: 'Password123!'
      };

      const mockApiResponse = {
        token: 'mock-jwt-token-xyz',
        user: {
          id: 'usr-101',
          name: 'Marcos Silva',
          email: 'marcos@trampou.com',
          role: 'professional'
        }
      };

      apiClientSpy.post.and.returnValue(Promise.resolve(mockApiResponse));

      const result = await service.login(loginPayload);

      expect(apiClientSpy.post).toHaveBeenCalledWith(API_ENDPOINTS.AUTH.LOGIN, loginPayload);
      expect(localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)).toBe('mock-jwt-token-xyz');
      expect(result.token).toBe('mock-jwt-token-xyz');
      expect(result.user.name).toBe('Marcos Silva');
      expect(service.currentUser()).toEqual({
        id: 'usr-101',
        name: 'Marcos Silva',
        email: 'marcos@trampou.com',
        role: 'professional',
        avatarUrl: undefined
      });
      expect(service.isAuthenticated()).toBeTrue();
      expect(service.userRole()).toBe('professional');
    });

    it('deve suportar resposta com accessToken alternativo e normalizar role', async () => {
      const loginPayload: LoginPayload = {
        email: 'empresa@trampou.com',
        password: 'Password123!'
      };

      const mockApiResponse = {
        accessToken: 'alt-jwt-token-abc',
        user: {
          id: 'usr-202',
          name: 'Restaurante Bar do Chef',
          email: 'empresa@trampou.com',
          role: 'company'
        }
      };

      apiClientSpy.post.and.returnValue(Promise.resolve(mockApiResponse));

      const result = await service.login(loginPayload);

      expect(result.token).toBe('alt-jwt-token-abc');
      expect(localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)).toBe('alt-jwt-token-abc');
      expect(service.currentUser()?.role).toBe('contractor');
      expect(service.userRole()).toBe('contractor');
      expect(service.isAuthenticated()).toBeTrue();
    });
  });

  describe('registerProfessional', () => {
    it('deve registrar profissional com role professional, persistir token e atualizar signals', async () => {
      const payload: ProfessionalRegisterPayload = {
        nome: 'Carlos Garçom',
        email: 'carlos@trampou.com',
        whatsapp: '11999999999',
        senha: 'SecretPassword123!',
        area: 'Gastronomia',
        especialidades: ['Garçom de Salão', 'Barista'],
        experiencia: '3 anos',
        cidade: 'São Paulo',
        estado: 'SP',
        raio: 15,
        disponibilidade: 'Fins de semana'
      };

      const mockApiResponse = {
        token: 'prof-jwt-token-456',
        user: {
          id: 'usr-303',
          name: 'Carlos Garçom',
          email: 'carlos@trampou.com',
          role: 'freelancer'
        }
      };

      apiClientSpy.post.and.returnValue(Promise.resolve(mockApiResponse));

      const result = await service.registerProfessional(payload);

      expect(apiClientSpy.post).toHaveBeenCalledWith(
        API_ENDPOINTS.AUTH.REGISTER,
        jasmine.objectContaining({
          role: 'professional',
          name: 'Carlos Garçom',
          email: 'carlos@trampou.com'
        })
      );
      expect(localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)).toBe('prof-jwt-token-456');
      expect(result.token).toBe('prof-jwt-token-456');
      expect(service.currentUser()?.id).toBe('usr-303');
      expect(service.currentUser()?.role).toBe('professional');
      expect(service.isAuthenticated()).toBeTrue();
      expect(service.userRole()).toBe('professional');
    });
  });

  describe('registerCompany', () => {
    it('deve registrar empresa contratante com role contractor, persistir token e atualizar signals', async () => {
      const payload: CompanyRegisterPayload = {
        responsavel: 'Ana Gerente',
        email: 'contato@buffetluxo.com',
        whatsapp: '11988888888',
        senha: 'CompanySecret123!',
        razaoSocial: 'Buffet Luxo Eventos LTDA',
        nomeFantasia: 'Buffet Luxo',
        cnpj: '00.000.000/0001-91',
        segmento: 'Eventos Corporativos',
        tipoContratante: 'Empresa de Eventos',
        cidade: 'São Paulo',
        estado: 'SP',
        endereco: 'Av. Paulista, 1000'
      };

      const mockApiResponse = {
        token: 'comp-jwt-token-789',
        user: {
          id: 'usr-404',
          name: 'Buffet Luxo',
          email: 'contato@buffetluxo.com',
          role: 'company'
        }
      };

      apiClientSpy.post.and.returnValue(Promise.resolve(mockApiResponse));

      const result = await service.registerCompany(payload);

      expect(apiClientSpy.post).toHaveBeenCalledWith(
        API_ENDPOINTS.AUTH.REGISTER,
        jasmine.objectContaining({
          role: 'contractor',
          email: 'contato@buffetluxo.com'
        })
      );
      expect(localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)).toBe('comp-jwt-token-789');
      expect(result.token).toBe('comp-jwt-token-789');
      expect(service.currentUser()?.id).toBe('usr-404');
      expect(service.currentUser()?.role).toBe('contractor');
      expect(service.isAuthenticated()).toBeTrue();
      expect(service.userRole()).toBe('contractor');
    });
  });

  describe('logout', () => {
    it('deve remover token do localStorage, resetar currentUser e redirecionar para /auth/login', () => {
      localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, 'active-session-token');
      service.currentUser.set({
        id: 'usr-505',
        name: 'Usuário Logado',
        email: 'user@trampou.com',
        role: 'professional'
      });

      expect(service.isAuthenticated()).toBeTrue();

      service.logout();

      expect(localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)).toBeNull();
      expect(service.currentUser()).toBeNull();
      expect(service.isAuthenticated()).toBeFalse();
      expect(service.userRole()).toBeNull();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/auth/login']);
    });
  });

  describe('initSession', () => {
    it('não deve disparar requisição se não houver token no storage e deve manter usuário mock autenticado', async () => {
      await service.initSession();

      expect(apiClientSpy.get).not.toHaveBeenCalled();
      expect(service.currentUser()).toEqual(DEFAULT_MOCK_USER);
      expect(service.isAuthenticated()).toBeTrue();
    });

    it('deve restaurar a sessão chamando GET /auth/me se houver token no storage', async () => {
      localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, 'stored-persisted-token');

      const mockMeResponse = {
        id: 'usr-999',
        name: 'Roberto Valente',
        email: 'roberto@trampou.com',
        role: 'professional'
      };

      apiClientSpy.get.and.returnValue(Promise.resolve(mockMeResponse));

      await service.initSession();

      expect(apiClientSpy.get).toHaveBeenCalledWith(API_ENDPOINTS.AUTH.ME);
      expect(service.currentUser()).toEqual({
        id: 'usr-999',
        name: 'Roberto Valente',
        email: 'roberto@trampou.com',
        role: 'professional',
        avatarUrl: undefined
      });
      expect(service.isAuthenticated()).toBeTrue();
    });

    it('deve normalizar role "freelancer" para "professional" e atualizar userRole signal', async () => {
      localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, 'token-freelancer');

      const mockMeResponse = {
        id: 'usr-free-1',
        name: 'Carlos Garçom',
        email: 'carlos@garcom.com',
        role: 'freelancer',
        level: 2
      };

      apiClientSpy.get.and.returnValue(Promise.resolve(mockMeResponse));

      await service.initSession();

      expect(service.currentUser()?.role).toBe('professional');
      expect(service.userRole()).toBe('professional');
    });

    it('deve normalizar role "company", "contractor" ou "enterprise" para "contractor"', async () => {
      localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, 'token-company');

      for (const rawRole of ['company', 'contractor', 'enterprise']) {
        const mockMeResponse = {
          id: 'usr-comp-1',
          name: 'Gabriel Imports',
          email: 'bielopb@gmail.com',
          role: rawRole,
          level: 2
        };

        apiClientSpy.get.and.returnValue(Promise.resolve(mockMeResponse));

        await service.initSession();

        expect(service.currentUser()?.role).toBe('contractor');
        expect(service.userRole()).toBe('contractor');
      }
    });

    it('deve limpar token e restaurar usuário mock padrão caso a requisição GET /auth/me falhe', async () => {
      localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, 'invalid-expired-token');

      apiClientSpy.get.and.returnValue(Promise.reject(new Error('Unauthorized 401')));

      await service.initSession();

      expect(apiClientSpy.get).toHaveBeenCalledWith(API_ENDPOINTS.AUTH.ME);
      expect(localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)).toBeNull();
      expect(service.currentUser()).toEqual(DEFAULT_MOCK_USER);
      expect(service.isAuthenticated()).toBeTrue();
      expect(service.userRole()).toBe('professional');
    });
  });

  describe('userRole.set', () => {
    it('deve permitir definir role diretamente via userRole.set e refletir em userRole()', () => {
      service.userRole.set('contractor');
      expect(service.userRole()).toBe('contractor');

      service.userRole.set('professional');
      expect(service.userRole()).toBe('professional');
    });

    it('deve sincronizar com currentUser quando o usuário estiver autenticado', () => {
      service.currentUser.set({
        id: 'usr-sync',
        name: 'Sync User',
        email: 'sync@trampou.com',
        role: 'professional'
      });

      expect(service.userRole()).toBe('professional');

      service.userRole.set('contractor');
      expect(service.userRole()).toBe('contractor');
      expect(service.currentUser()?.role).toBe('contractor');
    });
  });
});
