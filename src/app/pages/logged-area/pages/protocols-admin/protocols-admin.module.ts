import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProtocolsAdminPageComponent } from './protocols-admin.page';
import { CdkTableModule } from '@angular/cdk/table';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { LoadingIndicatorComponent } from 'src/app/shared/components/loading-indicator/loading-indicator.component';
import { TableSortModule } from 'src/app/shared/components/table-sort/table-sort.module';
import { ProtocolsFilterFormComponent } from './components/protocols-filter-form/protocols-filter-form.component';
import { CheckboxComponent } from 'src/app/shared/components/checkbox/checkbox.component';
import { HoverClassDirective } from 'src/app/shared/directives/hover-class/hover-class.directive';
import { IconicModule } from 'src/app/shared/components/iconic/iconic.module';
import { DeferRenderingDirective } from 'src/app/shared/directives/defer-rendering/defer-rendering.directive';
import { PortalModule } from '@angular/cdk/portal';
import { OffcanvasTemplateComponent } from 'src/app/shared/components/offcanvas-template/offcanvas-template.component';
import { ActionIconComponent } from 'src/app/shared/components/action-icon/action-icon.component';
import { PaginationComponent } from 'src/app/shared/components/pagination/pagination.component';

const routes: Routes = [
  {
    path: '',
    component: ProtocolsAdminPageComponent,
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
    ProtocolsFilterFormComponent,
    OffcanvasTemplateComponent,
    IconicModule,
    ActionIconComponent,
    HoverClassDirective,
    DeferRenderingDirective,
    PaginationComponent,
  ],
  declarations: [ProtocolsAdminPageComponent],
  exports: [RouterModule],
})
export class ProtocolsAdminPageModule {}
