import {
  Component,
  Input,
  Output,
  EventEmitter,
  forwardRef,
  ChangeDetectionStrategy,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { TpIconComponent } from '../icon/icon.component';

@Component({
  selector: 'tp-checkbox',
  standalone: true,
  imports: [CommonModule, TpIconComponent],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TpCheckboxComponent),
      multi: true
    }
  ],
  templateUrl: './checkbox.component.html',
  styleUrl: './checkbox.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TpCheckboxComponent implements ControlValueAccessor {
  @Input() disabled = false;
  @Output() checkedChange = new EventEmitter<boolean>();

  checked = signal<boolean>(false);

  private onChange: (val: boolean) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(val: boolean): void {
    this.checked.set(!!val);
  }

  registerOnChange(fn: (val: boolean) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onToggle(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.checked.set(target.checked);
    this.onChange(target.checked);
    this.checkedChange.emit(target.checked);
    this.onTouched();
  }
}
