import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProductivityAdminPageComponent } from './productivity-admin.page';
import { TranslateModule } from '@ngx-translate/core';
import { CdkTableModule } from '@angular/cdk/table';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { LoadingIndicatorComponent } from 'src/app/shared/components/loading-indicator/loading-indicator.component';
import { IconicModule } from 'src/app/shared/components/iconic/iconic.module';
import { HoverClassDirective } from 'src/app/shared/directives/hover-class/hover-class.directive';
import { ProductivityFilterFormComponent } from './components/productivity-filter-form/productivity-filter-form.component';
import { OffcanvasTemplateComponent } from 'src/app/shared/components/offcanvas-template/offcanvas-template.component';
import { PortalModule } from '@angular/cdk/portal';
import { PaginationComponent } from 'src/app/shared/components/pagination/pagination.component';

const routes: Routes = [
  {
    path: '',
    component: ProductivityAdminPageComponent,
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
    ProductivityFilterFormComponent,
    PaginationComponent,
  ],
  declarations: [ProductivityAdminPageComponent],
  exports: [RouterModule],
})
export class ProductivityAdminPageModule {}
