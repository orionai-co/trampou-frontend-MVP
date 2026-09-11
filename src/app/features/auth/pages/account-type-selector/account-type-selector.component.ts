import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { TpAuthHeaderComponent } from '../../components/auth-header/auth-header.component';
import { TpIconComponent } from '../../../../shared/components/icon/icon.component';

@Component({
  selector: 'tp-account-type-selector',
  standalone: true,
  imports: [CommonModule, RouterLink, TpAuthHeaderComponent, TpIconComponent],
  templateUrl: './account-type-selector.component.html',
  styleUrl: './account-type-selector.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AccountTypeSelectorComponent {
  private router = inject(Router);

  chooseProfessional(): void {
    this.router.navigate(['/auth/cadastro/profissional']);
  }

  chooseCompany(): void {
    this.router.navigate(['/auth/cadastro/empresa']);
  }
}
