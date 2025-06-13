import { Injectable, OnDestroy, Type } from '@angular/core';
import { RxMemoryStorage } from '@rxjs-storage/core';
import { Observable, merge, mergeMap, startWith } from 'rxjs';
import {
  IndicatorsFilterDTO,
  IndicatorsFilterDTOLike,
} from 'src/app/shared/models/dtos/indicators-filter.dto';
import { ObjectUtils } from 'src/app/shared/utils/object.utils';
import { RandomUtils } from 'src/app/shared/utils/random.utils';

const protocolVolumesKey = 'protocol-volumes';
const cutoffDateKey = 'cutoff-date';
const productivityKey = 'productivity';
const treatmentTimeKey = 'treatment-time';
const disapprovalTreatmentsKey = 'disapproval-treatments';

@Injectable()
export class FormFilterManager implements OnDestroy {
  private storage = new RxMemoryStorage(RandomUtils.uniqId());

  ngOnDestroy(): void {
    this.storage.clear();
  }

  setProtocolsVolumesFilter(filter: IndicatorsFilterDTOLike) {
    this._setFilter(protocolVolumesKey, IndicatorsFilterDTO, filter);
  }

  observeProtocolsVolumesFilter() {
    return this._observeFilter(protocolVolumesKey, IndicatorsFilterDTO);
  }

  setCutoffDatesFilter(filter: IndicatorsFilterDTOLike) {
    this._setFilter(cutoffDateKey, IndicatorsFilterDTO, filter);
  }

  observeCutoffDatesFilter() {
    return this._observeFilter(cutoffDateKey, IndicatorsFilterDTO);
  }

  setProductivityFilter(filter: IndicatorsFilterDTOLike) {
    this._setFilter(productivityKey, IndicatorsFilterDTO, filter);
  }

  observeProductivityFilter() {
    return this._observeFilter(productivityKey, IndicatorsFilterDTO);
  }

  setTreatmentTimeFilter(filter: IndicatorsFilterDTOLike) {
    this._setFilter(treatmentTimeKey, IndicatorsFilterDTO, filter);
  }

  observeTreatmentTimeFilter() {
    return this._observeFilter(treatmentTimeKey, IndicatorsFilterDTO);
  }

  setDisapprovalTreatmentsFilter(filter: IndicatorsFilterDTOLike) {
    this._setFilter(disapprovalTreatmentsKey, IndicatorsFilterDTO, filter);
  }

  observeDisapprovalTreatmentsFilter() {
    return this._observeFilter(disapprovalTreatmentsKey, IndicatorsFilterDTO);
  }

  private _setFilter<
    T extends IndicatorsFilterDTO,
    I extends IndicatorsFilterDTOLike
  >(key: string, type: Type<T>, filter: I) {
    const filterAux = new type(filter);

    const oldFilter = new type(this.storage.getItem(key));

    if (!ObjectUtils.equals(filterAux, oldFilter)) {
      this.storage.setItem(key, filterAux);
    }
  }

  private _observeFilter<T extends IndicatorsFilterDTO>(
    key: string,
    type: Type<T>
  ) {
    const observable = new Observable((subscriber) => {
      const aux = this.storage.getItem(key);

      let filter: T;
      if (!aux) {
        filter = null;
      } else {
        filter = new type(aux);
      }

      subscriber.next(filter);
      subscriber.complete();
    });

    return merge(
      this.storage.onItemChanged(key),
      this.storage.onItemRemoved(key)
    ).pipe(
      startWith(null),
      mergeMap(() => observable)
    );
  }
}
