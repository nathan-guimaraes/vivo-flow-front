import { NgModule } from '@angular/core';
import { DropdownButtonComponent } from './dropdown-button.component';
import { CommonModule } from '@angular/common';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { IconicModule } from '../iconic/iconic.module';

@NgModule({
  imports: [CommonModule, NgbDropdownModule, IconicModule],
  declarations: [DropdownButtonComponent],
  exports: [DropdownButtonComponent],
})
export class DropdownButtonModule {}
