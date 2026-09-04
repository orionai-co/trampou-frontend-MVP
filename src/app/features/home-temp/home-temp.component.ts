import { Component, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  TpButtonComponent,
  TpBadgeComponent,
  TpCardComponent,
  TpInputComponent,
  TpCheckboxComponent,
  TpIconComponent,
  TpSpinnerComponent,
  TpModalComponent,
  IconName
} from '../../shared/components';

@Component({
  selector: 'app-home-temp',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TpButtonComponent,
    TpBadgeComponent,
    TpCardComponent,
    TpInputComponent,
    TpCheckboxComponent,
    TpIconComponent,
    TpSpinnerComponent,
    TpModalComponent
  ],
  templateUrl: './home-temp.component.html',
  styleUrl: './home-temp.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeTempComponent {
  isLoading = signal<boolean>(false);
  isModalOpen = signal<boolean>(false);

  searchQuery = '';
  locationQuery = '';
  errorSample = 'Requisito Inválido';
  agreeTerms = true;

  iconList: IconName[] = [
    'search',
    'map-pin',
    'calendar',
    'clock',
    'banknote',
    'briefcase',
    'user',
    'users',
    'check',
    'check-circle',
    'alert-circle',
    'alert-triangle',
    'x',
    'x-circle',
    'chevron-right',
    'chevron-left',
    'chevron-down',
    'chevron-up',
    'star',
    'filter',
    'arrow-right',
    'eye',
    'shield-check',
    'bell',
    'sparkles'
  ];

  simulateAction(name: string): void {
    console.log(`Action clicked: ${name}`);
  }

  toggleLoading(): void {
    this.isLoading.set(true);
    setTimeout(() => {
      this.isLoading.set(false);
    }, 1500);
  }

  openDemoModal(): void {
    this.isModalOpen.set(true);
  }

  closeDemoModal(): void {
    this.isModalOpen.set(false);
  }
}
