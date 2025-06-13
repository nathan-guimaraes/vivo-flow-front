import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { DeferRenderingDirective } from '../../directives/defer-rendering/defer-rendering.directive';
import { LoadingIndicatorComponent } from '../loading-indicator/loading-indicator.component';
import {
  SelectBoxComponent,
  SelectListItemTemplate,
} from './select-box.component';
import { TranslateModule } from '@ngx-translate/core';
import { CheckboxComponent } from '../checkbox/checkbox.component';
import { IconicModule } from '../iconic/iconic.module';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    NgbDropdownModule,
    NgScrollbarModule,
    InfiniteScrollModule,
    DeferRenderingDirective,
    CheckboxComponent,
    LoadingIndicatorComponent,
    IconicModule,
  ],
  declarations: [SelectBoxComponent, SelectListItemTemplate],
  exports: [SelectBoxComponent, SelectListItemTemplate],
})
export class SelectBoxModule {}
