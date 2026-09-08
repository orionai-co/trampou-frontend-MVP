import { Injectable } from '@angular/core';
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { environment } from '../../../environments/environment';

export interface ApiError {
  message: string;
  status: number;
  raw: any;
}

export const AUTH_TOKEN_STORAGE_KEY = 'trampou_access_token';

@Injectable({
  providedIn: 'root'
})
export class ApiClientService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: environment.apiUrl,
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    this.setupInterceptors();
  }

  /**
   * Permite inspecionar ou injetar uma instância customizada do Axios (útil para isolamento de testes)
   */
  setClientInstance(instance: AxiosInstance): void {
    this.client = instance;
    this.setupInterceptors();
  }

  getClientInstance(): AxiosInstance {
    return this.client;
  }

  /**
   * Configuração de interceptors para autenticação e formatação de erro padronizada
   */
  private setupInterceptors(): void {
    // Request Interceptor: Anexa automaticamente Authorization Bearer se houver token no localStorage
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        if (typeof localStorage !== 'undefined') {
          const token = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
          if (token && config.headers) {
            config.headers.set('Authorization', `Bearer ${token}`);
          }
        }
        return config;
      },
      (error: any) => Promise.reject(this.formatError(error))
    );

    // Response Interceptor: Tratamento de 401 e desempacotamento de dados
    this.client.interceptors.response.use(
      (response: AxiosResponse) => response.data,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          if (typeof localStorage !== 'undefined') {
            localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
          }
        }
        return Promise.reject(this.formatError(error));
      }
    );
  }

  /**
   * Formata respostas de erro do Axios em uma estrutura padronizada
   */
  formatError(error: any): ApiError {
    const status = error?.response?.status || error?.status || 500;
    const message =
      error?.response?.data?.message ||
      error?.message ||
      'Ocorreu um erro inesperado na comunicação com o servidor.';

    return {
      message,
      status,
      raw: error
    };
  }

  /**
   * Requisição GET fortemente tipada
   */
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const res = await this.client.get(url, config);
      return this.unwrapData<T>(res);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Requisição POST fortemente tipada
   */
  async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    try {
      const res = await this.client.post(url, data, config);
      return this.unwrapData<T>(res);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Requisição PUT fortemente tipada
   */
  async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    try {
      const res = await this.client.put(url, data, config);
      return this.unwrapData<T>(res);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Requisição DELETE fortemente tipada
   */
  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const res = await this.client.delete(url, config);
      return this.unwrapData<T>(res);
    } catch (error) {
      throw error;
    }
  }

  private unwrapData<T>(res: any): T {
    if (res && typeof res === 'object' && 'data' in res && 'status' in res && 'headers' in res) {
      return res.data as T;
    }
    return res as T;
  }
}
