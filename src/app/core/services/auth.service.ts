import { Injectable, signal, computed, inject, WritableSignal } from '@angular/core';
import { Router } from '@angular/router';
import { ApiClientService, AUTH_TOKEN_STORAGE_KEY } from './api-client.service';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import {
  AuthResponse,
  AuthUserSummary,
  CompanyRegisterPayload,
  LoginPayload,
  ProfessionalRegisterPayload,
  UserRole
} from '../models/auth.model';

export const AUTH_USER_STORAGE_KEY = 'trampou_auth_user';

export const DEFAULT_MOCK_USER: AuthUserSummary = {
  id: 'usr-mock-preview',
  name: 'Alex Silva',
  email: 'alex.silva@trampou.com',
  role: 'professional',
  avatarUrl: undefined
};

export function getStoredOrMockUser(): AuthUserSummary {
  if (typeof localStorage !== 'undefined') {
    const raw = localStorage.getItem(AUTH_USER_STORAGE_KEY) || localStorage.getItem('trampou_user');
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed && (parsed.id || parsed.email)) {
          return parsed;
        }
      } catch {
        // Ignora erro de parse
      }
    }
  }
  return DEFAULT_MOCK_USER;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiClient = inject(ApiClientService);
  private router = inject(Router);

  private _isSyncing = false;

  // Signals reativos públicos com interoperabilidade direta para leitura e gravação
  readonly userRole: WritableSignal<UserRole | null> = (() => {
    const initialUser = getStoredOrMockUser();
    const s = signal<UserRole | null>(initialUser?.role ?? 'professional');
    const origSet = s.set.bind(s);
    return Object.assign(s, {
      set: (value: UserRole | null) => {
        origSet(value);
        if (this._isSyncing) return;
        this._isSyncing = true;
        try {
          const curr = this.currentUser();
          if (curr && value && curr.role !== value) {
            this.currentUser.set({ ...curr, role: value });
          }
        } finally {
          this._isSyncing = false;
        }
      },
      update: (updateFn: (value: UserRole | null) => UserRole | null) => {
        const next = updateFn(s());
        this.userRole.set(next);
      }
    });
  })();

  readonly currentUser: WritableSignal<AuthUserSummary | null> = (() => {
    const initialUser = getStoredOrMockUser();
    const s = signal<AuthUserSummary | null>(initialUser);
    const origSet = s.set.bind(s);
    return Object.assign(s, {
      set: (value: AuthUserSummary | null) => {
        origSet(value);
        if (this._isSyncing) return;
        this._isSyncing = true;
        try {
          this.userRole.set(value?.role ?? null);
        } finally {
          this._isSyncing = false;
        }
      },
      update: (updateFn: (value: AuthUserSummary | null) => AuthUserSummary | null) => {
        const next = updateFn(s());
        this.currentUser.set(next);
      }
    });
  })();

  readonly isAuthenticated = computed(() => !!this.currentUser());

  /**
   * Realiza login do usuário, armazena token no localStorage e atualiza estado reativo
   */
  async login(payload: LoginPayload): Promise<AuthResponse> {
    const response = await this.apiClient.post<any>(API_ENDPOINTS.AUTH.LOGIN, payload);
    const token = response?.token || response?.accessToken || '';
    const user = this.normalizeUser(response?.user);

    if (typeof localStorage !== 'undefined' && token) {
      localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
    }

    this.currentUser.set(user);
    return { token, user };
  }

  /**
   * Registra um novo profissional autônomo com role 'professional'
   */
  async registerProfessional(payload: ProfessionalRegisterPayload): Promise<AuthResponse> {
    const requestBody = {
      ...payload,
      role: 'professional',
      name: payload.name || payload.nome,
      password: payload.password || payload.senha
    };

    const response = await this.apiClient.post<any>(API_ENDPOINTS.AUTH.REGISTER, requestBody);
    const token = response?.token || response?.accessToken || '';
    const user = this.normalizeUser(response?.user, 'professional');

    if (typeof localStorage !== 'undefined' && token) {
      localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
    }

    this.currentUser.set(user);
    return { token, user };
  }

  /**
   * Registra uma nova empresa/contratante com role 'contractor'
   */
  async registerCompany(payload: CompanyRegisterPayload): Promise<AuthResponse> {
    const requestBody = {
      ...payload,
      role: 'contractor',
      name: payload.name || payload.nomeFantasia || payload.razaoSocial || payload.responsavel,
      password: payload.password || payload.senha
    };

    const response = await this.apiClient.post<any>(API_ENDPOINTS.AUTH.REGISTER, requestBody);
    const token = response?.token || response?.accessToken || '';
    const user = this.normalizeUser(response?.user, 'contractor');

    if (typeof localStorage !== 'undefined' && token) {
      localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
    }

    this.currentUser.set(user);
    return { token, user };
  }

  /**
   * Encerra a sessão atual, limpa tokens e redireciona para a tela de login
   */
  logout(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
      localStorage.removeItem(AUTH_USER_STORAGE_KEY);
    }
    this.currentUser.set(null);
    this.userRole.set(null);
    this.router.navigate(['/auth/login']);
  }

  /**
   * Inicializa a sessão na inicialização da aplicação, restaurando usuário via GET /auth/me se houver token,
   * ou garantindo que exista um usuário mock padrão autenticado (caso não haja nenhum no localStorage).
   */
  async initSession(): Promise<void> {
    if (typeof localStorage === 'undefined') {
      if (!this.currentUser()) {
        this.currentUser.set(DEFAULT_MOCK_USER);
      }
      return;
    }

    const token = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
    if (!token) {
      if (!this.currentUser()) {
        this.currentUser.set(getStoredOrMockUser());
      }
      return;
    }

    try {
      const response = await this.apiClient.get<any>(API_ENDPOINTS.AUTH.ME);
      const rawUser = response?.user || response;
      if (rawUser && (rawUser.id || rawUser.email)) {
        const rawRole = ((rawUser.role || '') as string).toLowerCase().trim();
        if (rawRole === 'contractor' || rawRole === 'company' || rawRole === 'enterprise') {
          this.userRole.set('contractor');
        } else if (rawRole === 'freelancer' || rawRole === 'professional') {
          this.userRole.set('professional');
        }

        const user = this.normalizeUser(rawUser);
        this.currentUser.set(user);
      } else {
        this.currentUser.set(getStoredOrMockUser());
      }
    } catch {
      localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
      this.currentUser.set(getStoredOrMockUser());
    }
  }

  /**
   * Normaliza os dados do usuário para o formato estrito AuthUserSummary
   */
  private normalizeUser(user: any, fallbackRole?: UserRole): AuthUserSummary {
    const rawRole = ((user?.role || '') as string).toLowerCase().trim();
    let role: UserRole = 'professional';

    if (rawRole === 'contractor' || rawRole === 'company' || rawRole === 'enterprise') {
      role = 'contractor';
    } else if (rawRole === 'freelancer' || rawRole === 'professional') {
      role = 'professional';
    } else if (fallbackRole) {
      role = fallbackRole;
    }

    return {
      id: user?.id || '',
      name: user?.name || user?.nome || '',
      email: user?.email || '',
      role,
      avatarUrl: user?.avatarUrl || user?.avatarInitials || undefined
    };
  }
}
