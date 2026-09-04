import {
  Component,
  Input,
  Output,
  EventEmitter,
  forwardRef,
  ChangeDetectionStrategy,
  signal,
  OnInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
import { TpIconComponent, IconName } from '../icon/icon.component';

export type InputType = 'text' | 'number' | 'email' | 'password' | 'tel' | 'search' | 'url';

@Component({
  selector: 'tp-input',
  standalone: true,
  imports: [CommonModule, FormsModule, TpIconComponent],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TpInputComponent),
      multi: true
    }
  ],
  templateUrl: './input.component.html',
  styleUrl: './input.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TpInputComponent implements ControlValueAccessor, OnInit {
  @Input() label?: string;
  @Input() placeholder = '';
  @Input() type: InputType = 'text';
  @Input() hint?: string;
  @Input() errorMessage?: string;
  @Input() prefixIcon?: IconName;
  @Input() suffixIcon?: IconName;
  @Input() disabled = false;
  @Input() readonly = false;
  @Input() required = false;
  @Input() clearable = false;

  @Output() valueChange = new EventEmitter<string>();

  value = signal<string>('');
  isFocused = signal<boolean>(false);
  showPassword = signal<boolean>(false);

  currentType = signal<string>('text');

  private onChange: (val: string) => void = () => {};
  private onTouched: () => void = () => {};

  ngOnInit(): void {
    this.currentType.set(this.type);
  }

  writeValue(val: string): void {
    this.value.set(val || '');
  }

  registerOnChange(fn: (val: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onInputChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    const newVal = target.value;
    this.value.set(newVal);
    this.onChange(newVal);
    this.valueChange.emit(newVal);
  }

  onFocus(): void {
    this.isFocused.set(true);
  }

  onBlur(): void {
    this.isFocused.set(false);
    this.onTouched();
  }

  clearInput(): void {
    this.value.set('');
    this.onChange('');
    this.valueChange.emit('');
  }

  togglePasswordVisibility(): void {
    this.showPassword.update(v => !v);
    this.currentType.set(this.showPassword() ? 'text' : 'password');
  }
}
