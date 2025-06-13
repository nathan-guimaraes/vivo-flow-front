import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import {
  FieldComponent,
  FieldErrorContainerComponent,
  FieldErrorItemComponent,
} from './field.component';

@NgModule({
  imports: [CommonModule],
  declarations: [
    FieldComponent,
    FieldErrorContainerComponent,
    FieldErrorItemComponent,
  ],
  exports: [
    FieldComponent,
    FieldErrorContainerComponent,
    FieldErrorItemComponent,
  ],
})
export class FieldModule {}
