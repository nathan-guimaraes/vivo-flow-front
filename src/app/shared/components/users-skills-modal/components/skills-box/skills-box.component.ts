import { CommonModule } from '@angular/common';
import {
  Component,
  DestroyRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  inject,
} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { IconicModule } from '../../../iconic/iconic.module';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import {
  ExtractExpr,
  ItemExprUtils,
} from 'src/app/shared/utils/item-expr.utils';
import { HoverClassDirective } from 'src/app/shared/directives/hover-class/hover-class.directive';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { CheckboxComponent } from '../../../checkbox/checkbox.component';
import { DropdownSelectItemsComponent } from '../../../dropdown-select-items/dropdown-select-items.component';
import { asapScheduler, timer } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ArrayUtils } from 'src/app/shared/utils/array.utils';
import { DataSourceLike } from 'src/app/shared/helpers/datasources/types';

interface GroupLike {
  key: any;
  data?: any;
  items: any[];
}

@Component({
  selector: 'app-skills-box',
  templateUrl: 'skills-box.component.html',
  styleUrls: ['skills-box.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    NgbTooltipModule,
    NgScrollbarModule,
    CheckboxComponent,
    IconicModule,
    HoverClassDirective,
    DropdownSelectItemsComponent,
  ],
})
export class SkillsBoxComponent implements OnInit, OnDestroy {
  private destroyRef = inject(DestroyRef);

  private initialized = false;

  @Input()
  title: string;

  private _items: any[];
  @Input()
  set items(value) {
    if (this._items !== value) {
      this._items = value;
      this._handleItems();
    }
  }

  get items() {
    return this._items;
  }

  @Output()
  readonly itemsChange = new EventEmitter<any[]>();

  @Input()
  selectedItemKeys: any[] = [];
  @Output()
  readonly selectedItemKeysChange = new EventEmitter<any[]>();

  @Input()
  principalItemKey: any;
  @Output()
  readonly principalItemKeyChange = new EventEmitter<any>();

  @Input()
  dropdownSelectedItems: any[] = [];
  @Input()
  dataSource: DataSourceLike<any>;

  @Input()
  principalMode = false;

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

  @Input()
  disabled = false;

  @Input()
  keyExpr: ExtractExpr<any>;
  @Input()
  displayExpr: ExtractExpr<any>;

  get isBtnDeleteDisabled() {
    return !!(!this.selectedItemKeys?.length || this.disabled);
  }

  _handledItems: GroupLike[];

  ngOnInit(): void {
    this.initialized = true;
    this._handleItems();
  }

  ngOnDestroy(): void {
    this._trackBy = null;
  }

  _onBtnDeleteClick() {
    if (!this.isBtnDeleteDisabled) {
      let auxItems = this.items?.slice() ?? [];

      for (let key of this.selectedItemKeys) {
        const i = this.items.findIndex((item) => {
          const auxKey = this._extractKey(item);
          return auxKey === key;
        });
        if (i > -1) {
          auxItems.splice(i, 1);
        }
      }

      this.items = auxItems;

      if (this.principalItemKey) {
        const i = auxItems.findIndex((item) => {
          const auxKey = this._extractKey(item);
          return auxKey === this.principalItemKey;
        });

        if (!(i > -1)) {
          this.principalItemKey = null;
          this.principalItemKeyChange.emit(this.principalItemKey);
        }
      }

      this.itemsChange.emit(this.items);

      this.selectedItemKeys = [];
      this.selectedItemKeysChange.emit(this.selectedItemKeys);
    }
  }

  _onItemsSelected(items: any[]) {
    let auxItems = this.items?.slice() ?? [];

    for (let item of items) {
      if (!this._isAdded(item)) {
        auxItems.push(item);
      }
    }

    this.items = auxItems;
    this.itemsChange.emit(this.items);

    timer(0, asapScheduler)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.dropdownSelectedItems = [];
      });
  }

  _extractKey(item: any) {
    return ItemExprUtils.extractValue(item, null, this.keyExpr);
  }

  _extractText(item: any, index: number) {
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

  _onItemSelectChanged(item: any) {
    if (!this.selectedItemKeys) {
      this.selectedItemKeys = [];
    }

    const key = this._extractKey(item);
    if (this._isSelected(item)) {
      const i = this.selectedItemKeys.indexOf(key);
      this.selectedItemKeys.splice(i, 1);
    } else {
      this.selectedItemKeys.push(key);
    }

    this.selectedItemKeysChange.emit(this.selectedItemKeys);
  }

  _onItemPrincipalClick(item: any) {
    const key = this._extractKey(item);
    if (this._isPrincipalByKey(key)) {
      this.principalItemKey = null;
    } else {
      this.principalItemKey = key;
    }

    this.principalItemKeyChange.emit(this.principalItemKey);
  }

  _isSelected(item: any) {
    const key = this._extractKey(item);
    return this._isSelectedByKey(key);
  }

  _isSelectedByKey(key: any) {
    return !!this.selectedItemKeys?.includes(key);
  }

  _isAdded(item: any) {
    const key = this._extractKey(item);
    return this._isAddedByKey(key);
  }

  _isAddedByKey(key: any) {
    return !!this.items?.some((item) => {
      const auxKey = this._extractKey(item);
      return key === auxKey;
    });
  }

  _isPrincipal(item: any) {
    const key = this._extractKey(item);
    return this._isPrincipalByKey(key);
  }

  _isPrincipalByKey(key: any) {
    return this.principalItemKey === key;
  }

  _trackBy = ItemExprUtils.trackByFunction<any>((x) => {
    return this._extractKey(x);
  });
  _groupTrackBy = ItemExprUtils.trackByFunction<GroupLike>((x) => x?.key);

  private _handleItems() {
    if (!this.initialized) {
      return;
    }

    if (!this.groupMode) {
      this._handledItems = !this.items?.length
        ? []
        : [
            {
              key: null,
              items: this.items,
            },
          ];
      return;
    }

    this._handledItems = [];

    const groupsMap = ArrayUtils.groupBy(this.items, this.parentKeyExpr);
    if (groupsMap?.size) {
      for (let [key, items] of groupsMap) {
        const group = this.groupItems?.find((x) => {
          const auxKey = this._extractGroupKey(x);
          return auxKey === key;
        });

        this._handledItems.push({
          key,
          data: group,
          items,
        });
      }
    }
  }
}
