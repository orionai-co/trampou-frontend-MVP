import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { RegisterCompanyComponent } from '../../src/app/features/auth/pages/register-company/register-company.component';
import { AuthService } from '../../src/app/core/services/auth.service';
import { AuthResponse } from '../../src/app/core/models/auth.model';

describe('RegisterCompanyComponent', () => {
  let component: RegisterCompanyComponent;
  let fixture: ComponentFixture<RegisterCompanyComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let router: Router;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj<AuthService>('AuthService', ['registerCompany']);

    await TestBed.configureTestingModule({
      imports: [RegisterCompanyComponent],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        provideRouter([])
      ]
    }).compileComponents();

    router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    fixture = TestBed.createComponent(RegisterCompanyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve inicializar na Etapa 1 com estado desabilitado/inválido', () => {
    expect(component).toBeTruthy();
    expect(component.currentStep()).toBe(1);
    expect(component.step1Form.valid).toBeFalse();
    expect(component.isSuccess()).toBeFalse();
  });

  describe('Etapa 1 — Responsável e Senha', () => {
    it('deve validar dados do responsável e senha', () => {
      component.step1Form.patchValue({
        responsavel: 'Ana Gerente',
        email: 'ana@empresa.com',
        whatsapp: '(11) 98888-8888',
        senha: 'Password123!',
        confirmarSenha: 'Password123!'
      });

      expect(component.step1Form.valid).toBeTrue();
      component.nextStep();
      expect(component.currentStep()).toBe(2);
    });

    it('não deve avançar se a Etapa 1 for inválida', () => {
      component.nextStep();
      expect(component.currentStep()).toBe(1);
      expect(component.step1Form.touched).toBeTrue();
    });
  });

  describe('Etapa 2 — Validação Estrita de CNPJ e Máscara', () => {
    beforeEach(() => {
      component.step1Form.patchValue({
        responsavel: 'Ana Gerente',
        email: 'ana@empresa.com',
        whatsapp: '(11) 98888-8888',
        senha: 'Password123!',
        confirmarSenha: 'Password123!'
      });
      component.nextStep();
    });

    it('deve refletir cnpjStatus como empty quando o campo está vazio', () => {
      component.step2Form.patchValue({ cnpj: '' });
      expect(component.cnpjStatus()).toBe('empty');
    });

    it('deve identificar CNPJ inválido e exibir status invalid', () => {
      component.step2Form.patchValue({
        razaoSocial: 'Empresa Teste LTDA',
        cnpj: '00.000.000/0001-92' // dígito verificador incorreto
      });
      expect(component.cnpjStatus()).toBe('invalid');
      expect(component.step2Form.get('cnpj')?.invalid).toBeTrue();

      component.nextStep();
      expect(component.currentStep()).toBe(2); // Bloqueado
    });

    it('deve identificar CNPJ válido conhecido e exibir status valid', () => {
      component.step2Form.patchValue({
        razaoSocial: 'Empresa Teste LTDA',
        cnpj: '00.000.000/0001-91' // Banco do Brasil válido
      });
      expect(component.cnpjStatus()).toBe('valid');
      expect(component.step2Form.get('cnpj')?.valid).toBeTrue();

      component.nextStep();
      expect(component.currentStep()).toBe(3); // Avança com sucesso
    });

    it('deve aplicar máscara de CNPJ ao digitar no campo', () => {
      const inputEvent = {
        target: { value: '00000000000191' }
      } as unknown as Event;

      component.onCnpjInput(inputEvent);
      expect(component.step2Form.get('cnpj')?.value).toBe('00.000.000/0001-91');
      expect(component.cnpjStatus()).toBe('valid');
    });

    it('deve preservar os dados da Etapa 1 e Etapa 2 ao voltar', () => {
      component.step2Form.patchValue({
        razaoSocial: 'Buffet Delícia LTDA',
        cnpj: '00.000.000/0001-91'
      });
      component.nextStep();
      expect(component.currentStep()).toBe(3);

      component.prevStep();
      expect(component.currentStep()).toBe(2);
      expect(component.step2Form.get('razaoSocial')?.value).toBe('Buffet Delícia LTDA');

      component.prevStep();
      expect(component.currentStep()).toBe(1);
      expect(component.step1Form.get('responsavel')?.value).toBe('Ana Gerente');
    });
  });

  describe('Etapa 3 — Localização, Termos e Conclusão', () => {
    beforeEach(() => {
      component.step1Form.patchValue({
        responsavel: 'Ana Gerente',
        email: 'ana@empresa.com',
        whatsapp: '(11) 98888-8888',
        senha: 'Password123!',
        confirmarSenha: 'Password123!'
      });
      component.nextStep();

      component.step2Form.patchValue({
        razaoSocial: 'Buffet Delícia LTDA',
        cnpj: '00.000.000/0001-91'
      });
      component.nextStep();
    });

    it('não deve submeter se os termos não forem aceitos', async () => {
      component.step3Form.patchValue({
        endereco: 'Av. Paulista, 1500',
        termosAceitos: false
      });
      await component.submitRegistration();
      expect(authServiceSpy.registerCompany).not.toHaveBeenCalled();
    });

    it('deve submeter o cadastro corporativo e exibir tela de sucesso', async () => {
      component.step3Form.patchValue({
        cidade: 'São Paulo',
        estado: 'SP',
        endereco: 'Av. Paulista, 1500 - Sala 42',
        termosAceitos: true
      });

      const mockResponse: AuthResponse = {
        token: 'token-registered-company',
        user: {
          id: 'usr-comp-new',
          name: 'Buffet Delícia LTDA',
          email: 'ana@empresa.com',
          role: 'contractor'
        }
      };

      authServiceSpy.registerCompany.and.returnValue(Promise.resolve(mockResponse));

      await component.submitRegistration();

      expect(authServiceSpy.registerCompany).toHaveBeenCalledWith(
        jasmine.objectContaining({
          responsavel: 'Ana Gerente',
          email: 'ana@empresa.com',
          razaoSocial: 'Buffet Delícia LTDA',
          cnpj: '00.000.000/0001-91',
          endereco: 'Av. Paulista, 1500 - Sala 42'
        })
      );
      expect(component.isSuccess()).toBeTrue();
      expect(component.isLoading()).toBeFalse();
    });

    it('deve navegar para /empresa ao clicar no CTA da tela de sucesso', () => {
      component.goToCompanyDashboard();
      expect(router.navigate).toHaveBeenCalledWith(['/empresa']);
    });
  });
});
