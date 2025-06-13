import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SystemAdminPageComponent } from './system-admin.page';
import { TranslateModule } from '@ngx-translate/core';
import { IconicModule } from 'src/app/shared/components/iconic/iconic.module';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { HoverClassDirective } from 'src/app/shared/directives/hover-class/hover-class.directive';

const routes: Routes = [
  {
    path: '',
    component: SystemAdminPageComponent,
  },
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    TranslateModule,
    NgbTooltipModule,
    IconicModule,
    HoverClassDirective
  ],
  declarations: [SystemAdminPageComponent],
  exports: [RouterModule],
})
export class SystemAdminPageModule {}
