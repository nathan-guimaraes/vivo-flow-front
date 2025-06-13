import {
  Component,
  DestroyRef,
  EventEmitter,
  Input,
  Output,
  inject,
} from '@angular/core';
import { NgbActiveOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { BehaviorSubject } from 'rxjs';
import { IndicatorsFilterDTOLike } from 'src/app/shared/models/dtos/indicators-filter.dto';
import { ObjectUtils } from 'src/app/shared/utils/object.utils';

@Component({
  template: '',
})
export abstract class FormFilterComponent<T extends IndicatorsFilterDTOLike> {
  protected destroyRef = inject(DestroyRef);
  protected offcanvasRef = inject(NgbActiveOffcanvas);

  private _filtersInput: T = null;
  private _filtersInputSubject = new BehaviorSubject<T>(this._filtersInput);
  protected filtersInputObservable = this._filtersInputSubject.asObservable();

  @Input()
  set filters(value) {
    if (this.hasFiltersChanged(value, this.filters)) {
      this._filtersInput = value;
      this._filtersInputSubject.next(value);
    }
  }

  get filters() {
    return this._filtersInput;
  }

  @Output()
  readonly filtersChange = new EventEmitter<T>();

  @Input()
  filterTitle: string;

  protected _emitFilters(filters: T) {
    if (this.hasFiltersChanged(filters, this.filters)) {
      this._filtersInput = filters;
      this.filtersChange.emit(filters);
    }

    this.offcanvasRef.close();
  }

  protected hasFiltersChanged(oldFilters: T, newFilters: T) {
    return !ObjectUtils.equals(oldFilters, newFilters);
  }
}
