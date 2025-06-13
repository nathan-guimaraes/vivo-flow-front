import { NgModule } from '@angular/core';

import { NgxEchartsModule } from 'ngx-echarts';

import * as echarts from 'echarts/core';

import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
} from 'echarts/components';

import { BarChart, LineChart } from 'echarts/charts';
import { LabelLayout } from 'echarts/features';
import { SVGRenderer } from 'echarts/renderers';

echarts.use([
  GridComponent,
  TooltipComponent,
  LegendComponent,
  BarChart,
  LineChart,
  LabelLayout,
  SVGRenderer,
]);

@NgModule({
  imports: [
    NgxEchartsModule.forRoot({
      echarts,
    }),
  ],
  exports: [NgxEchartsModule],
})
export class ChartsModule {}
