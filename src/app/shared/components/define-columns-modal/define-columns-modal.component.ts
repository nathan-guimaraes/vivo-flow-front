import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { IconicModule } from '../iconic/iconic.module';
import { CheckboxComponent } from '../checkbox/checkbox.component';
import { TranslateModule } from '@ngx-translate/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalTemplateComponent } from '../modal-template/modal-template.component';

export interface ColumnLike {
  name: string;
  label?: string;
}

@Component({
  selector: 'app-define-columns-modal',
  templateUrl: 'define-columns-modal.component.html',
  styleUrls: ['define-columns-modal.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    ModalTemplateComponent,
    IconicModule,
    CheckboxComponent,
  ],
})
export class DefineColumnsModalComponent {
  @Input()
  title: string;
  @Input()
  subtitle: string;

  @Input()
  items: ColumnLike[];

  private _selectedItemKeys: string[];
  @Input()
  set selectedItemKeys(value) {
    if (this._selectedItemKeys !== value) {
      this._selectedItemKeys = value;

      this._selectedItemKeysOriginal = this.selectedItemKeys?.slice() ?? [];
      this._selectedItemKeysCurrent = this._selectedItemKeysOriginal.slice();
    }
  }

  get selectedItemKeys() {
    return this._selectedItemKeys;
  }

  @Output()
  readonly selectedItemKeysChange = new EventEmitter<string[]>();

  private _selectedItemKeysOriginal = new Array<string>();
  private _selectedItemKeysCurrent = new Array<string>();

  constructor(public activeModal: NgbActiveModal) {}

  onBtnClearClick() {
    this._selectedItemKeysCurrent = [];
    this._handleChanges();
  }

  onBtnSaveClick() {
    this._handleChanges();
  }

  getSelectedPosition(columnName: string) {
    return this._selectedItemKeysCurrent.indexOf(columnName) + 1;
  }

  isSelected(columnName: string) {
    return !!this._selectedItemKeysCurrent.includes(columnName);
  }

  toggleSelect(columnName: string) {
    if (!this.isSelected(columnName)) {
      this._selectedItemKeysCurrent.push(columnName);
    } else {
      const index = this._selectedItemKeysCurrent.indexOf(columnName);
      if (index > -1) {
        this._selectedItemKeysCurrent.splice(index, 1);
      }
    }
  }

  private _handleChanges() {
    let hasChanged = false;
    if (
      this._selectedItemKeysCurrent.length ===
      this._selectedItemKeysOriginal.length
    ) {
      for (let column of this._selectedItemKeysOriginal) {
        if (!this.isSelected(column)) {
          hasChanged = true;
          break;
        }
      }
    } else {
      hasChanged = true;
    }

    const columns = this._selectedItemKeysCurrent.slice();
    if (hasChanged) {
      this.selectedItemKeysChange.emit(columns);
    }

    this.activeModal.close(columns);
  }
}
