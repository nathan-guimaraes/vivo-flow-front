import {
  Component,
  DestroyRef,
  OnDestroy,
  OnInit,
  inject,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import {
  NgbModal,
  NgbModalOptions,
  NgbOffcanvas,
  NgbOffcanvasOptions,
} from '@ng-bootstrap/ng-bootstrap';
import { of, map, zip } from 'rxjs';
import { CutoffDateRegisterEditModalComponent } from 'src/app/shared/components/cutoff-date-register-modal/cutoff-date-register-modal.component';
import { FlowRegisterOffcanvasComponent } from 'src/app/shared/components/flow-register-offcanvas/flow-register-offcanvas.component';
import { LogsReportDownloadModalComponent } from 'src/app/shared/components/logs-report-download-modal/logs-report-download-modal.component';
import { ProtocolsFieldsOffcanvasComponent } from 'src/app/shared/components/protocols-fields-offcanvas/protocols-fields-offcanvas.component';
import { ProtocolsUploadOffcanvasComponent } from 'src/app/shared/components/protocols-upload-offcanvas/protocols-upload-offcanvas.component';
import { Roles } from 'src/app/shared/constants/auth.constant';
import { AuthService } from 'src/app/shared/services/auth.service';

interface ListItemLike {
  title: string;
  subtitle: string;
  button: string;
  onClick?: () => void;
  role?: any;
}

@Component({
  selector: 'app-system-admin-page',
  templateUrl: 'system-admin.page.html',
  styleUrls: ['system-admin.page.scss'],
})
export class SystemAdminPageComponent implements OnInit, OnDestroy {
  private destroyRef = inject(DestroyRef);

  itemList: ListItemLike[];

  canDownloadLogReport = this.authService.hasPermission(
    Roles.SystemAdmin.Report
  );

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private modal: NgbModal,
    private offcanvas: NgbOffcanvas
  ) {}

  ngOnInit(): void {
    const itemList: ListItemLike[] = [
      {
        title: 'system-admin.items.protocol-fields.title',
        subtitle: 'system-admin.items.protocol-fields.subtitle',
        button: 'system-admin.items.protocol-fields.button',
        onClick: () => {
          this.openOffcanvas(ProtocolsFieldsOffcanvasComponent, {
            panelClass: 'offcanvas-xl',
          });
        },
        role: Roles.SystemAdmin.Fields,
      },
      {
        title: 'system-admin.items.parameters.title',
        subtitle: 'system-admin.items.parameters.subtitle',
        button: 'system-admin.items.parameters.button',
        onClick: () => {
          this.router.navigate(['parameters'], {
            relativeTo: this.route,
          });
        },
        role: Roles.SystemAdmin.Parameters,
      },
      {
        title: 'system-admin.items.sla.title',
        subtitle: 'system-admin.items.sla.subtitle',
        button: 'system-admin.items.sla.button',
        onClick: () => {
          this.router.navigate(['sla'], {
            relativeTo: this.route,
          });
        },
        role: Roles.SystemAdmin.SLA,
      },
      {
        title: 'system-admin.items.productivity.title',
        subtitle: 'system-admin.items.productivity.subtitle',
        button: 'system-admin.items.productivity.button',
        onClick: () => {
          this.router.navigate(['productivity'], {
            relativeTo: this.route,
          });
        },
        role: Roles.SystemAdmin.Productivity,
      },
      {
        title: 'system-admin.items.protocols.title',
        subtitle: 'system-admin.items.protocols.subtitle',
        button: 'system-admin.items.protocols.button',
        onClick: () => {
          this.openOffcanvas(ProtocolsUploadOffcanvasComponent, {
            panelClass: 'offcanvas-lg',
          });
        },
        role: Roles.SystemAdmin.UploadBase,
      },
      {
        title: 'system-admin.items.cutoff-date.title',
        subtitle: 'system-admin.items.cutoff-date.subtitle',
        button: 'system-admin.items.cutoff-date.button',
        onClick: () => {
          this.openModal(CutoffDateRegisterEditModalComponent, {
            size: 'xl',
          });
        },
        role: Roles.SystemAdmin.CutoffDate,
      },
      {
        title: 'system-admin.items.flow.title',
        subtitle: 'system-admin.items.flow.subtitle',
        button: 'system-admin.items.flow.button',
        onClick: () => {
          this.openOffcanvas(FlowRegisterOffcanvasComponent, {
            panelClass: 'offcanvas-md',
          });
        },
        role: Roles.SystemAdmin.Flows,
      },
    ];

    const observables = itemList.map((item) => {
      if (!item.role) {
        return of(item);
      }

      return this.authService.hasPermission(item.role).pipe(
        map((aBool) => {
          if (!aBool) {
            return null;
          }

          return item;
        })
      );
    });
    zip(...observables)
      .pipe(
        map((list) => {
          this.itemList = list.filter((x) => !!x);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this.itemList = null;
  }

  onBtnExportClick() {
    this.openModal(LogsReportDownloadModalComponent, {
      size: 'md',
    });
  }

  private openOffcanvas(
    templateOrComponent: any,
    options?: NgbOffcanvasOptions
  ) {
    if (this.offcanvas.hasOpenOffcanvas()) {
      return;
    }

    this.offcanvas.open(templateOrComponent, options);
  }

  private openModal(templateOrComponent: any, options?: NgbModalOptions) {
    if (this.modal.hasOpenModals()) {
      return;
    }

    this.modal.open(templateOrComponent, options);
  }
}
