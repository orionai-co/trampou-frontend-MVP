import { TestBed } from '@angular/core/testing';
import { ApiClientService, AUTH_TOKEN_STORAGE_KEY } from '../../src/app/core/services/api-client.service';
import { environment } from '../../src/environments/environment';
import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

describe('ApiClientService', () => {
  let service: ApiClientService;
  let mockAxiosInstance: any;

  beforeEach(() => {
    // Cria spy do AxiosInstance para isolamento total de rede
    mockAxiosInstance = {
      defaults: {
        baseURL: environment.apiUrl,
        timeout: 15000,
        headers: { 'Content-Type': 'application/json' }
      },
      interceptors: {
        request: {
          use: jasmine.createSpy('request.use')
        },
        response: {
          use: jasmine.createSpy('response.use')
        }
      },
      get: jasmine.createSpy('get').and.returnValue(Promise.resolve({ data: { success: true }, status: 200, headers: {} })),
      post: jasmine.createSpy('post').and.returnValue(Promise.resolve({ data: { created: true }, status: 201, headers: {} })),
      put: jasmine.createSpy('put').and.returnValue(Promise.resolve({ data: { updated: true }, status: 200, headers: {} })),
      delete: jasmine.createSpy('delete').and.returnValue(Promise.resolve({ data: { deleted: true }, status: 200, headers: {} }))
    };

    TestBed.configureTestingModule({
      providers: [ApiClientService]
    });

    service = TestBed.inject(ApiClientService);
  });

  afterEach(() => {
    localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should configure baseURL correctly from environment', () => {
    const instance = service.getClientInstance();
    expect(instance.defaults.baseURL).toBe(environment.apiUrl);
    expect(instance.defaults.timeout).toBe(15000);
  });

  it('should attach Authorization header in request interceptor when token exists in storage', () => {
    localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, 'test-jwt-token-123');

    // Captura o handler de request registrado pelo serviço
    let requestInterceptorFn: ((config: InternalAxiosRequestConfig) => InternalAxiosRequestConfig) | undefined;
    
    // Instancia um mock isolado com interceptors capturáveis
    const customInstance: any = {
      interceptors: {
        request: {
          use: jasmine.createSpy('request.use').and.callFake((fn: any) => {
            requestInterceptorFn = fn;
          })
        },
        response: {
          use: jasmine.createSpy('response.use')
        }
      }
    };

    service.setClientInstance(customInstance);

    expect(requestInterceptorFn).toBeDefined();

    const headersObj: any = {
      set: jasmine.createSpy('set')
    };

    const mockConfig: any = {
      headers: headersObj
    };

    const updatedConfig = requestInterceptorFn!(mockConfig);
    expect(headersObj.set).toHaveBeenCalledWith('Authorization', 'Bearer test-jwt-token-123');
    expect(updatedConfig).toBe(mockConfig);
  });

  it('should delegate get() to axios instance without hitting network', async () => {
    service.setClientInstance(mockAxiosInstance);

    const result = await service.get<{ success: boolean }>('/test-endpoint');

    expect(mockAxiosInstance.get).toHaveBeenCalledWith('/test-endpoint', undefined);
    expect(result).toEqual({ success: true });
  });

  it('should delegate post() to axios instance with payload', async () => {
    service.setClientInstance(mockAxiosInstance);

    const payload = { name: 'Lucas' };
    const result = await service.post<{ created: boolean }>('/test-endpoint', payload);

    expect(mockAxiosInstance.post).toHaveBeenCalledWith('/test-endpoint', payload, undefined);
    expect(result).toEqual({ created: true });
  });

  it('should delegate put() to axios instance with payload', async () => {
    service.setClientInstance(mockAxiosInstance);

    const payload = { status: 'approved' };
    const result = await service.put<{ updated: boolean }>('/test-endpoint', payload);

    expect(mockAxiosInstance.put).toHaveBeenCalledWith('/test-endpoint', payload, undefined);
    expect(result).toEqual({ updated: true });
  });

  it('should delegate delete() to axios instance', async () => {
    service.setClientInstance(mockAxiosInstance);

    const result = await service.delete<{ deleted: boolean }>('/test-endpoint/1');

    expect(mockAxiosInstance.delete).toHaveBeenCalledWith('/test-endpoint/1', undefined);
    expect(result).toEqual({ deleted: true });
  });

  it('should format error responses into standardized ApiError structure', () => {
    const axiosError = {
      response: {
        status: 404,
        data: { message: 'Recurso não encontrado' }
      },
      message: 'Request failed with status code 404'
    };

    const formatted = service.formatError(axiosError);
    expect(formatted.status).toBe(404);
    expect(formatted.message).toBe('Recurso não encontrado');
    expect(formatted.raw).toBe(axiosError);
  });

  it('should fallback error message when server response data has no custom message', () => {
    const networkError = {
      message: 'Network Error',
      status: 500
    };

    const formatted = service.formatError(networkError);
    expect(formatted.status).toBe(500);
    expect(formatted.message).toBe('Network Error');
  });

  it('should clear token from localStorage on 401 error in response interceptor', async () => {
    localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, 'expired-token');

    let responseErrorFn: ((error: any) => Promise<any>) | undefined;

    const customInstance: any = {
      interceptors: {
        request: {
          use: jasmine.createSpy('request.use')
        },
        response: {
          use: jasmine.createSpy('response.use').and.callFake((_success: any, errorFn: any) => {
            responseErrorFn = errorFn;
          })
        }
      }
    };

    service.setClientInstance(customInstance);

    expect(responseErrorFn).toBeDefined();

    const mock401Error = {
      response: { status: 401, data: { message: 'Sessão expirada' } }
    };

    try {
      await responseErrorFn!(mock401Error);
      fail('Should have rejected the promise');
    } catch (err: any) {
      expect(err.status).toBe(401);
      expect(localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)).toBeNull();
    }
  });
});
