import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { TpAuthHeaderComponent } from '../../components/auth-header/auth-header.component';
import { TpButtonComponent } from '../../../../shared/components/button/button.component';
import { TpIconComponent } from '../../../../shared/components/icon/icon.component';

@Component({
  selector: 'tp-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    TpAuthHeaderComponent,
    TpIconComponent
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  readonly isLoading = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);
  readonly showPassword = signal<boolean>(false);
  readonly forgotPasswordSent = signal<boolean>(false);

  readonly form: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  get email() {
    return this.form.get('email');
  }

  get password() {
    return this.form.get('password');
  }

  togglePasswordVisibility(): void {
    this.showPassword.update(v => !v);
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid || this.isLoading()) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const { email, password } = this.form.value;

    try {
      const response = await this.authService.login({ email, password });
      const role = response?.user?.role || this.authService.userRole();
      const targetRoute = role === 'contractor' ? '/empresa' : '/oportunidades';
      await this.router.navigate([targetRoute]);
    } catch (err: any) {
      const msg = err?.message || 'Credenciais inválidas. Verifique seu e-mail e senha.';
      this.errorMessage.set(msg);
    } finally {
      this.isLoading.set(false);
    }
  }

  onForgotPassword(): void {
    this.forgotPasswordSent.set(true);
  }
}
