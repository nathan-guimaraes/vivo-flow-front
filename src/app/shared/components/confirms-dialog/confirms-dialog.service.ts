import { Injectable } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable, asapScheduler, from, observeOn } from 'rxjs';
import { ConfirmsDialogComponent } from './confirms-dialog.component';
import { LoadingController } from '../../helpers/loading.controller';

@Injectable({
  providedIn: 'root',
})
export class ConfirmsDialog {
  private _hasDialogActiveCountController = new LoadingController();

  get hasDialogActive() {
    return this._hasDialogActiveCountController.isShown();
  }

  constructor(private ngbModal: NgbModal) {}

  open(message: string): Observable<any>;
  open(title: string, message: string): Observable<any>;
  open(titleOrMessage: string, message?: string) {
    let title: string;
    if (typeof message === 'string') {
      title = titleOrMessage;
    } else {
      title = null;
      message = titleOrMessage;
    }

    return new Observable<any>((subscriber) => {
      const modalRef = this.ngbModal.open(ConfirmsDialogComponent, {
        centered: true,
        backdrop: 'static',
      });
      const componentInstance =
        modalRef.componentInstance as ConfirmsDialogComponent;
      componentInstance.modalTitle = title;
      componentInstance.message = message;

      this._hasDialogActiveCountController.show();

      subscriber.add(from(modalRef.result).subscribe(subscriber));

      subscriber.add(() => {
        modalRef.dismiss();

        this._hasDialogActiveCountController.hide();
      });
    }).pipe(observeOn(asapScheduler));
  }
}
