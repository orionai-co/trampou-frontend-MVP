import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { LoginComponent } from '../../src/app/features/auth/pages/login/login.component';
import { AuthService } from '../../src/app/core/services/auth.service';
import { AuthResponse } from '../../src/app/core/models/auth.model';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let router: Router;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj<AuthService>('AuthService', ['login']);

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        provideRouter([])
      ]
    }).compileComponents();

    router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve ser instanciado com formulário vazio e inválido', () => {
    expect(component).toBeTruthy();
    expect(component.form.valid).toBeFalse();
    expect(component.email?.value).toBe('');
    expect(component.password?.value).toBe('');
  });

  it('deve validar formato de e-mail e tamanho mínimo de senha', () => {
    component.form.patchValue({ email: 'invalido', password: '123' });
    expect(component.email?.hasError('email')).toBeTrue();
    expect(component.password?.hasError('minlength')).toBeTrue();

    component.form.patchValue({ email: 'usuario@trampou.com', password: 'password123' });
    expect(component.form.valid).toBeTrue();
  });

  it('deve alternar a visibilidade da senha ao chamar togglePasswordVisibility', () => {
    expect(component.showPassword()).toBeFalse();
    component.togglePasswordVisibility();
    expect(component.showPassword()).toBeTrue();
    component.togglePasswordVisibility();
    expect(component.showPassword()).toBeFalse();
  });

  it('não deve disparar authService.login se o formulário for inválido', async () => {
    await component.onSubmit();
    expect(authServiceSpy.login).not.toHaveBeenCalled();
    expect(component.form.touched).toBeTrue();
  });

  it('deve realizar login e redirecionar para /oportunidades quando role for professional', async () => {
    component.form.patchValue({
      email: 'profissional@trampou.com',
      password: 'StrongPassword123!'
    });

    const mockResponse: AuthResponse = {
      token: 'jwt-mock-prof',
      user: {
        id: 'usr-1',
        name: 'Prestador Silva',
        email: 'profissional@trampou.com',
        role: 'professional'
      }
    };

    authServiceSpy.login.and.returnValue(Promise.resolve(mockResponse));

    await component.onSubmit();

    expect(authServiceSpy.login).toHaveBeenCalledWith({
      email: 'profissional@trampou.com',
      password: 'StrongPassword123!'
    });
    expect(router.navigate).toHaveBeenCalledWith(['/oportunidades']);
    expect(component.isLoading()).toBeFalse();
  });

  it('deve realizar login e redirecionar para /empresa quando role for contractor', async () => {
    component.form.patchValue({
      email: 'empresa@trampou.com',
      password: 'CompanyPassword123!'
    });

    const mockResponse: AuthResponse = {
      token: 'jwt-mock-comp',
      user: {
        id: 'usr-2',
        name: 'Buffet Gourmet',
        email: 'empresa@trampou.com',
        role: 'contractor'
      }
    };

    authServiceSpy.login.and.returnValue(Promise.resolve(mockResponse));

    await component.onSubmit();

    expect(authServiceSpy.login).toHaveBeenCalledWith({
      email: 'empresa@trampou.com',
      password: 'CompanyPassword123!'
    });
    expect(router.navigate).toHaveBeenCalledWith(['/empresa']);
    expect(component.isLoading()).toBeFalse();
  });

  it('deve exibir mensagem de erro amigável caso authService.login falhe', async () => {
    component.form.patchValue({
      email: 'errado@trampou.com',
      password: 'WrongPassword123!'
    });

    authServiceSpy.login.and.returnValue(Promise.reject({ message: 'E-mail ou senha inválidos.' }));

    await component.onSubmit();

    expect(component.errorMessage()).toBe('E-mail ou senha inválidos.');
    expect(router.navigate).not.toHaveBeenCalled();
    expect(component.isLoading()).toBeFalse();
  });

  it('deve sinalizar envio de instruções de recuperação de senha ao chamar onForgotPassword', () => {
    expect(component.forgotPasswordSent()).toBeFalse();
    component.onForgotPassword();
    expect(component.forgotPasswordSent()).toBeTrue();
  });
});
