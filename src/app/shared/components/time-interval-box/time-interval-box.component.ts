import { CommonModule } from '@angular/common';
import {
  Component,
  DestroyRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  forwardRef,
  inject,
} from '@angular/core';
import {
  ControlValueAccessor,
  FormBuilder,
  FormControl,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  NgbTimeAdapter,
  NgbTimepickerModule,
} from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { TimeAdapter } from './time-adapter';
import { ObjectUtils } from '../../utils/object.utils';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { combineLatest, skip, startWith } from 'rxjs';
import { TimeSpan } from '../../helpers/time-span/time-span';
import { TimeIntervalLike } from '../../helpers/time-span/time-interval';

interface TimeIntervalFormLike {
  startHour: FormControl<TimeSpan>;
  endHour: FormControl<TimeSpan>;
}

@Component({
  selector: 'app-time-interval-box',
  templateUrl: 'time-interval-box.component.html',
  styleUrls: ['time-interval-box.component.scss'],
  host: {
    class: 'form-control bg-soft-light rounded-lg',
    '[class.is-invalid]': '!!invalid',
  },
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    NgbTimepickerModule,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TimeIntervalBoxComponent),
      multi: true,
    },
    {
      provide: NgbTimeAdapter,
      useClass: TimeAdapter,
    },
  ],
})
export class TimeIntervalBoxComponent implements OnInit, ControlValueAccessor {
  private destroyRef = inject(DestroyRef);

  formGroup = this.formBuilder.group<TimeIntervalFormLike>({
    startHour: this.formBuilder.control(null),
    endHour: this.formBuilder.control(null),
  });
  get f() {
    return this.formGroup.controls;
  }

  @Input()
  set value(value) {
    const values = this.formGroup.getRawValue();
    if (!ObjectUtils.equals(values, value)) {
      this.formGroup.patchValue(value);
    }
  }

  get value() {
    const value = this.formGroup.getRawValue() as TimeIntervalLike;

    if (!value?.startHour && !value?.endHour) {
      return null;
    }

    return value;
  }

  @Output()
  readonly valueChange = new EventEmitter<TimeIntervalLike>();

  private _disabled = false;
  @Input()
  set disabled(value) {
    value = !!value;
    if (this._disabled !== value) {
      this._disabled = value;
      if (value) {
        this.formGroup.disable();
      } else {
        this.formGroup.enable();
      }
    }
  }

  get disabled() {
    return this._disabled;
  }

  @Input()
  invalid: boolean;

  private onChange = (value) => {};
  private onTouched = (value) => {};

  constructor(private formBuilder: FormBuilder) {}

  ngOnInit(): void {
    combineLatest([
      this._observeTimeSpanChanged(this.f.startHour),
      this._observeTimeSpanChanged(this.f.endHour),
    ])
      .pipe(skip(1), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        const value = this.value;
        this.valueChange.emit(value);
        this.onChange?.(value);
      });
  }

  writeValue(obj: TimeIntervalLike): void {
    if (!ObjectUtils.equals(this.value, obj)) {
      this.value = obj;
      this.valueChange.emit(this.value);
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  private _observeTimeSpanChanged(control: FormControl<TimeSpan>) {
    return control.valueChanges.pipe(startWith(control.getRawValue()));
  }
}
