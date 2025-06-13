import {
  Directive,
  EventEmitter,
  Inject,
  InjectionToken,
  Input,
  OnChanges,
  OnDestroy,
  Optional,
  Output,
} from '@angular/core';
import { Subject, tap } from 'rxjs';
import {
  CustomDataSource,
  Sort,
  SortDirection,
} from '../../helpers/datasources/custom-datasource';

export type SortHeaderArrowPosition = 'before' | 'after';

export interface TableSortable {
  id: string;
  start: SortDirection;
  disableClear: boolean;
}

export interface TableSortDefaultOptions {
  /** Whether to disable clearing the sorting state. */
  disableClear?: boolean;
  /** Position of the arrow that displays when sorted. */
  arrowPosition?: SortHeaderArrowPosition;
}

/** Injection token to be used to override the default options for `mat-sort`. */
export const TABLE_SORT_DEFAULT_OPTIONS =
  new InjectionToken<TableSortDefaultOptions>('TABLE_SORT_DEFAULT_OPTIONS');

@Directive({
  selector: '[appTableSort]',
  host: {
    class: 'table-sort',
  },
  inputs: ['disabled: tableSortDisabled'],
})
export class TableSortDirective implements OnChanges, OnDestroy {
  private sortables = new Map<string, TableSortable>();

  readonly _stateChanges = new Subject<void>();

  @Input('tableSortActive')
  active: string;

  @Input('tableSortStart')
  start: SortDirection = 'asc';

  @Input('tableSortDirection')
  direction: SortDirection = '';

  @Input('tableSortDisableClear')
  get disableClear(): boolean {
    return this._disableClear;
  }
  set disableClear(v) {
    this._disableClear = !!v;
  }
  private _disableClear: boolean;

  private _disabled: boolean = false;

  get disabled(): boolean {
    return this._disabled;
  }
  set disabled(value) {
    this._disabled = !!value;
  }

  @Output('tableSortChange')
  readonly sortChange = new EventEmitter<Sort>();

  constructor(
    @Optional()
    @Inject(TABLE_SORT_DEFAULT_OPTIONS)
    private _defaultOptions?: TableSortDefaultOptions
  ) {}

  ngOnChanges() {
    this._stateChanges.next();
  }

  ngOnDestroy() {
    this._stateChanges.complete();
  }

  connectToDataSource(dataSource: CustomDataSource<any>) {
    return this.sortChange.pipe(
      tap((sort) => {
        dataSource.sort = sort;
        dataSource.reload();
      })
    );
  }

  register(sortable: TableSortable): void {
    this.sortables.set(sortable.id, sortable);
  }

  deregister(sortable: TableSortable): void {
    this.sortables.delete(sortable.id);
  }

  sort(sortable: TableSortable): void {
    if (this.active != sortable.id) {
      this.active = sortable.id;
      this.direction = sortable.start ? sortable.start : this.start;
    } else {
      this.direction = this.getNextSortDirection(sortable);
    }

    this.sortChange.emit({ selector: this.active, direction: this.direction });
  }

  getNextSortDirection(sortable: TableSortable): SortDirection {
    if (!sortable) {
      return '';
    }

    const disableClear =
      sortable?.disableClear ??
      this.disableClear ??
      !!this._defaultOptions?.disableClear;
    let sortDirectionCycle = getSortDirectionCycle(
      sortable.start || this.start,
      disableClear
    );

    let nextDirectionIndex = sortDirectionCycle.indexOf(this.direction) + 1;
    if (nextDirectionIndex >= sortDirectionCycle.length) {
      nextDirectionIndex = 0;
    }
    return sortDirectionCycle[nextDirectionIndex];
  }
}

function getSortDirectionCycle(
  start: SortDirection,
  disableClear: boolean
): SortDirection[] {
  let sortOrder: SortDirection[] = ['asc', 'desc'];
  if (start == 'desc') {
    sortOrder.reverse();
  }
  if (!disableClear) {
    sortOrder.push('');
  }

  return sortOrder;
}
