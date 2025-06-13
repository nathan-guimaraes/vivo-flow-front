import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SlaAdminPageComponent } from './sla-admin.page';
import { TranslateModule } from '@ngx-translate/core';
import { CdkTableModule } from '@angular/cdk/table';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { LoadingIndicatorComponent } from 'src/app/shared/components/loading-indicator/loading-indicator.component';
import { IconicModule } from 'src/app/shared/components/iconic/iconic.module';
import { HoverClassDirective } from 'src/app/shared/directives/hover-class/hover-class.directive';
import { PortalModule } from '@angular/cdk/portal';
import { OffcanvasTemplateComponent } from 'src/app/shared/components/offcanvas-template/offcanvas-template.component';
import { SlaFilterFormComponent } from './components/sla-filter-form/sla-filter-form.component';
import { SlaTimePipe } from 'src/app/shared/pipes/sla.pipe';
import { PaginationComponent } from 'src/app/shared/components/pagination/pagination.component';

const routes: Routes = [
  {
    path: '',
    component: SlaAdminPageComponent,
  },
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    TranslateModule,
    NgbTooltipModule,
    CdkTableModule,
    PortalModule,
    OffcanvasTemplateComponent,
    LoadingIndicatorComponent,
    IconicModule,
    HoverClassDirective,
    SlaFilterFormComponent,
    SlaTimePipe,
    PaginationComponent,
  ],
  declarations: [SlaAdminPageComponent],
  exports: [RouterModule],
})
export class SlaAdminPageModule {}
