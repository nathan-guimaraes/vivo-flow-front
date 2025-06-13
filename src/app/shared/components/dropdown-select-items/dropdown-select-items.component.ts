import { CommonModule } from '@angular/common';
import {
  Component,
  DestroyRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  TrackByFunction,
  ViewChild,
  inject,
} from '@angular/core';
import { NgbDropdown, NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { CheckboxComponent } from '../checkbox/checkbox.component';
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
import { CustomDataSource } from '../../helpers/datasources/custom-datasource';
import { CustomRawDataSource } from '../../helpers/datasources/custom-raw-datasource';
import { ExtractExpr, ItemExprUtils } from '../../utils/item-expr.utils';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { IconicModule } from '../iconic/iconic.module';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { LoadingIndicatorComponent } from '../loading-indicator/loading-indicator.component';
import { ObjectUtils } from '../../utils/object.utils';
import { DeferRenderingDirective } from '../../directives/defer-rendering/defer-rendering.directive';
import { ArrayUtils } from '../../utils/array.utils';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { DataSourceLike } from '../../helpers/datasources/types';
import { DataSourceUtils } from '../../helpers/datasources/datasource.utils';

const trackByDefault: TrackByFunction<any> = (_, item) => item;

const hasValue = (value) => {
  return value !== null && value !== undefined;
};

interface GroupLike<T> {
  key: any;
  data?: any;
  items: T[];
}

@Component({
  selector: 'app-dropdown-select-items',
  templateUrl: 'dropdown-select-items.component.html',
  styleUrls: ['dropdown-select-items.component.scss'],
  host: {
    '[class.search-mode-dropdown]': '!!(searchModeEnabled)',
    '[class.select-state-hasvalue]': '!!hasValue',
    '[class.select-state-dropdown-opened]': '!!dropdown?.isOpen()',
  },
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    NgbDropdownModule,
    NgScrollbarModule,
    InfiniteScrollModule,
    IconicModule,
    CheckboxComponent,
    LoadingIndicatorComponent,
    DeferRenderingDirective,
  ],
})
export class DropdownSelectItemsComponent<T = any> implements OnInit {
  private destroyRef = inject(DestroyRef);
  private initialized = false;

  @ViewChild('dropdown', { static: true })
  dropdown: NgbDropdown;

  valueControl = this.formBuilder.control<any>(null);
  searchTextControl = this.formBuilder.control<string>(null);

  private _selectedValuesMap = new Map<any, { item: any; index: number }>();
  private _selectedValuesMapTemp: Map<any, { item: any; index: number }>;

  @Output()
  onItemClick = new EventEmitter<T>();

  dataItems: T[] = [];
  _handledDataGroupedItems: GroupLike<T>[] = [];
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
  readonly valueChange = new EventEmitter<any>();

  @Input()
  disabled = false;

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

  private _groupMode: boolean;
  @Input()
  set groupMode(value) {
    if (this._groupMode !== value) {
      this._groupMode = value;
      this._handleItems();
    }
  }

  get groupMode() {
    return this._groupMode;
  }

  private _groupItems: any[];
  @Input()
  set groupItems(value) {
    if (this._groupItems !== value) {
      this._groupItems = value;
      this._handleItems();
    }
  }

  get groupItems() {
    return this._groupItems;
  }

  private _parentKeyExpr: ExtractExpr<any>;
  @Input()
  set parentKeyExpr(value) {
    if (this._parentKeyExpr !== value) {
      this._parentKeyExpr = value;
      this._handleItems();
    }
  }

  get parentKeyExpr() {
    return this._parentKeyExpr;
  }

  private _groupKeyExpr: ExtractExpr<any>;
  @Input()
  set groupKeyExpr(value) {
    if (this._groupKeyExpr !== value) {
      this._groupKeyExpr = value;
      this._handleItems();
    }
  }

  get groupKeyExpr() {
    return this._groupKeyExpr;
  }

  @Input()
  groupDisplayExpr: ExtractExpr<any>;

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

  ngOnInit(): void {
    this.initialized = true;

    this.searchTextControl.valueChanges
      .pipe(
        filter(() => this.searchModeEnabled),
        map((text) => (text?.length < this.searchMinLength ? null : text)),
        mergeWith(this._searchTextSubject),
        debounceTime(400),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((text) => {
        this._searchTextSubject.next(text);
      });

    this.dropdown.openChange
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
              this._handleItems();

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

                  this.addListGrouped(items);
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

  _onBtnClearClick() {
    this.dropdown.close();
    this._selectedValuesMapTemp = new Map();
    this._updateSelectedValues();
  }

  _onBtnAppyClick() {
    this.dropdown.close();
    this._updateSelectedValues();
  }

  _onItemClickInternal(item: T, index: number) {
    let value = this._extractValue(item, index);

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

    this.onItemClick.emit(item);
  }

  _trackBy: TrackByFunction<T> = trackByDefault;
  _groupTrackBy = ItemExprUtils.trackByFunction<GroupLike<T>>((x) => x?.key);

  _extractValue(item: T, index: number) {
    return ItemExprUtils.extractValue(item, index, this.valueExpr);
  }

  _extractDisplayText(item: T, index: number) {
    return ItemExprUtils.extractValue(item, index, this.displayExpr);
  }

  _extractParentKey(item: any) {
    return ItemExprUtils.extractValue(item, null, this.parentKeyExpr);
  }

  _extractGroupKey(item: any) {
    return ItemExprUtils.extractValue(item, null, this.groupKeyExpr);
  }

  _extractGroupText(item: any) {
    return ItemExprUtils.extractValue(item, null, this.groupDisplayExpr);
  }

  _getIndex(item: T) {
    return this.dataItems?.indexOf(item) ?? -1;
  }

  isSelected(item: T, index: number) {
    const value = this._extractValue(item, index);
    return this._selectedValuesMapTemp
      ? this._selectedValuesMapTemp.has(value)
      : this._selectedValuesMap.has(value);
  }

  loadMoreItems() {
    this._loadMoreSubject.next();
  }

  private _syncSearchExprWithDataSource() {
    if (this._dataSourceInstance instanceof CustomRawDataSource) {
      this._dataSourceInstance.searchExpr = this.searchExpr ?? this.displayExpr;
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

      let foundValue = false;

      let item: T;
      let auxValue: any;

      for (let valueItem of valueArray) {
        for (let i = 0; i < this.dataItems.length; ++i) {
          item = this.dataItems[i];
          auxValue = this._extractValue(item, i);
          if (valueItem === auxValue) {
            this._selectedValuesMap.set(valueItem, { item, index: i });
            foundValue = true;
            break;
          }
        }
      }

      if (foundValue) {
        this.valueControl.patchValue(
          this.multiple ? Array.from(this._selectedValuesMap.keys()) : value
        );
        return;
      }

      this._selectedValuesMap.clear();
      this.valueControl.reset(value);
    } finally {
      this._searchTextLocked = false;
    }
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
    this.valueControl.patchValue(value);
    this.searchTextControl.reset(null);
    this._searchTextSubject.next(null);
    this._searchTextLocked = false;
    this.valueChange.emit(value);
  }

  private addListGrouped(list: T[]) {
    const changes = ArrayUtils.addOrUpdateRange(
      this.dataItems,
      list,
      this.valueExpr
    );
    if (
      changes?.adds?.length ||
      changes?.updates?.length ||
      !this.dataItems?.length
    ) {
      this._handleItems();
    }
  }

  private _handleItems() {
    if (!this.initialized) {
      return;
    }

    if (!this.groupMode) {
      this._handledDataGroupedItems = !this.dataItems?.length
        ? []
        : [
            {
              key: null,
              items: this.dataItems,
            },
          ];
      return;
    }

    this._handledDataGroupedItems = [];

    const groupsMap = ArrayUtils.groupBy(
      this.dataItems,
      this.parentKeyExpr as any
    );
    if (groupsMap?.size) {
      for (let [key, items] of groupsMap) {
        const group = this.groupItems?.find((x) => {
          const auxKey = this._extractGroupKey(x);
          return auxKey === key;
        });

        this._handledDataGroupedItems.push({
          key,
          data: group,
          items,
        });
      }
    }
  }
}
