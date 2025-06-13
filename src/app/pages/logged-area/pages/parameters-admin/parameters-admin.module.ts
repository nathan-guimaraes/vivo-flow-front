import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ParametersAdminPageComponent } from './parameters-admin.page';
import { TranslateModule } from '@ngx-translate/core';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { IconicModule } from 'src/app/shared/components/iconic/iconic.module';
import { HoverClassDirective } from 'src/app/shared/directives/hover-class/hover-class.directive';

const routes: Routes = [
  {
    path: '',
    component: ParametersAdminPageComponent,
  },
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    TranslateModule,
    NgbTooltipModule,
    IconicModule,
    HoverClassDirective,
  ],
  declarations: [ParametersAdminPageComponent],
  exports: [RouterModule],
})
export class ParametersAdminPageModule {}
