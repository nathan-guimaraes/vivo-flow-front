import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { LoadingIndicatorComponent } from 'src/app/shared/components/loading-indicator/loading-indicator.component';
import { ChartsModule } from 'src/app/shared/helpers/charts/charts.module';

import { EChartsOption } from 'echarts';

import moment from 'moment';
import { TranslateService } from '@ngx-translate/core';
import { TreatmentTimeInfoLike } from 'src/app/shared/models/treatment-time-info.model';
import { TimeSpan } from 'src/app/shared/helpers/time-span/time-span';

@Component({
  selector: 'app-treatment-time-chart',
  templateUrl: 'treatment-time-chart.component.html',
  styleUrls: ['treatment-time-chart.component.scss'],
  standalone: true,
  imports: [CommonModule, ChartsModule, LoadingIndicatorComponent],
})
export class TreatmentTimeChartComponent implements OnChanges {
  @Input()
  data: TreatmentTimeInfoLike[];

  @Input()
  loading: boolean;

  chartOptions: EChartsOption;

  constructor(private translateService: TranslateService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.data) {
      this.handleData();
    }
  }

  private handleData() {
    const data = this.data ?? [];

    this.chartOptions = {
      grid: {
        left: '0%',
        right: '0%',
        bottom: `0%`,
        top: `50px`,
        containLabel: true,
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
      },
      legend: {
        show: true,
      },
      xAxis: [
        {
          type: 'category',
          data: data.map((x) => moment(x.date).format('DD/MM/YYYY')),
        },
      ],
      yAxis: [
        {
          type: 'value',
          min: 0,
        },
        {
          type: 'time',
          id: 'averageTime',
          show: false,
        },
      ],
      series: [
        {
          type: 'bar',
          name: this.translateService.instant(
            'indicators.sessions.indicators.cards.treatment-time.chart.done-protocols'
          ),
          stack: 'bar',
          data: data.map((x) => x.doneProtocols),
        },
        {
          type: 'bar',
          name: this.translateService.instant(
            'indicators.sessions.indicators.cards.treatment-time.chart.undone-protocols'
          ),
          stack: 'bar',
          data: data.map((x) => x.undoneProtocols),
        },
        {
          type: 'line',
          name: this.translateService.instant(
            'indicators.sessions.indicators.cards.treatment-time.chart.average-time'
          ),
          yAxisId: 'averageTime',
          data: data.map((x) => {
            const totalProtocols = x.doneProtocols + x.undoneProtocols;
            const totalTime =
              x.doneTime.totalMilliseconds + x.undoneTime.totalMilliseconds;

            if (!totalTime || !totalProtocols) {
              return 0;
            }

            const averageTime = totalTime / totalProtocols;
            return averageTime;
          }),
          tooltip: {
            valueFormatter: formatTime,
          },
        },
      ],
    };
  }
}

function formatTime(value) {
  const time = TimeSpan.fromMilliseconds(value);
  return time.toString();
}
