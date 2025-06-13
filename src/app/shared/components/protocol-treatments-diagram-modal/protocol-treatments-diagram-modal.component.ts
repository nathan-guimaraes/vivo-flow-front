import { Component, Input } from '@angular/core';
import { ProtocolTreatmentsDiagramComponent } from '../protocol-treatments-diagram/protocol-treatments-diagram.component';
import { ModalTemplateComponent } from '../modal-template/modal-template.component';

@Component({
  selector: 'app-protocol-treatments-diagram-modal',
  templateUrl: 'protocol-treatments-diagram-modal.component.html',
  standalone: true,
  imports: [ModalTemplateComponent, ProtocolTreatmentsDiagramComponent],
})
export class ProtocolTreatmentsDiagramModalComponent {
  @Input({ required: true })
  protocolId: number;
}
