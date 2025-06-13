import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { ModalTemplateComponent } from '../modal-template/modal-template.component';

@Component({
  selector: 'app-confirms-dialog',
  templateUrl: 'confirms-dialog.component.html',
  standalone: true,
  imports: [CommonModule, TranslateModule, ModalTemplateComponent],
})
export class ConfirmsDialogComponent {
  @Input()
  modalTitle: string = '';
  @Input()
  message: string;

  constructor(public activeModal: NgbActiveModal) {}

  onBtnPositiveClick() {
    this.activeModal.close();
  }

  onBtnNegativeClick() {
    this.activeModal.dismiss();
  }
}
