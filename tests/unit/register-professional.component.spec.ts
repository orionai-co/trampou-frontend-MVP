import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { RegisterProfessionalComponent } from '../../src/app/features/auth/pages/register-professional/register-professional.component';
import { AuthService } from '../../src/app/core/services/auth.service';
import { AuthResponse } from '../../src/app/core/models/auth.model';

describe('RegisterProfessionalComponent', () => {
  let component: RegisterProfessionalComponent;
  let fixture: ComponentFixture<RegisterProfessionalComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let router: Router;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj<AuthService>('AuthService', ['registerProfessional']);

    await TestBed.configureTestingModule({
      imports: [RegisterProfessionalComponent],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        provideRouter([])
      ]
    }).compileComponents();

    router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    fixture = TestBed.createComponent(RegisterProfessionalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve inicializar na Etapa 1 com estado de formulário vazio', () => {
    expect(component).toBeTruthy();
    expect(component.currentStep()).toBe(1);
    expect(component.step1Form.valid).toBeFalse();
    expect(component.isSuccess()).toBeFalse();
  });

  describe('Etapa 1 — Validação e Navegação', () => {
    it('deve validar correspondência de senha e complexidade', () => {
      component.step1Form.patchValue({
        nome: 'Carlos Silva',
        email: 'carlos@trampou.com',
        whatsapp: '(11) 99999-9999',
        senha: 'apenasletras',
        confirmarSenha: 'apenasletras'
      });
      expect(component.step1Form.get('senha')?.hasError('passwordComplexity')).toBeTrue();

      component.step1Form.patchValue({
        senha: 'Password123!',
        confirmarSenha: 'DifferentPassword123!'
      });
      expect(component.step1Form.errors?.['passwordMismatch']).toBeTrue();

      component.step1Form.patchValue({
        confirmarSenha: 'Password123!'
      });
      expect(component.step1Form.valid).toBeTrue();
    });

    it('não deve avançar para a Etapa 2 se a Etapa 1 estiver inválida', () => {
      component.nextStep();
      expect(component.currentStep()).toBe(1);
      expect(component.step1Form.touched).toBeTrue();
    });

    it('deve avançar para a Etapa 2 quando a Etapa 1 for válida', () => {
      component.step1Form.patchValue({
        nome: 'Carlos Silva',
        email: 'carlos@trampou.com',
        whatsapp: '(11) 99999-9999',
        senha: 'Password123!',
        confirmarSenha: 'Password123!'
      });

      component.nextStep();
      expect(component.currentStep()).toBe(2);
    });

    it('deve aplicar máscara de telefone corretamente ao digitar WhatsApp', () => {
      const inputEvent = {
        target: { value: '11987654321' }
      } as unknown as Event;

      component.onWhatsappInput(inputEvent);
      expect(component.step1Form.get('whatsapp')?.value).toBe('(11) 98765-4321');
    });
  });

  describe('Etapa 2 — Perfil Profissional & Retenção de Dados', () => {
    beforeEach(() => {
      component.step1Form.patchValue({
        nome: 'Carlos Silva',
        email: 'carlos@trampou.com',
        whatsapp: '(11) 99999-9999',
        senha: 'Password123!',
        confirmarSenha: 'Password123!'
      });
      component.nextStep();
    });

    it('deve reter os dados da Etapa 1 ao voltar com prevStep', () => {
      expect(component.currentStep()).toBe(2);
      component.prevStep();
      expect(component.currentStep()).toBe(1);
      expect(component.step1Form.get('nome')?.value).toBe('Carlos Silva');
      expect(component.step1Form.get('email')?.value).toBe('carlos@trampou.com');
    });

    it('deve alternar a seleção de especialidades dinâmicas', () => {
      expect(component.isSpecialtySelected('Garçom de Salão')).toBeFalse();
      component.toggleSpecialty('Garçom de Salão');
      expect(component.isSpecialtySelected('Garçom de Salão')).toBeTrue();
      component.toggleSpecialty('Garçom de Salão');
      expect(component.isSpecialtySelected('Garçom de Salão')).toBeFalse();
    });

    it('não deve avançar para Etapa 3 sem especialidades selecionadas', () => {
      component.step2Form.patchValue({ especialidades: [] });
      component.nextStep();
      expect(component.currentStep()).toBe(2);
    });

    it('deve avançar para Etapa 3 quando houver especialidades', () => {
      component.toggleSpecialty('Garçom de Salão');
      component.nextStep();
      expect(component.currentStep()).toBe(3);
    });
  });

  describe('Etapa 3 — Localização, Termos e Submissão', () => {
    beforeEach(() => {
      component.step1Form.patchValue({
        nome: 'Carlos Silva',
        email: 'carlos@trampou.com',
        whatsapp: '(11) 99999-9999',
        senha: 'Password123!',
        confirmarSenha: 'Password123!'
      });
      component.nextStep();
      component.toggleSpecialty('Garçom de Salão');
      component.nextStep();
    });

    it('não deve submeter se os termos de uso não forem aceitos', async () => {
      component.step3Form.patchValue({ termosAceitos: false });
      await component.submitRegistration();
      expect(authServiceSpy.registerProfessional).not.toHaveBeenCalled();
    });

    it('deve invocar authService.registerProfessional e exibir tela de sucesso', async () => {
      component.step3Form.patchValue({
        cidade: 'São Paulo',
        estado: 'SP',
        raio: 25,
        termosAceitos: true
      });

      const mockResponse: AuthResponse = {
        token: 'token-registered-prof',
        user: {
          id: 'usr-prof-new',
          name: 'Carlos Silva',
          email: 'carlos@trampou.com',
          role: 'professional'
        }
      };

      authServiceSpy.registerProfessional.and.returnValue(Promise.resolve(mockResponse));

      await component.submitRegistration();

      expect(authServiceSpy.registerProfessional).toHaveBeenCalledWith(
        jasmine.objectContaining({
          nome: 'Carlos Silva',
          email: 'carlos@trampou.com',
          whatsapp: '(11) 99999-9999',
          senha: 'Password123!',
          cidade: 'São Paulo',
          estado: 'SP'
        })
      );
      expect(component.isSuccess()).toBeTrue();
      expect(component.isLoading()).toBeFalse();
    });

    it('deve navegar para /oportunidades ao clicar em Encontrar trabalhos', () => {
      component.goToOpportunities();
      expect(router.navigate).toHaveBeenCalledWith(['/oportunidades']);
    });
  });
});
