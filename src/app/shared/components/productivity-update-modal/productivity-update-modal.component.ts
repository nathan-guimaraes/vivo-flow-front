import {
  Component,
  DestroyRef,
  Inject,
  Input,
  OnInit,
  inject,
} from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SelectBoxModule } from '../select-box/select-box.module';
import { IconicModule } from '../iconic/iconic.module';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NgbActiveModal, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { ToastService } from '../../services/toast.service';
import { LoadingController } from '../../helpers/loading.controller';
import { GLOBAL_LOADING } from '../../constants/loading-controller.constant';
import { FieldModule } from '../field/field.module';
import { CommonModule } from '@angular/common';
import { DateBoxComponent } from '../date-box/date-box.component';
import { ProductivityModelLike } from '../../models/productivity.model';
import { ProductivityService } from '../../services/productivity.service';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ModalTemplateComponent } from '../modal-template/modal-template.component';

interface ProductivityFormLike {
  quantityProductivity: FormControl<number>;
}

@Component({
  selector: 'app-productivity-update-modal',
  templateUrl: 'productivity-update-modal.component.html',
  styleUrls: ['productivity-update-modal.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    NgbModalModule,
    ModalTemplateComponent,
    FieldModule,
    SelectBoxModule,
    DateBoxComponent,
    IconicModule,
  ],
})
export class ProductivityUpdateModalComponent implements OnInit {
  private destroyRef = inject(DestroyRef);

  @Input({ required: true })
  model: ProductivityModelLike;

  formGroup: FormGroup<ProductivityFormLike>;

  get f() {
    return this.formGroup.controls;
  }

  submitted: boolean;

  constructor(
    public activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    private productivityService: ProductivityService,
    private toastService: ToastService,
    @Inject(GLOBAL_LOADING) private globalLoadingController: LoadingController
  ) {
    this.formGroup = this.formBuilder.group<ProductivityFormLike>({
      quantityProductivity: this.formBuilder.control<number>(null, [
        Validators.required,
      ]),
    });
  }

  ngOnInit(): void {
    this.formGroup.reset(this.model);
  }

  onSubmit() {
    if (this.globalLoadingController.isShown()) {
      return;
    }

    this.submitted = true;
    if (this.formGroup.invalid) {
      return;
    }

    const { quantityProductivity } = this.formGroup.getRawValue();

    this.globalLoadingController.show();
    this.productivityService
      .update(this.model.id, quantityProductivity)
      .pipe(
        finalize(() => {
          this.globalLoadingController.hide();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: () => {
          this.toastService.success(
            `productivity-update-modal.messages.productivityUpdated`
          );
          this.activeModal.close();
        },
        error: (response) => {
          if (!response) {
            return;
          }

          this.toastService.error(
            `productivity-update-modal.errors.cannot-save-productivity`
          );
        },
      });
  }
}
