import { Component, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { validateCnpj, isValidCnpj } from '../../../../core/validators/cnpj.validator';
import { TpAuthHeaderComponent } from '../../components/auth-header/auth-header.component';
import { TpAuthStepProgressComponent, StepItem } from '../../components/auth-step-progress/auth-step-progress.component';
import { TpIconComponent } from '../../../../shared/components/icon/icon.component';
import { maskPhone, maskCnpj } from '../../utils/mask.util';
import { BRAZILIAN_STATES } from '../register-professional/register-professional.component';

export const COMPANY_SEGMENTS = [
  'Gastronomia & Bares',
  'Eventos & Feiras',
  'Hotelaria & Turismo',
  'Construção & Reformas',
  'Varejo & Supermercados',
  'Logística & Distribuição',
  'Limpeza & Facilities',
  'Outro Segmento'
];

export const CONTRACTOR_TYPES = [
  { label: 'Empresa / Pessoa Jurídica (LTDA, ME, EPP)', value: 'Empresa' },
  { label: 'Microempreendedor Individual (MEI)', value: 'MEI' },
  { label: 'Profissional Autônomo / Pessoa Física', value: 'Autônomo' }
];

@Component({
  selector: 'tp-register-company',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TpAuthHeaderComponent,
    TpAuthStepProgressComponent,
    TpIconComponent
  ],
  templateUrl: './register-company.component.html',
  styleUrl: './register-company.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RegisterCompanyComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  readonly currentStep = signal<number>(1);
  readonly isLoading = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);
  readonly isSuccess = signal<boolean>(false);
  readonly showPassword = signal<boolean>(false);
  readonly showConfirmPassword = signal<boolean>(false);

  readonly segments = COMPANY_SEGMENTS;
  readonly contractorTypes = CONTRACTOR_TYPES;
  readonly states = BRAZILIAN_STATES;

  readonly steps: StepItem[] = [
    { number: 1, label: 'Responsável' },
    { number: 2, label: 'Empresa' },
    { number: 3, label: 'Localização' }
  ];

  // Etapa 1: Dados do Responsável
  readonly step1Form: FormGroup = this.fb.group({
    responsavel: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    whatsapp: ['', [Validators.required, Validators.minLength(14)]],
    senha: ['', [Validators.required, Validators.minLength(8), this.passwordComplexityValidator]],
    confirmarSenha: ['', [Validators.required]]
  }, { validators: this.passwordMatchValidator });

  // Etapa 2: Dados da Empresa & Validação Estrita de CNPJ
  readonly step2Form: FormGroup = this.fb.group({
    razaoSocial: ['', [Validators.required, Validators.minLength(3)]],
    nomeFantasia: [''],
    cnpj: ['', [Validators.required, validateCnpj]],
    segmento: ['Gastronomia & Bares', [Validators.required]],
    tipoContratante: ['Empresa', [Validators.required]]
  });

  // Etapa 3: Localização, Perfil & Conclusão
  readonly step3Form: FormGroup = this.fb.group({
    cidade: ['São Paulo', [Validators.required]],
    estado: ['SP', [Validators.required]],
    endereco: ['', [Validators.required, Validators.minLength(5)]],
    descricao: [''],
    site: [''],
    instagram: [''],
    termosAceitos: [false, [Validators.requiredTrue]]
  });

  // Feedback reativo de validação de CNPJ
  readonly cnpjControl = this.step2Form.get('cnpj');

  readonly cnpjStatus = computed<'empty' | 'valid' | 'invalid'>(() => {
    const rawVal = this.cnpjControl?.value;
    if (!rawVal || String(rawVal).trim().length === 0) {
      return 'empty';
    }
    return isValidCnpj(rawVal) ? 'valid' : 'invalid';
  });

  private passwordComplexityValidator(control: AbstractControl): ValidationErrors | null {
    const val = control.value || '';
    const hasLetter = /[a-zA-Z]/.test(val);
    const hasNumber = /[0-9]/.test(val);
    if (!hasLetter || !hasNumber) {
      return { passwordComplexity: true };
    }
    return null;
  }

  private passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
    const senha = group.get('senha')?.value;
    const confirmar = group.get('confirmarSenha')?.value;
    if (confirmar && senha !== confirmar) {
      return { passwordMismatch: true };
    }
    return null;
  }

  onWhatsappInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    const masked = maskPhone(target.value);
    target.value = masked;
    this.step1Form.get('whatsapp')?.setValue(masked);
  }

  onCnpjInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    const masked = maskCnpj(target.value);
    target.value = masked;
    this.step2Form.get('cnpj')?.setValue(masked);
    this.step2Form.get('cnpj')?.updateValueAndValidity();
  }

  togglePasswordVisibility(): void {
    this.showPassword.update(v => !v);
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword.update(v => !v);
  }

  nextStep(): void {
    if (this.currentStep() === 1) {
      if (this.step1Form.invalid) {
        this.step1Form.markAllAsTouched();
        return;
      }
      this.currentStep.set(2);
    } else if (this.currentStep() === 2) {
      if (this.step2Form.invalid) {
        this.step2Form.markAllAsTouched();
        return;
      }
      this.currentStep.set(3);
    }
  }

  prevStep(): void {
    if (this.currentStep() > 1) {
      this.currentStep.update(s => s - 1);
      this.errorMessage.set(null);
    }
  }

  async submitRegistration(): Promise<void> {
    if (this.step3Form.invalid || this.isLoading()) {
      this.step3Form.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const s1 = this.step1Form.value;
    const s2 = this.step2Form.value;
    const s3 = this.step3Form.value;

    try {
      await this.authService.registerCompany({
        responsavel: s1.responsavel,
        email: s1.email,
        whatsapp: s1.whatsapp,
        senha: s1.senha,
        razaoSocial: s2.razaoSocial,
        nomeFantasia: s2.nomeFantasia || s2.razaoSocial,
        cnpj: s2.cnpj,
        segmento: s2.segmento,
        tipoContratante: s2.tipoContratante,
        cidade: s3.cidade,
        estado: s3.estado,
        endereco: s3.endereco
      });

      this.isSuccess.set(true);
    } catch (err: any) {
      this.errorMessage.set(err?.message || 'Falha ao registrar empresa. Tente novamente.');
    } finally {
      this.isLoading.set(false);
    }
  }

  goToCompanyDashboard(): void {
    this.router.navigate(['/empresa']);
  }
}
