import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProtocolDealingsPageComponent } from './protocol-dealings.page';
import { TranslateModule } from '@ngx-translate/core';
import { IconicModule } from 'src/app/shared/components/iconic/iconic.module';
import { FieldModule } from 'src/app/shared/components/field/field.module';
import { SelectBoxModule } from 'src/app/shared/components/select-box/select-box.module';
import { DateBoxComponent } from 'src/app/shared/components/date-box/date-box.component';
import { StepperComponent } from 'src/app/shared/components/stepper/stepper.component';
import { ReactiveFormsModule } from '@angular/forms';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { ProtocolTreatmentsDiagramComponent } from 'src/app/shared/components/protocol-treatments-diagram/protocol-treatments-diagram.component';

const routes: Routes = [
  {
    path: '',
    component: ProtocolDealingsPageComponent,
  },
];

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    TranslateModule,
    NgxMaskDirective,
    FieldModule,
    SelectBoxModule,
    DateBoxComponent,
    IconicModule,
    ProtocolTreatmentsDiagramComponent,
    StepperComponent,
  ],
  providers: [provideNgxMask()],
  declarations: [ProtocolDealingsPageComponent],
  exports: [RouterModule],
})
export class ProtocolDealingsPageModule {}
