import { Component, Input, Output, EventEmitter, signal, ChangeDetectionStrategy, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PixKeyConfig, PixKeyType } from '../../models/user-profile.model';
import {
  TpButtonComponent,
  TpIconComponent,
  TpModalComponent,
  TpInputComponent
} from '../../../../shared/components';

@Component({
  selector: 'tp-pix-settings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TpButtonComponent,
    TpIconComponent,
    TpModalComponent,
    TpInputComponent
  ],
  templateUrl: './pix-settings.component.html',
  styleUrl: './pix-settings.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PixSettingsComponent implements OnChanges {
  @Input({ required: true }) pixKey!: PixKeyConfig;
  @Output() pixKeyChange = new EventEmitter<PixKeyConfig>();

  isModalOpen = signal<boolean>(false);
  selectedType = signal<PixKeyType>('phone');
  keyInput = signal<string>('');
  errorMessage = signal<string | undefined>(undefined);
  feedbackMessage = signal<string | null>(null);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['pixKey'] && this.pixKey) {
      this.selectedType.set(this.pixKey.type || 'phone');
      this.keyInput.set(this.pixKey.key || '');
    }
  }

  get pixTypeLabel(): string {
    if (!this.pixKey) return 'Chave PIX';
    switch (this.pixKey.type) {
      case 'cpf': return 'Chave CPF';
      case 'phone': return 'Chave Celular / Telefone';
      case 'email': return 'Chave E-mail';
      case 'random': return 'Chave Aleatória (EVP)';
      default: return 'Chave PIX';
    }
  }

  get inputLabel(): string {
    switch (this.selectedType()) {
      case 'cpf': return 'Número do CPF (apenas números ou formatado)';
      case 'phone': return 'Número de Celular (com DDD)';
      case 'email': return 'Endereço de E-mail';
      case 'random': return 'Chave Aleatória (EVP)';
    }
  }

  get inputPlaceholder(): string {
    switch (this.selectedType()) {
      case 'cpf': return 'Ex: 123.456.789-00';
      case 'phone': return 'Ex: (11) 98765-4321';
      case 'email': return 'Ex: seu.nome@email.com';
      case 'random': return 'Ex: 123e4567-e89b-12d3-a456-426614174000';
    }
  }

  openEditModal(): void {
    if (this.pixKey) {
      this.selectedType.set(this.pixKey.type || 'phone');
      this.keyInput.set(this.pixKey.key || '');
    }
    this.errorMessage.set(undefined);
    this.isModalOpen.set(true);
  }

  closeEditModal(): void {
    this.isModalOpen.set(false);
  }

  selectType(type: PixKeyType): void {
    this.selectedType.set(type);
    this.errorMessage.set(undefined);
  }

  onKeyInputChange(val: string): void {
    this.keyInput.set(val);
    this.errorMessage.set(undefined);
  }

  isValid(): boolean {
    const val = this.keyInput().trim();
    if (!val) return false;
    if (this.selectedType() === 'email') {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
    }
    if (this.selectedType() === 'cpf') {
      const clean = val.replace(/\D/g, '');
      return clean.length === 11;
    }
    if (this.selectedType() === 'phone') {
      const clean = val.replace(/\D/g, '');
      return clean.length >= 10 && clean.length <= 11;
    }
    return val.length >= 8;
  }

  savePixKey(): void {
    if (!this.isValid()) {
      this.errorMessage.set('Informe uma chave válida no formato selecionado.');
      return;
    }

    const updatedConfig: PixKeyConfig = {
      type: this.selectedType(),
      key: this.keyInput().trim()
    };

    this.pixKeyChange.emit(updatedConfig);
    this.closeEditModal();

    this.feedbackMessage.set('Chave PIX atualizada com sucesso!');
    setTimeout(() => {
      this.feedbackMessage.set(null);
    }, 4000);
  }
}
