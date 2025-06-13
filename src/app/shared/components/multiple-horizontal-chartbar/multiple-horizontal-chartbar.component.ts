import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { LoadingIndicatorComponent } from '../loading-indicator/loading-indicator.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ChartsModule } from '../../helpers/charts/charts.module';
import { EChartsOption } from 'echarts';

export interface SeriesChartSourceLike {
  name: string;
  value: number;
  color: string;
}

export interface ChartOptionsLike {
  chartTitle: string;
  items: SeriesChartSourceLike[];
}

interface ChartOptionsConfiguredLike {
  chartTitle: string;
  chartHeight: string;
  options: EChartsOption;
}

@Component({
  selector: 'app-multiple-horizontal-chartbar',
  templateUrl: 'multiple-horizontal-chartbar.component.html',
  styleUrls: ['multiple-horizontal-chartbar.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    ChartsModule,
    LoadingIndicatorComponent,
  ],
})
export class MultipleHorizontalChartbarComponent {
  private _chartList: ChartOptionsLike[];
  @Input()
  set chartList(value) {
    if (this._chartList !== value) {
      this._chartList = value;
      this.setupCharts();
    }
  }

  get chartList() {
    return this._chartList;
  }

  @Input()
  loading: boolean;

  chartConfiguredList: ChartOptionsConfiguredLike[];

  constructor(private translateService: TranslateService) {}

  private setupCharts() {
    this.chartConfiguredList =
      this.chartList?.map((x) => {
        return this._generateBarChartOptions(x.chartTitle, x.items);
      }) ?? [];
  }

  private _generateBarChartOptions(
    title: string,
    items: SeriesChartSourceLike[]
  ): ChartOptionsConfiguredLike {
    const barHeight = 20;
    const barGap = 3;
    const seriesHeight = items.length * barHeight + (items.length - 1) * barGap;

    return {
      chartTitle: title,
      chartHeight: `${seriesHeight}px`,
      options: {
        tooltip: {
          trigger: 'item',
          axisPointer: {
            type: 'shadow',
          },
          formatter: `{a}<br/> {c}`,
        },
        legend: {
          show: false,
        },
        grid: {
          left: '0%',
          right: '0%',
          bottom: `0%`,
          top: `0%`,
          containLabel: false,
        },
        yAxis: {
          type: 'category',
          show: false,
        },
        xAxis: {
          type: 'value',
          minInterval: 1,
          show: false,
          max: (value) =>{
            const length = value.max.toString().length;
            const factor = 0.07 * length;
            return value.max + value.max * factor;
          }
        },
        series: items.map((x) => {
          const name = this.translateService.instant(x.name);

          return {
            name,
            type: 'bar',
            barWidth: `${barHeight}px`,
            barGap: `${(barGap / barHeight) * 100}%`,
            color: x.color,
            emphasis: {
              itemStyle: {
                color: x.color,
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)',
              },
            },
            label: {
              show: true,
              position: "right",
              color: 'var(--bs-black)',
            },
            data: [x.value],
          };
        }),
        animation: true,
        backgroundColor: 'rgba(0,0,0,0)',
      },
    };
  }
}
