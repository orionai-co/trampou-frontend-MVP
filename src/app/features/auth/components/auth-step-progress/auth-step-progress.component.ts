import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TpIconComponent } from '../../../../shared/components/icon/icon.component';

export interface StepItem {
  number: number;
  label: string;
}

@Component({
  selector: 'tp-auth-step-progress',
  standalone: true,
  imports: [CommonModule, TpIconComponent],
  template: `
    <div class="tp-step-progress" role="progressbar" [attr.aria-valuenow]="currentStep" aria-valuemin="1" [attr.aria-valuemax]="steps.length">
      <div class="tp-step-progress-track">
        @for (step of steps; track step.number; let i = $index; let last = $last) {
          <div 
            class="tp-step-item" 
            [class.tp-step-active]="step.number === currentStep"
            [class.tp-step-completed]="step.number < currentStep"
            [class.tp-step-pending]="step.number > currentStep"
          >
            <div class="tp-step-indicator">
              @if (step.number < currentStep) {
                <tp-icon name="check" size="xs" customClass="tp-step-check"></tp-icon>
              } @else {
                <span class="tp-step-num">{{ step.number }}</span>
              }
            </div>
            <span class="tp-step-label">{{ step.label }}</span>
          </div>

          @if (!last) {
            <div 
              class="tp-step-connector" 
              [class.tp-connector-completed]="step.number < currentStep"
            ></div>
          }
        }
      </div>
    </div>
  `,
  styles: [`
    .tp-step-progress {
      width: 100%;
      margin: 1.5rem 0 2rem;
    }

    .tp-step-progress-track {
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: relative;
    }

    .tp-step-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      z-index: 2;
    }

    .tp-step-indicator {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 0.875rem;
      transition: all 0.25s ease;
      background-color: var(--tp-color-surface, #ffffff);
      border: 2px solid var(--tp-color-border, #e2e8f0);
      color: var(--tp-color-text-tertiary, #94a3b8);
    }

    .tp-step-label {
      font-size: 0.8125rem;
      font-weight: 600;
      color: var(--tp-color-text-tertiary, #94a3b8);
      white-space: nowrap;
      transition: color 0.25s ease;
    }

    /* Active */
    .tp-step-active .tp-step-indicator {
      background-color: #0066FF;
      border-color: #0066FF;
      color: #ffffff;
      box-shadow: 0 0 0 4px rgba(0, 102, 255, 0.15);
    }

    .tp-step-active .tp-step-label {
      color: #0066FF;
      font-weight: 700;
    }

    /* Completed */
    .tp-step-completed .tp-step-indicator {
      background-color: #10b981;
      border-color: #10b981;
      color: #ffffff;
    }

    .tp-step-completed .tp-step-label {
      color: var(--tp-color-text-secondary, #475569);
    }

    /* Connector line */
    .tp-step-connector {
      flex: 1;
      height: 2px;
      background-color: var(--tp-color-border, #e2e8f0);
      margin: 0 0.5rem;
      position: relative;
      top: -0.75rem;
      transition: background-color 0.25s ease;
      z-index: 1;
    }

    .tp-step-connector.tp-connector-completed {
      background-color: #10b981;
    }

    @media (max-width: 480px) {
      .tp-step-indicator {
        width: 30px;
        height: 30px;
        font-size: 0.75rem;
      }
      .tp-step-label {
        font-size: 0.75rem;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TpAuthStepProgressComponent {
  @Input() currentStep = 1;
  @Input() steps: StepItem[] = [
    { number: 1, label: 'Conta' },
    { number: 2, label: 'Perfil' },
    { number: 3, label: 'Finalização' }
  ];
}
