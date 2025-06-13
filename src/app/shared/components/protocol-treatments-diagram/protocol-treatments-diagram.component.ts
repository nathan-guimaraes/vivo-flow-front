import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { StepItemLike, StepperComponent } from '../stepper/stepper.component';
import { Subscription, finalize } from 'rxjs';
import { ProtocolsService } from '../../services/protocols.service';
import { TreatmentService } from '../../services/treatment.service';
import { LoadingController } from '../../helpers/loading.controller';
import { LoadingIndicatorComponent } from '../loading-indicator/loading-indicator.component';
import { TreatmentDiagramItemModelLike } from '../../models/treatment-diagram.model';
import { TreatmentStepStatus } from '../../models/treatment-step.model';
import { TimeSpan } from '../../helpers/time-span/time-span';
import { NgScrollbarModule } from 'ngx-scrollbar';

@Component({
  selector: 'app-protocol-treatments-diagram',
  templateUrl: 'protocol-treatments-diagram.component.html',
  styleUrls: ['protocol-treatments-diagram.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    NgScrollbarModule,
    StepperComponent,
    LoadingIndicatorComponent,
  ],
})
export class ProtocolTreatmentsDiagramComponent
  implements OnChanges, OnDestroy
{
  @Input({ required: true })
  protocolId: number;

  @ViewChild('textTemplate', { static: true })
  textTemplateRef: TemplateRef<any>;

  loadingController = new LoadingController();

  stepList: StepItemLike[] = [];

  private subscription: Subscription;

  constructor(private treatmentService: TreatmentService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.protocolId) {
      this.reloadData();
    }
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  private reloadData() {
    this.subscription?.unsubscribe();

    if (!this.protocolId) {
      this.stepList = [];
      return;
    }

    this.loadingController.show();
    this.subscription = this.treatmentService
      .getDiagramData(this.protocolId)
      .pipe(
        finalize(() => {
          this.loadingController.hide();
        })
      )
      .subscribe({
        next: (list) => {
          const dtNow = new Date();
          this.stepList = list.map<StepItemLike>((x, index) => {
            const queueTimeSpend = TimeSpan.parse(
              (x.endedAt ?? dtNow).getTime() - x.startedAt.getTime()
            );

            return {
              key: index,
              icon: 'check-circle-fill',
              iconColor: this.isCurrent(x)
                ? 'var(--bs-warning)'
                : 'var(--bs-success)',
              text: x.subisland,
              data: {
                queueTimeSpend,
              },
              textTemplate: this.textTemplateRef,
            };
          });
        },
        error: (response) => {
          if (!response) {
            return;
          }
        },
      });
  }

  private isCurrent(item: TreatmentDiagramItemModelLike) {
    return !item.endedAt;
  }
}
