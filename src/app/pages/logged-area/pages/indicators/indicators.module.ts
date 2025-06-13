import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { IndicatorsPageComponent } from './indicators.page';
import { TranslateModule } from '@ngx-translate/core';
import { ActionIconComponent } from 'src/app/shared/components/action-icon/action-icon.component';
import { ProtocolsVolumesChartComponent } from './charts/protocols-volumes-chart/protocols-volumes-chart.component';
import { CutoffDateChartComponent } from './charts/cutoff-date-chart/cutoff-date-chart.component';
import { ProductivityChartComponent } from './charts/productivity-chart/productivity-chart.component';
import { TreatmentTimeChartComponent } from './charts/treatment-time-chart/treatment-time-chart.component';
import { DisapprovalTreatmentsChartComponent } from './charts/disapproval-treatments-chart/disapproval-treatments-chart.component';
import { LazyRenderingDirective } from 'src/app/shared/directives/lazy-rendering/lazy-rendering.directive';

const routes: Routes = [
  {
    path: '',
    component: IndicatorsPageComponent,
  },
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    TranslateModule,
    ActionIconComponent,
    ProtocolsVolumesChartComponent,
    CutoffDateChartComponent,
    ProductivityChartComponent,
    TreatmentTimeChartComponent,
    DisapprovalTreatmentsChartComponent,
    LazyRenderingDirective,
  ],
  declarations: [IndicatorsPageComponent],
  exports: [RouterModule],
})
export class IndicatorsPageModule {}
