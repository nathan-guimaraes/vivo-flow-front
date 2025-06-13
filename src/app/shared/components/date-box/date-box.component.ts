import {
  Component,
  DestroyRef,
  EventEmitter,
  Inject,
  Injectable,
  Input,
  OnInit,
  Output,
  ViewChild,
  forwardRef,
  inject,
} from '@angular/core';
import {
  ControlValueAccessor,
  FormBuilder,
  FormControl,
  FormsModule,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  NgbDate,
  NgbDateAdapter,
  NgbDateNativeAdapter,
  NgbDateParserFormatter,
  NgbDateStruct,
  NgbDatepicker,
  NgbDatepickerModule,
  NgbDropdownModule,
} from '@ng-bootstrap/ng-bootstrap';
import { NgxMaskDirective, NgxMaskPipe, provideNgxMask } from 'ngx-mask';
import { MomentDateParserFormatter } from './date-parser-formatter';
import { distinctUntilChanged, filter, startWith } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IconicModule } from '../iconic/iconic.module';
import { DateConfig } from './date-config';

const isDateEquals = (d1: Date, d2: Date) => {
  return d1?.getTime() === d2?.getTime();
};

@Component({
  selector: 'app-date-box',
  templateUrl: 'date-box.component.html',
  styleUrls: ['date-box.component.scss'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgbDatepickerModule,
    NgbDropdownModule,
    NgxMaskDirective,
    IconicModule,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DateBoxComponent),
      multi: true,
    },
    DateConfig,
    provideNgxMask(),
    NgxMaskPipe,
    {
      provide: NgbDateParserFormatter,
      useClass: MomentDateParserFormatter,
    },
    {
      provide: NgbDateAdapter,
      useClass: NgbDateNativeAdapter,
    },
  ],
})
export class DateBoxComponent implements OnInit, ControlValueAccessor {
  private destroyRef = inject(DestroyRef);

  @ViewChild(NgbDatepicker, { static: true })
  ngbDatepicker: NgbDatepicker;

  formControl = this.formBuilder.control<string>(null);
  dateFormControl = this.formBuilder.control<Date>(null);
  formGroup = this.formBuilder.group({
    text: this.formControl,
    date: this.dateFormControl,
  });

  @Input()
  set type(value) {
    this.config.type = value;
  }

  get type() {
    return this.config.type;
  }

  private _value: Date = null;
  @Input()
  set value(date: Date) {
    date = this.config.handleDate(date);
    if (!isDateEquals(this.value, date)) {
      this._value = date;
      this._updateDatepicker(date);
      this._navigateToByDate(date);
      this._updateDisplayText(date);
    }
  }

  get value() {
    return this._value;
  }

  @Output()
  readonly valueChange = new EventEmitter<Date>();

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

  get inputMask() {
    return this.config.dateInputMask;
  }

  private onChange = (value) => {};
  private onTouched = (value) => {};

  constructor(
    private formBuilder: FormBuilder,
    private config: DateConfig,
    private adapter: NgbDateAdapter<Date>,
    private formatter: NgbDateParserFormatter,
    private maskPipe: NgxMaskPipe
  ) {}

  ngOnInit(): void {
    this._updateDatepicker(this.value);
    this._updateDisplayText(this.value);

    this.formControl.valueChanges
      .pipe(distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe((text) => {
        text = this.maskPipe.transform(text, this.config.dateMask);
        const ngbDate = this.formatter.parse(text);
        const date = this.adapter.toModel(ngbDate);
        if (isDateEquals(this.value, date)) {
          return;
        }

        this._value = date;
        this._updateDatepicker(date);
        this._navigateToByNgbDate(ngbDate);

        this._emitChange(date);
      });
  }

  writeValue(date: Date): void {
    if (typeof date === 'string') {
      date = new Date(date);
    }

    date = this.config.handleDate(date);

    const shouldEmit = !isDateEquals(this.value, date);

    this.value = date;

    if (shouldEmit) {
      this.valueChange.emit(date);
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

  onDateSelect(ngbDate: NgbDateStruct) {
    let date = this.adapter.toModel(ngbDate);
    date = this.config.handleDate(date);

    if (isDateEquals(this.value, date)) {
      return;
    }

    this._value = date;
    this._updateDisplayText(date);

    this._emitChange(date);
  }

  private _emitChange(date: Date) {
    this.valueChange.emit(date);
    this.onChange?.(date);
  }

  private _navigateToByDate(date?: Date) {
    const ngbDate = this.adapter.fromModel(date ?? new Date());
    this._navigateToByNgbDate(ngbDate);
  }

  private _navigateToByNgbDate(ngbDate?: NgbDateStruct) {
    if (ngbDate) {
      this.ngbDatepicker?.navigateTo(ngbDate);
    }
  }

  private _updateDatepicker(date?: Date) {
    this.dateFormControl.reset(date ?? new Date());
  }

  private _updateDisplayText(date?: Date) {
    const ngbDate = this.adapter.fromModel(date);
    const dtStr = this.formatter.format(ngbDate);

    this.formControl.patchValue(dtStr, {
      emitEvent: false,
      emitModelToViewChange: true,
    });
  }
}
