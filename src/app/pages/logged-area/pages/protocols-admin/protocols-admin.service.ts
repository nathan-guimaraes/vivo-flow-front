import { Inject, Injectable, OnDestroy } from '@angular/core';
import { IRxStorage } from '@rxjs-storage/core/dist/types/internal/interfaces';
import {
  BehaviorSubject,
  Observable,
  map,
  merge,
  mergeMap,
  shareReplay,
} from 'rxjs';
import { APP_STORAGE } from 'src/app/shared/constants/app.constant';
import { ProtocolFilterLike } from 'src/app/shared/models/dtos/protocol-filter.dto';

export enum TableColumnType {
  Date,
}

export type ColumnInfo = {
  name: string;
  label?: string;
  width?: string;
  dataType?: TableColumnType;
  template?: any;
};

const columnInfoList: ColumnInfo[] = [
  {
    name: 'indicatorSla',
    label: 'protocols-admin.table.headers.sla',
    width: 'auto',
    template: 'cellIindicatorSlaTpl',
  },
  {
    name: 'id',
    label: 'protocols-admin.table.headers.id',
    width: '90px',
  },
  {
    name: 'number',
    label: 'protocols-admin.table.headers.number',
    width: '90px',
    template: 'cellNumberTpl',
  },
  {
    name: 'customer',
    label: 'protocols-admin.table.headers.customerName',
    width: '190px',
  },
  {
    name: 'document',
    label: 'protocols-admin.table.headers.document',
    width: '150px',
  },
  {
    name: 'codeGroup',
    label: 'protocols-admin.table.headers.codeGroup',
    width: '100px',
  },
  {
    name: 'customerCode',
    label: 'protocols-admin.table.headers.customerCode',
    width: '100px',
  },
  {
    name: 'tower',
    label: 'protocols-admin.table.headers.tower',
    width: '130px',
  },
  {
    name: 'island',
    label: 'protocols-admin.table.headers.island',
    width: '120px',
  },
  {
    name: 'subisland',
    label: 'protocols-admin.table.headers.subisland',
    width: '120px',
  },
  {
    name: 'subject',
    label: 'protocols-admin.table.headers.subject',
    width: '150px',
  },
  {
    name: 'segment',
    label: 'protocols-admin.table.headers.segment',
    width: '120px',
  },
  {
    name: 'partnerCode',
    label: 'protocols-admin.table.headers.partner',
  },
  {
    name: 'negotiationType',
    label: 'protocols-admin.table.headers.negotiationType',
  },
  {
    name: 'product',
    label: 'protocols-admin.table.headers.product',
  },
  {
    name: 'status',
    label: 'protocols-admin.table.headers.status',
    template: 'cellStatusTpl',
  },
  {
    name: 'queueTimeSpend',
    label: 'protocols-admin.table.headers.queueTime',
  },
  {
    name: 'treatmentTimeSpend',
    label: 'protocols-admin.table.headers.dealingsTime',
  },
  {
    name: 'user',
    label: 'protocols-admin.table.headers.user',
  },
  {
    name: 'supplier',
    label: 'protocols-admin.table.headers.supplier',
  },
];

const defaultDisplayedColumnInfoList: ColumnInfo[] = [
  'number',
  'indicatorSla',
  'customer',
  'document',
  'tower',
  'island',
  'subisland',
  'subject',
  'segment',
  'codeGroup',
  'customerCode',
].map((name) => {
  return columnInfoList.find((x) => x.name === name);
});

const protocolsAdminColumnsKey = 'protocols-admin.columns';

@Injectable()
export class ProtocolsAdminService implements OnDestroy {
  private _columnSelectedListObservable: Observable<string[]>;
  private _columnInfoListObservable: Observable<ColumnInfo[]>;

  constructor(@Inject(APP_STORAGE) private storage: IRxStorage) {}

  ngOnDestroy(): void {
    this._columnSelectedListObservable = null;
    this._columnInfoListObservable = null;
  }

  setColumnsSelected(columns: string[]) {
    this.storage.setItem(protocolsAdminColumnsKey, columns ?? []);
  }

  getColumnsSelected() {
    return this.storage.getItem<string[]>(protocolsAdminColumnsKey) || [];
  }

  getColumnInfos() {
    return columnInfoList;
  }

  observeColumnSelectedList() {
    if (!this._columnSelectedListObservable) {
      const observable = new Observable<string[]>((subscriber) => {
        const list = this.getColumnsSelected();

        subscriber.next(list);
        subscriber.complete();
      });

      this._columnSelectedListObservable = merge(
        merge(
          this.storage.onItemChanged(protocolsAdminColumnsKey),
          this.storage.onItemRemoved(protocolsAdminColumnsKey)
        ).pipe(mergeMap(() => observable)),
        observable
      ).pipe(
        shareReplay({
          refCount: true,
          bufferSize: 1,
        })
      );
    }

    return this._columnSelectedListObservable;
  }

  observeColumnInfoList() {
    if (!this._columnInfoListObservable) {
      this._columnInfoListObservable = this.observeColumnSelectedList().pipe(
        map((columns) => {
          if (!columns?.length) {
            return defaultDisplayedColumnInfoList;
          }

          return this._parseColumnsToInfo(columns);
        }),
        shareReplay({
          refCount: true,
          bufferSize: 1,
        })
      );
    }

    return this._columnInfoListObservable;
  }

  private _parseColumnsToInfo(columns: string[]): ColumnInfo[] {
    return columns.map<ColumnInfo>((column) => {
      let info = columnInfoList.find((x) => x.name === column);
      if (!info) {
        info = {
          name: column,
        };
      }

      return info;
    });
  }
}
