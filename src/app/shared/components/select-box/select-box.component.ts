import {
  Component,
  ContentChild,
  DestroyRef,
  Directive,
  EventEmitter,
  Input,
  OnInit,
  Output,
  TemplateRef,
  TrackByFunction,
  ViewChild,
  forwardRef,
  inject,
} from '@angular/core';
import { NgbDropdown } from '@ng-bootstrap/ng-bootstrap';
import { CustomDataSource } from '../../helpers/datasources/custom-datasource';
import {
  BehaviorSubject,
  EMPTY,
  Observable,
  Subject,
  asapScheduler,
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  filter,
  first,
  map,
  merge,
  mergeMap,
  mergeWith,
  startWith,
  switchMap,
  tap,
} from 'rxjs';
import { ExtractExpr, ItemExprUtils } from '../../utils/item-expr.utils';
import {
  ControlValueAccessor,
  FormBuilder,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CustomRawDataSource } from '../../helpers/datasources/custom-raw-datasource';
import { ObjectUtils } from '../../utils/object.utils';
import { ArrayUtils } from '../../utils/array.utils';
import { DataSourceUtils } from '../../helpers/datasources/datasource.utils';
import { DataSourceLike } from '../../helpers/datasources/types';

interface SelectListItemContext<T = any> {
  index: number;
  item: T;
}

@Directive({
  selector: 'ng-template[selectListItem]',
})
export class SelectListItemTemplate<T = any> {
  constructor(public templateRef: TemplateRef<SelectListItemContext<T>>) {}
}

const trackByDefault: TrackByFunction<any> = (_, item) => item;

const hasValue = (value) => {
  return value !== null && value !== undefined;
};

@Component({
  selector: 'app-select-box',
  templateUrl: 'select-box.component.html',
  styleUrls: ['select-box.component.scss'],
  host: {
    '[class.search-mode-dropdown]':
      '!!(searchModeEnabled && isSearchInDropdown)',
    '[class.apply-buttton-enabled]': '!!applyButtonEnabled',
    '[class.select-state-hasvalue]': '!!hasValue',
    '[class.select-state-dropdown-opened]': '!!dropdown?.isOpen()',
  },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectBoxComponent),
      multi: true,
    },
  ],
})
export class SelectBoxComponent<T = any>
  implements OnInit, ControlValueAccessor
{
  private destroyRef = inject(DestroyRef);

  @ContentChild(SelectListItemTemplate, { static: false })
  itemTplRef: SelectListItemTemplate<T>;

  @ViewChild('dropdown', { static: true })
  dropdown: NgbDropdown;

  valueControl = this.formBuilder.control<any>(null);
  textControl = this.formBuilder.control<string>(null);
  searchTextControl = this.formBuilder.control<string>(null);

  private _selectedValuesMap = new Map<any, { item: any; index: number }>();
  private _selectedValuesMapTemp: Map<any, { item: any; index: number }>;

  get hasValue() {
    return this._selectedValuesMap.size > 0;
  }

  @Input()
  set value(v: any) {
    if (!ObjectUtils.equals(this.value, v)) {
      this._handleValueSelected(v);
    }
  }

  get value() {
    return this.valueControl.getRawValue();
  }

  @Output()
  valueChange = new EventEmitter<any>();

  private _multiple = false;
  @Input()
  set multiple(value) {
    value = !!value;
    if (this._multiple !== value) {
      this._multiple = value;
      if (value && hasValue(this.value) && !Array.isArray(this.value)) {
        this.value = [this.value];
      } else if (!value && hasValue(this.value) && Array.isArray(this.value)) {
        this.value = this.value[0];
      }
    }
  }

  get multiple() {
    return this._multiple;
  }

  @Input()
  showSelectControls = false;
  @Input()
  applyButtonEnabled = false;

  private _text: string = null;

  @Output()
  onItemClick = new EventEmitter<T>();

  @Output()
  onDropdownOpened = new EventEmitter<void>();
  @Output()
  onDropdownClosed = new EventEmitter<void>();

  dataItems: T[] = [];
  _handledDataItems: T[] = [];
  private _dataSubject = new BehaviorSubject<CustomDataSource<T>>(null);

  private _dataSource: DataSourceLike<T>;
  private _dataSourceInstance: CustomDataSource<T>;
  private _shouldDisposeDataSource = false;

  @Input()
  set dataSource(value) {
    if (this._dataSource !== value) {
      if (this._shouldDisposeDataSource) {
        this._dataSourceInstance?.dispose();
      }

      const dataSource = DataSourceUtils.parse(value);
      this._shouldDisposeDataSource = dataSource !== value;

      this._dataSource = value;

      this._dataSourceInstance = dataSource;
      this._syncSearchExprWithDataSource();
      this._dataSubject.next(dataSource);
    }
  }

  get dataSource() {
    return this._dataSource;
  }

  @Input()
  set disabled(v: boolean) {
    v = !!v;
    if (this.disabled !== v) {
      if (v) {
        this.textControl.disable();
      } else {
        this.textControl.enable();
      }
    }
  }

  get disabled() {
    return this.textControl.disabled;
  }

  @Input()
  placeholder: string = '';
  @Input()
  invalid: boolean;

  private _valueExpr: ExtractExpr<T>;
  @Input()
  set valueExpr(value) {
    if (this._valueExpr !== value) {
      this._valueExpr = value;

      this._trackBy = ItemExprUtils.trackByFunction(this._valueExpr);
    }
  }

  get valueExpr() {
    return this._valueExpr;
  }

  private _textExpr: ExtractExpr<T>;
  @Input()
  get textExpr() {
    return this._textExpr;
  }

  set textExpr(value) {
    if (this._textExpr !== value) {
      this._textExpr = value;
      this._syncSearchExprWithDataSource();
    }
  }

  private _selectedTextExprFn: (items: T[]) => string;
  @Input()
  get selectedTextExprFn() {
    return this._selectedTextExprFn;
  }

  set selectedTextExprFn(value) {
    if (this._selectedTextExprFn !== value) {
      this._selectedTextExprFn = value;
      this._updateSelectedText();
    }
  }

  private _displayExpr: ExtractExpr<T>;
  @Input()
  get displayExpr() {
    return this._displayExpr;
  }

  set displayExpr(value) {
    if (this._displayExpr !== value) {
      this._displayExpr = value;
      this._syncSearchExprWithDataSource();
    }
  }

  private _searchTextLocked = false;
  @Input()
  searchModeEnabled: boolean;
  @Input()
  searchMinLength = 1;
  @Input()
  searchMode: 'default' | 'dropdown' = 'default';

  get isSearchInDropdown() {
    return this.searchMode === 'dropdown';
  }

  private _searchExpr: ExtractExpr<T>;
  @Input()
  get searchExpr() {
    return this._searchExpr;
  }

  set searchExpr(value) {
    if (this._searchExpr !== value) {
      this._searchExpr = value;
      this._syncSearchExprWithDataSource();
    }
  }

  private _searchTextSubject = new BehaviorSubject<string>(null);

  get loadingChanges() {
    return this._dataSourceInstance?.loadingChanges;
  }

  private _refreshListSubject = new Subject<void>();

  private _loadMoreSubject = new Subject<void>();

  constructor(private formBuilder: FormBuilder) {}

  ngOnInit() {
    let _valueLocked = false;

    merge(
      this.textControl.valueChanges.pipe(
        filter(() => !this.isSearchInDropdown)
      ),
      this.searchTextControl.valueChanges.pipe(
        filter(() => this.isSearchInDropdown)
      )
    )
      .pipe(
        filter(() => this.searchModeEnabled && !this._searchTextLocked),
        map((text) => (text?.length < this.searchMinLength ? null : text)),
        mergeWith(this._searchTextSubject),
        debounceTime(400),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((text) => {
        this._searchTextSubject.next(text);
      });

    merge(
      this.dropdown.openChange,
      this.valueControl.valueChanges.pipe(
        startWith(this.valueControl.getRawValue()),
        map((value) => value !== null && value !== undefined)
      )
    )
      .pipe(
        first((x) => !!x),
        mergeMap(() => {
          return combineLatest([
            this._dataSubject,
            this._refreshListSubject.pipe(
              tap(() => {
                if (this._dataSourceInstance instanceof CustomRawDataSource) {
                  this._dataSourceInstance.clearRawData();
                }
              }),
              startWith(null)
            ),
          ]).pipe(
            debounceTime(0, asapScheduler),
            switchMap(([dataSource]) => {
              this.dataItems = [];
              this._handledDataItems = [];

              if (!dataSource) {
                return EMPTY;
              }

              const loadMoreObservable = this._loadMoreSubject.pipe(
                tap(() => {
                  if (dataSource.isLoading()) {
                    return;
                  }

                  const oldPageIndex = dataSource.pageIndex;
                  dataSource.pageIndex = this.dataItems.length;

                  if (
                    oldPageIndex === dataSource.pageIndex ||
                    dataSource.totalCount <= dataSource.pageIndex
                  ) {
                    return;
                  }
                  dataSource.load();
                })
              );

              const textObservable = this._searchTextSubject.pipe(
                distinctUntilChanged(),
                tap((text) => {
                  _valueLocked = true;

                  dataSource.searchText = text;
                  dataSource.pageIndex = 0;
                  dataSource.reload();
                })
              );

              let reloading = false;
              const reloadObservable = dataSource.onReload.pipe(
                tap(() => {
                  reloading = true;
                })
              );

              const dataObservable = dataSource.toObservable().pipe(
                tap((items) => {
                  if (reloading) {
                    reloading = false;
                    this.dataItems = [];
                  }

                  this.addListItems(items);

                  if (!_valueLocked) {
                    this._handleValueSelected(this.value);
                  }

                  _valueLocked = false;
                })
              );

              return merge(
                textObservable,
                loadMoreObservable,
                reloadObservable,
                dataObservable
              );
            })
          );
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe();
  }

  public refreshList() {
    this._refreshListSubject.next();
  }

  onChange = (_: any) => {};
  onTouched = () => {};

  writeValue(value: any): void {
    const shouldEmit = this.value !== value;

    this.value = value;

    if (shouldEmit) {
      this.valueChange.emit(value);
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

  _onInputFocus() {
    this.onTouched?.();
    this.dropdown.open();
  }

  _onDropdownOpenChanged(opened: boolean) {
    if (!opened) {
      this._selectedValuesMapTemp = null;

      this._searchTextLocked = true;
      if (this._text) {
        this.textControl.patchValue(this._text);
        this._searchTextSubject.next(null);
      } else if (this._searchTextSubject.getValue()) {
        this._text = null;
        this.textControl.patchValue(this._text);
        this._searchTextSubject.next(null);
      }

      this._searchTextLocked = false;
    }

    if (opened) {
      this.onDropdownOpened.emit();
    } else {
      this.onDropdownClosed.emit();
    }
  }

  _onBtnClearClick() {
    this._selectedValuesMapTemp = new Map();
    this._updateSelectedValues();
    this.dropdown.close();
  }

  _onBtnAppyClick() {
    this._updateSelectedValues();
    this.dropdown.close();
  }

  _onItemClickInternal(item: T, index: number) {
    let value = this.extractValue(item, index);

    let valueMapTemp = this._selectedValuesMapTemp;
    if (!valueMapTemp) {
      this._selectedValuesMapTemp = new Map(this._selectedValuesMap);
      valueMapTemp = this._selectedValuesMapTemp;
    }

    let hasValueAux = valueMapTemp.has(value);

    let shouldUpdate = false;
    if (!hasValueAux && !this.multiple) {
      shouldUpdate = true;
      valueMapTemp.clear();
      valueMapTemp.set(value, { item, index });
    } else if (!hasValueAux && this.multiple) {
      shouldUpdate = true;
      valueMapTemp.set(value, { item, index });
    } else if (hasValueAux && this.multiple) {
      shouldUpdate = true;
      valueMapTemp.delete(value);
    }

    if (!shouldUpdate) {
      return;
    }

    if (!this.applyButtonEnabled) {
      this._updateSelectedValues();
    }

    this.onItemClick.emit(item);
  }

  extractValue(item: T, index: number) {
    return ItemExprUtils.extractValue(item, index, this.valueExpr);
  }

  extractDisplayText(item: T, index: number) {
    return ItemExprUtils.extractValue(
      item,
      index,
      this.displayExpr ?? this.textExpr
    );
  }

  extractSelectedText(item: T, index: number) {
    return ItemExprUtils.extractValue(
      item,
      index,
      this.textExpr ?? this.displayExpr
    );
  }

  isSelected(item: T, index: number) {
    const value = this.extractValue(item, index);
    return this._selectedValuesMapTemp
      ? this._selectedValuesMapTemp.has(value)
      : this._selectedValuesMap.has(value);
  }

  loadMoreItems() {
    this._loadMoreSubject.next();
  }

  _trackBy: TrackByFunction<T> = trackByDefault;

  private _syncSearchExprWithDataSource() {
    if (this._dataSourceInstance instanceof CustomRawDataSource) {
      this._dataSourceInstance.searchExpr =
        this.searchExpr ?? this.displayExpr ?? this.textExpr;
    }
  }

  private _handleValueSelected(value: any) {
    try {
      this._searchTextLocked = true;

      let valueArray =
        this.multiple && Array.isArray(value)
          ? value
          : hasValue(value)
          ? [value]
          : [];

      this._selectedValuesMap.clear();

      let item: T;
      let auxValue: any;

      for (let valueItem of valueArray) {
        for (let i = 0; i < this.dataItems.length; ++i) {
          item = this.dataItems[i];
          auxValue = this.extractValue(item, i);
          if (valueItem === auxValue) {
            this._selectedValuesMap.set(valueItem, { item, index: i });
            break;
          }
        }
      }

      this.valueControl.patchValue(
        this.multiple ? Array.from(this._selectedValuesMap.keys()) : value
      );

      this._updateSelectedText(false);
    } finally {
      this._searchTextLocked = false;
    }
  }

  private _getSelectedText() {
    if (this._selectedTextExprFn) {
      const items = Array.from(this._selectedValuesMap.values(), (x) => x.item);
      return this._selectedTextExprFn(items);
    }

    return Array.from(this._selectedValuesMap.values(), (x) => {
      const text = this.extractSelectedText(x?.item, x?.index);
      return text;
    }).join(', ');
  }

  private _updateSelectedValues() {
    if (!this._selectedValuesMapTemp) {
      return;
    }

    const valuesMap = new Map(this._selectedValuesMap);

    let hasUpdated = false;
    for (let [key, x] of this._selectedValuesMapTemp) {
      if (!valuesMap.has(key)) {
        valuesMap.set(key, x);
        hasUpdated = true;
      }
    }

    for (let key of this._selectedValuesMap.keys()) {
      if (!this._selectedValuesMapTemp.has(key)) {
        valuesMap.delete(key);
        hasUpdated = true;
      }
    }

    this._selectedValuesMapTemp = null;

    if (!hasUpdated) {
      return;
    }

    this._selectedValuesMap = valuesMap;
    let value = Array.from(this._selectedValuesMap.keys());

    if (!this.multiple) {
      value = value[0] ?? null;
    }

    this._searchTextLocked = true;
    this._updateSelectedText(false);
    this.valueControl.patchValue(value);
    this.searchTextControl.reset(null);
    this._searchTextSubject.next(null);
    this._searchTextLocked = false;
    this.valueChange.emit(value);
    this.onChange?.(value);
  }

  private _updateSelectedText(shouldSearchLock = true) {
    if (shouldSearchLock) {
      this._searchTextLocked = true;
    }

    const text = this._getSelectedText();
    this._text = text;
    this.textControl.patchValue(text);

    if (shouldSearchLock) {
      this._searchTextLocked = false;
    }
  }

  private addListItems(list: T[]) {
    ArrayUtils.addOrUpdateRange(this.dataItems, list, this.valueExpr);
    this._handledDataItems = this.dataItems;
  }
}
