import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UsersAdminPageComponent } from './users-admin.page';
import { CdkTableModule } from '@angular/cdk/table';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { LoadingIndicatorComponent } from 'src/app/shared/components/loading-indicator/loading-indicator.component';
import { TableSortModule } from 'src/app/shared/components/table-sort/table-sort.module';
import { UsersFilterFormComponent } from './components/users-filter-form/users-filter-form.component';
import { CheckboxComponent } from 'src/app/shared/components/checkbox/checkbox.component';
import { HoverClassDirective } from 'src/app/shared/directives/hover-class/hover-class.directive';
import { IconicModule } from 'src/app/shared/components/iconic/iconic.module';
import { OffcanvasTemplateComponent } from 'src/app/shared/components/offcanvas-template/offcanvas-template.component';
import { PortalModule } from '@angular/cdk/portal';
import { ActionIconComponent } from 'src/app/shared/components/action-icon/action-icon.component';
import { PaginationComponent } from 'src/app/shared/components/pagination/pagination.component';

const routes: Routes = [
  {
    path: '',
    component: UsersAdminPageComponent,
  },
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    TranslateModule,
    CdkTableModule,
    PortalModule,
    NgbTooltipModule,
    TableSortModule,
    CheckboxComponent,
    LoadingIndicatorComponent,
    UsersFilterFormComponent,
    IconicModule,
    ActionIconComponent,
    HoverClassDirective,
    OffcanvasTemplateComponent,
    PaginationComponent,
  ],
  declarations: [UsersAdminPageComponent],
  exports: [RouterModule],
})
export class UsersAdminPageModule {}
