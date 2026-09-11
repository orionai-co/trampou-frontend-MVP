import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TpIconComponent } from '../../../../shared/components/icon/icon.component';

@Component({
  selector: 'tp-auth-header',
  standalone: true,
  imports: [CommonModule, RouterLink, TpIconComponent],
  template: `
    <header class="tp-auth-header">
      <div class="tp-auth-header-inner">
        @if (backUrl) {
          <a [routerLink]="backUrl" class="tp-auth-back-btn" aria-label="Voltar">
            <tp-icon name="chevron-left" size="sm"></tp-icon>
            <span>Voltar</span>
          </a>
        } @else {
          <div class="tp-auth-header-spacer"></div>
        }

        <a routerLink="/oportunidades" class="tp-auth-brand" aria-label="TRAMPOU - Início">
          <div class="tp-auth-brand-icon">
            <tp-icon name="sparkles" size="sm"></tp-icon>
          </div>
          <span class="tp-auth-brand-text">TRAMPOU</span>
        </a>

        <div class="tp-auth-header-spacer"></div>
      </div>
    </header>
  `,
  styles: [`
    .tp-auth-header {
      width: 100%;
      background-color: var(--tp-color-surface, #ffffff);
      border-bottom: 1px solid var(--tp-color-border, #e2e8f0);
      padding: 0.875rem 1.25rem;
      position: sticky;
      top: 0;
      z-index: 40;
    }

    .tp-auth-header-inner {
      max-width: 960px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .tp-auth-back-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      color: var(--tp-color-text-secondary, #475569);
      font-size: 0.875rem;
      font-weight: 500;
      text-decoration: none;
      padding: 0.375rem 0.625rem;
      border-radius: 6px;
      transition: all 0.15s ease;
      min-width: 80px;
    }

    .tp-auth-back-btn:hover {
      background-color: var(--tp-color-surface-subtle, #f1f5f9);
      color: var(--tp-color-text-primary, #0f172a);
    }

    .tp-auth-brand {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      text-decoration: none;
    }

    .tp-auth-brand-icon {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      background: linear-gradient(135deg, #0066FF, #0052cc);
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 4px rgba(0, 102, 255, 0.2);
    }

    .tp-auth-brand-text {
      font-size: 1.25rem;
      font-weight: 800;
      letter-spacing: -0.03em;
      color: var(--tp-color-primary-900, #0f1f3d);
    }

    .tp-auth-header-spacer {
      min-width: 80px;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TpAuthHeaderComponent {
  @Input() backUrl?: string;
}
