import { Component, Input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { IconicModule } from '../iconic/iconic.module';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal-template',
  templateUrl: 'modal-template.component.html',
  styleUrls: ['modal-template.component.scss'],
  standalone: true,
  imports: [CommonModule, TranslateModule, IconicModule],
})
export class ModalTemplateComponent {
  @Input()
  modalTitle: string

  @Input()
  closeBtnEnabled = true;

  constructor(public activeModal: NgbActiveModal) {}
}
