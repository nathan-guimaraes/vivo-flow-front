import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { HomePageComponent } from './home.page';
import { RouterModule, Routes } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { LoadingIndicatorComponent } from 'src/app/shared/components/loading-indicator/loading-indicator.component';
import { IconicModule } from 'src/app/shared/components/iconic/iconic.module';
import { ChartsModule } from 'src/app/shared/helpers/charts/charts.module';
import { MultipleHorizontalChartbarComponent } from 'src/app/shared/components/multiple-horizontal-chartbar/multiple-horizontal-chartbar.component';

const routes: Routes = [
  {
    path: '',
    component: HomePageComponent,
  },
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    TranslateModule,
    IconicModule,
    MultipleHorizontalChartbarComponent,
  ],
  declarations: [HomePageComponent],
  exports: [RouterModule],
})
export class HomePageModule {}
