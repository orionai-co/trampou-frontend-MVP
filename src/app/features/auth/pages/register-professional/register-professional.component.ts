import { Component, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { TpAuthHeaderComponent } from '../../components/auth-header/auth-header.component';
import { TpAuthStepProgressComponent, StepItem } from '../../components/auth-step-progress/auth-step-progress.component';
import { TpIconComponent } from '../../../../shared/components/icon/icon.component';
import { maskPhone } from '../../utils/mask.util';

export const SPECIALTIES_BY_AREA: Record<string, string[]> = {
  'Gastronomia': ['Garçom de Salão', 'Barista', 'Cozinheiro', 'Auxiliar de Cozinha', 'Cumim', 'Bartender', 'Pizzaiolo'],
  'Eventos': ['Recepcionista', 'Segurança', 'Promotor de Eventos', 'Operador de Som', 'Carregador / Montagem', 'Hostess'],
  'Construção Civil': ['Pedreiro', 'Pintor', 'Eletricista', 'Encanador', 'Ajudante Geral', 'Gesseiro'],
  'Limpeza & Conservação': ['Auxiliar de Limpeza', 'Diarista', 'Passadeira', 'Zelador', 'Limpador de Vidros'],
  'Logística & Entregas': ['Entregador Moto', 'Entregador Bike', 'Ajudante de Carga', 'Separador de Mercadorias', 'Motorista']
};

export const BRAZILIAN_STATES = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

@Component({
  selector: 'tp-register-professional',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TpAuthHeaderComponent,
    TpAuthStepProgressComponent,
    TpIconComponent
  ],
  templateUrl: './register-professional.component.html',
  styleUrl: './register-professional.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RegisterProfessionalComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  readonly currentStep = signal<number>(1);
  readonly isLoading = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);
  readonly isSuccess = signal<boolean>(false);
  readonly showPassword = signal<boolean>(false);
  readonly showConfirmPassword = signal<boolean>(false);

  readonly areas = Object.keys(SPECIALTIES_BY_AREA);
  readonly states = BRAZILIAN_STATES;
  readonly experienceLevels = ['Iniciante', 'Intermediário', 'Experiente', 'Especializado'];
  readonly radiusOptions = [
    { label: 'Até 5 km', value: 5 },
    { label: 'Até 10 km', value: 10 },
    { label: 'Até 25 km', value: 25 },
    { label: 'Até 50 km', value: 50 },
    { label: 'Toda a região', value: 100 }
  ];
  readonly weekDays = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
  readonly shifts = ['Manhã', 'Tarde', 'Noite', 'Madrugada'];

  readonly steps: StepItem[] = [
    { number: 1, label: 'Conta' },
    { number: 2, label: 'Perfil' },
    { number: 3, label: 'Localização' }
  ];

  // Etapa 1: Dados da Conta
  readonly step1Form: FormGroup = this.fb.group({
    nome: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    whatsapp: ['', [Validators.required, Validators.minLength(14)]],
    senha: ['', [Validators.required, Validators.minLength(8), this.passwordComplexityValidator]],
    confirmarSenha: ['', [Validators.required]]
  }, { validators: this.passwordMatchValidator });

  // Etapa 2: Perfil Profissional
  readonly step2Form: FormGroup = this.fb.group({
    area: ['Gastronomia', [Validators.required]],
    especialidades: [[] as string[], [Validators.required, this.minArrayLengthValidator(1)]],
    experiencia: ['Experiente', [Validators.required]],
    descricao: ['']
  });

  // Etapa 3: Localização, Disponibilidade & Termos
  readonly step3Form: FormGroup = this.fb.group({
    cidade: ['São Paulo', [Validators.required]],
    estado: ['SP', [Validators.required]],
    raio: [25, [Validators.required]],
    diasDisponiveis: [['Sex', 'Sáb', 'Dom'] as string[], [this.minArrayLengthValidator(1)]],
    periodosDisponiveis: [['Noite'] as string[], [this.minArrayLengthValidator(1)]],
    termosAceitos: [false, [Validators.requiredTrue]]
  });

  readonly availableSpecialties = computed(() => {
    const selectedArea = this.step2Form.get('area')?.value || 'Gastronomia';
    return SPECIALTIES_BY_AREA[selectedArea] || [];
  });

  // Validador customizado: 8 caracteres, 1 letra e 1 número
  private passwordComplexityValidator(control: AbstractControl): ValidationErrors | null {
    const val = control.value || '';
    const hasLetter = /[a-zA-Z]/.test(val);
    const hasNumber = /[0-9]/.test(val);
    if (!hasLetter || !hasNumber) {
      return { passwordComplexity: true };
    }
    return null;
  }

  // Validador de confirmação de senha
  private passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
    const senha = group.get('senha')?.value;
    const confirmar = group.get('confirmarSenha')?.value;
    if (confirmar && senha !== confirmar) {
      return { passwordMismatch: true };
    }
    return null;
  }

  private minArrayLengthValidator(min: number) {
    return (control: AbstractControl): ValidationErrors | null => {
      const arr = control.value;
      if (!Array.isArray(arr) || arr.length < min) {
        return { minItems: true };
      }
      return null;
    };
  }

  onAreaChange(area: string): void {
    this.step2Form.patchValue({
      area,
      especialidades: []
    });
  }

  toggleSpecialty(spec: string): void {
    const current: string[] = [...(this.step2Form.get('especialidades')?.value || [])];
    const index = current.indexOf(spec);
    if (index > -1) {
      current.splice(index, 1);
    } else {
      current.push(spec);
    }
    this.step2Form.patchValue({ especialidades: current });
    this.step2Form.get('especialidades')?.markAsTouched();
  }

  isSpecialtySelected(spec: string): boolean {
    const current: string[] = this.step2Form.get('especialidades')?.value || [];
    return current.includes(spec);
  }

  toggleDay(day: string): void {
    const current: string[] = [...(this.step3Form.get('diasDisponiveis')?.value || [])];
    const index = current.indexOf(day);
    if (index > -1) {
      current.splice(index, 1);
    } else {
      current.push(day);
    }
    this.step3Form.patchValue({ diasDisponiveis: current });
  }

  isDaySelected(day: string): boolean {
    const current: string[] = this.step3Form.get('diasDisponiveis')?.value || [];
    return current.includes(day);
  }

  toggleShift(shift: string): void {
    const current: string[] = [...(this.step3Form.get('periodosDisponiveis')?.value || [])];
    const index = current.indexOf(shift);
    if (index > -1) {
      current.splice(index, 1);
    } else {
      current.push(shift);
    }
    this.step3Form.patchValue({ periodosDisponiveis: current });
  }

  isShiftSelected(shift: string): boolean {
    const current: string[] = this.step3Form.get('periodosDisponiveis')?.value || [];
    return current.includes(shift);
  }

  onWhatsappInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    const masked = maskPhone(target.value);
    target.value = masked;
    this.step1Form.get('whatsapp')?.setValue(masked);
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

    const disponibilidadeStr = `${s3.diasDisponiveis.join(', ')} (${s3.periodosDisponiveis.join(', ')})`;

    try {
      await this.authService.registerProfessional({
        nome: s1.nome,
        email: s1.email,
        whatsapp: s1.whatsapp,
        senha: s1.senha,
        area: s2.area,
        especialidades: s2.especialidades,
        experiencia: s2.experiencia,
        cidade: s3.cidade,
        estado: s3.estado,
        raio: s3.raio,
        disponibilidade: disponibilidadeStr
      });

      this.isSuccess.set(true);
    } catch (err: any) {
      this.errorMessage.set(err?.message || 'Falha ao realizar cadastro. Tente novamente.');
    } finally {
      this.isLoading.set(false);
    }
  }

  goToOpportunities(): void {
    this.router.navigate(['/oportunidades']);
  }
}
