import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Inject,
  Input,
  OnDestroy,
  OnInit,
  Optional,
  ViewEncapsulation,
} from '@angular/core';
import {
  SortHeaderArrowPosition,
  TABLE_SORT_DEFAULT_OPTIONS,
  TableSortDefaultOptions,
  TableSortDirective,
  TableSortable,
} from './table-sort.directive';
import { Subscription, merge } from 'rxjs';

import { ENTER, SPACE } from '@angular/cdk/keycodes';
import { FocusMonitor } from '@angular/cdk/a11y';
import { CdkColumnDef } from '@angular/cdk/table';
import { SortDirection } from '../../helpers/datasources/custom-datasource';

@Component({
  selector: '[tableSortHeader]',
  exportAs: 'tableSortHeader',
  templateUrl: 'table-sort-header.component.html',
  styleUrls: ['table-sort-header.component.scss'],
  host: {
    class: 'table-sort-header',
    '[class.table-sort-ascending]': '_isSorted() && !_isDescMode()',
    '[class.table-sort-descending]': '_isSorted() && _isDescMode()',
    '(click)': '_handleClick()',
    '(keydown)': '_handleKeydown($event)',
    '(mouseenter)': '_setIndicatorHintVisible(true)',
    '(mouseleave)': '_setIndicatorHintVisible(false)',
    '[class.table-sort-header-disabled]': '_isDisabled()',
  },
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  inputs: ['disabled'],
})
export class TableSortHeaderComponent
  implements OnInit, AfterViewInit, OnDestroy, TableSortable
{
  private _rerenderSubscription: Subscription;

  _showIndicatorHint: boolean = false;

  _arrowDirection: SortDirection = '';

  @Input('table-sort-header')
  id: string;

  @Input()
  arrowPosition: SortHeaderArrowPosition = 'after';

  @Input()
  start: SortDirection;

  @Input()
  disableClear: boolean;

  private _disabled: boolean = false;

  get disabled(): boolean {
    return this._disabled;
  }
  set disabled(value) {
    this._disabled = !!value;
  }

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    public _sort: TableSortDirective,
    @Optional()
    public _columnDef: CdkColumnDef,
    private _focusMonitor: FocusMonitor,
    private _elementRef: ElementRef<HTMLElement>,
    @Optional()
    @Inject(TABLE_SORT_DEFAULT_OPTIONS)
    defaultOptions?: TableSortDefaultOptions
  ) {
    if (defaultOptions?.arrowPosition) {
      this.arrowPosition = defaultOptions?.arrowPosition;
    }

    this._handleStateChanges();
  }

  ngOnInit(): void {
    if (!this.id && this._columnDef) {
      this.id = this._columnDef.name;
    }

    this._updateArrowDirection();

    this._sort.register(this);
  }

  ngAfterViewInit() {
    this._focusMonitor.monitor(this._elementRef, true).subscribe((origin) => {
      const newState = !!origin;
      if (newState !== this._showIndicatorHint) {
        this._setIndicatorHintVisible(newState);
        this._changeDetectorRef.markForCheck();
      }
    });
  }

  ngOnDestroy(): void {
    this._focusMonitor.stopMonitoring(this._elementRef);
    this._sort.deregister(this);
    this._rerenderSubscription.unsubscribe();
  }

  _setIndicatorHintVisible(visible: boolean) {
    if (this._isDisabled() && visible) {
      return;
    }

    this._showIndicatorHint = visible;

    if (!this._isSorted()) {
      this._updateArrowDirection();
    }
  }

  _toggleOnInteraction() {
    this._sort.sort(this);
  }

  _handleClick() {
    if (!this._isDisabled()) {
      this._sort.sort(this);
    }
  }

  _handleKeydown(event: KeyboardEvent) {
    if (
      !this._isDisabled() &&
      (event.keyCode === SPACE || event.keyCode === ENTER)
    ) {
      event.preventDefault();
      this._toggleOnInteraction();
    }
  }

  _isDescMode() {
    return this._arrowDirection === 'desc';
  }

  _isSorted() {
    return (
      this._sort.active == this.id &&
      (this._sort.direction === 'asc' || this._sort.direction === 'desc')
    );
  }

  _updateArrowDirection() {
    this._arrowDirection = this._isSorted()
      ? this._sort.direction
      : this.start || this._sort.start;
  }

  _isDisabled() {
    return this._sort.disabled || this.disabled;
  }

  _renderArrow() {
    return !this._isDisabled() || this._isSorted();
  }

  private _handleStateChanges() {
    this._rerenderSubscription = merge(
      this._sort.sortChange,
      this._sort._stateChanges
    ).subscribe(() => {
      if (this._isSorted()) {
        this._updateArrowDirection();
        this._showIndicatorHint = false;
      }

      this._changeDetectorRef.markForCheck();
    });
  }
}
