import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  Renderer2,
  ViewChild,
  forwardRef,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { RandomUtils } from '../../utils/random.utils';

@Component({
  selector: 'app-checkbox',
  templateUrl: 'checkbox.component.html',
  styleUrls: ['checkbox.component.scss'],
  host: {
    '[class.form-switch]': "styleType === 'switch'",
  },
  standalone: true,
  imports: [CommonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CheckboxComponent),
      multi: true,
    },
  ],
})
export class CheckboxComponent implements AfterViewInit, ControlValueAccessor {
  @ViewChild('input', { static: false })
  inputElRef: ElementRef<HTMLInputElement>;

  componentId = RandomUtils.uniqId();

  private _value = false;
  @Input()
  get value() {
    return this._value;
  }

  set value(value: boolean) {
    value = !!value;
    if (this._value !== value) {
      this._value = value;
      this.setProperty('checked', !!value);
    }
  }

  @Output()
  valueChange = new EventEmitter<boolean>();

  private _disabled = false;
  @Input()
  get disabled() {
    return this._disabled;
  }

  set disabled(value: boolean) {
    value = !!value;
    if (this._disabled !== value) {
      this._disabled = value;
      this.setProperty('disabled', !!value);
    }
  }

  @Input()
  label: string;

  @Input()
  labelClickEnabled = false;

  @Input()
  styleType: 'check' | 'switch' = 'check';

  onChange = (_: any) => {};
  onTouched = () => {};

  constructor(private _renderer: Renderer2) {}

  ngAfterViewInit() {
    this.setProperty('checked', this.value);
    this.setProperty('disabled', this.disabled);
  }

  writeValue(value: boolean): void {
    value = !!value;

    if (this.value !== value) {
      this.valueChange.emit(value);
    }

    this.setProperty('checked', value);
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.setProperty('disabled', isDisabled);
  }

  onInputChange(e) {
    const checked = !!e.target.checked;
    this.value = checked;
    this.valueChange.emit(checked);
    this.onChange?.(checked);
  }

  private setProperty(key: string, value: any): void {
    const element = this.inputElRef?.nativeElement;
    if (!element) {
      return;
    }

    this._renderer.setProperty(element, key, value);
  }
}
