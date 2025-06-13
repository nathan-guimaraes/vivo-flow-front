import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  TemplateRef,
  Type,
} from '@angular/core';
import { NgbModal, NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { DealingReasonRegisterOffcanvasComponent } from 'src/app/shared/components/dealing-reason-register-offcanvas/dealing-reason-register-offcanvas.component';
import { DealingSubreasonRegisterOffcanvasComponent } from 'src/app/shared/components/dealing-subreason-register-offcanvas/dealing-subreason-register-offcanvas.component';
import { DealingSubreason2RegisterOffcanvasComponent } from 'src/app/shared/components/dealing-subreason2-register-offcanvas/dealing-subreason2-register-offcanvas.component';
import { IslandRegisterOffcanvasComponent } from 'src/app/shared/components/island-register-offcanvas/island-register-offcanvas.component';
import { LegacyRegisterOffcanvasComponent } from 'src/app/shared/components/legacy-register-offcanvas/legacy-register-offcanvas.component';
import { NegotiationTypeRegisterOffcanvasComponent } from 'src/app/shared/components/negotiation-type-register-offcanvas/negotiation-type-register-offcanvas.component';
import { ProductRegisterOffcanvasComponent } from 'src/app/shared/components/product-register-offcanvas/product-register-offcanvas.component';
import { ProtocolActionRegisterOffcanvasComponent } from 'src/app/shared/components/protocol-action-register-offcanvas/protocol-action-register-offcanvas.component';
import { SegmentRegisterOffcanvasComponent } from 'src/app/shared/components/segment-register-offcanvas/segment-register-offcanvas.component';
import { SubislandRegisterOffcanvasComponent } from 'src/app/shared/components/subisland-register-offcanvas/subisland-register-offcanvas.component';
import { SubjectRegisterOffcanvasComponent } from 'src/app/shared/components/subject-register-offcanvas/subject-register-offcanvas.component';
import { SupplierRegisterOffcanvasComponent } from 'src/app/shared/components/supplier-register-offcanvas/supplier-register-offcanvas.component';
import { TowerRegisterOffcanvasComponent } from 'src/app/shared/components/tower-register-offcanvas/tower-register-offcanvas.component';
import { WorkloadRegisterOffcanvasComponent } from 'src/app/shared/components/workload-register-offcanvas/workload-register-offcanvas.component';
import { WorkscaleRegisterOffcanvasComponent } from 'src/app/shared/components/workscale-register-offcanvas/workscale-register-offcanvas.component';

interface ParameterBoxCfg {
  title: string;
  offcanvasTpl?: TemplateRef<any> | Type<any>;
}

@Component({
  selector: 'app-parameters-admin-page',
  templateUrl: 'parameters-admin.page.html',
  styleUrls: ['parameters-admin.page.scss'],
})
export class ParametersAdminPageComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  parameterBoxCfgList: ParameterBoxCfg[];

  constructor(
    private modalService: NgbModal,
    private offcanvasService: NgbOffcanvas
  ) {}

  ngOnInit(): void {
    this.parameterBoxCfgList = [
      {
        title: 'parameters-admin.items.tower',
        offcanvasTpl: TowerRegisterOffcanvasComponent,
      },
      {
        title: 'parameters-admin.items.island',
        offcanvasTpl: IslandRegisterOffcanvasComponent,
      },
      {
        title: 'parameters-admin.items.subisland',
        offcanvasTpl: SubislandRegisterOffcanvasComponent,
      },
      {
        title: 'parameters-admin.items.subject',
        offcanvasTpl: SubjectRegisterOffcanvasComponent,
      },
      {
        title: 'parameters-admin.items.legacy',
        offcanvasTpl: LegacyRegisterOffcanvasComponent,
      },
      {
        title: 'parameters-admin.items.segment',
        offcanvasTpl: SegmentRegisterOffcanvasComponent,
      },
      {
        title: 'parameters-admin.items.negotiationType',
        offcanvasTpl: NegotiationTypeRegisterOffcanvasComponent,
      },
      {
        title: 'parameters-admin.items.product',
        offcanvasTpl: ProductRegisterOffcanvasComponent,
      },
      {
        title: 'parameters-admin.items.supplier',
        offcanvasTpl: SupplierRegisterOffcanvasComponent,
      },
      {
        title: 'parameters-admin.items.workscale',
        offcanvasTpl: WorkscaleRegisterOffcanvasComponent,
      },
      {
        title: 'parameters-admin.items.workload',
        offcanvasTpl: WorkloadRegisterOffcanvasComponent,
      },
      {
        title: 'parameters-admin.items.dealing-reason',
        offcanvasTpl: DealingReasonRegisterOffcanvasComponent,
      },
      {
        title: 'parameters-admin.items.dealing-subreason',
        offcanvasTpl: DealingSubreasonRegisterOffcanvasComponent,
      },
      {
        title: 'parameters-admin.items.dealing-subreason2',
        offcanvasTpl: DealingSubreason2RegisterOffcanvasComponent,
      },
      {
        title: 'parameters-admin.items.protocol-action',
        offcanvasTpl: ProtocolActionRegisterOffcanvasComponent,
      },
    ];
  }

  ngAfterViewInit(): void {}

  ngOnDestroy(): void {}

  onBtnBoxClick(cfg: ParameterBoxCfg) {
    if (!cfg?.offcanvasTpl || this.offcanvasService.hasOpenOffcanvas()) {
      return;
    }

    this.offcanvasService.open(cfg.offcanvasTpl, {
      panelClass: 'offcanvas-md',
    });
  }
}
