import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { LoadingIndicatorComponent } from 'src/app/shared/components/loading-indicator/loading-indicator.component';
import { ChartsModule } from 'src/app/shared/helpers/charts/charts.module';

import { EChartsOption } from 'echarts';

import moment from 'moment';
import { TranslateService } from '@ngx-translate/core';
import { TimeSpan } from 'src/app/shared/helpers/time-span/time-span';
import { DisapprovalTreatmentsInfoLike } from 'src/app/shared/models/disapproval-treatments-info.model';
import { FormatterUtils } from 'src/app/shared/utils/formatter.utils';

@Component({
  selector: 'app-disapproval-treatments-chart',
  templateUrl: 'disapproval-treatments-chart.component.html',
  styleUrls: ['disapproval-treatments-chart.component.scss'],
  standalone: true,
  imports: [CommonModule, ChartsModule, LoadingIndicatorComponent],
})
export class DisapprovalTreatmentsChartComponent implements OnChanges {
  @Input()
  data: DisapprovalTreatmentsInfoLike[];

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
        right: '5px',
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
          type: 'value',
          id: 'percentual',
          min: 0,
          max: 100,
          axisLabel: {
            formatter: (v) => FormatterUtils.formatPercent(v),
          },
        },
      ],
      series: [
        {
          type: 'bar',
          name: this.translateService.instant(
            'indicators.sessions.indicators.cards.disapproval-treatments.chart.total-treatments'
          ),
          stack: 'bar',
          data: data.map((x) => x.treatments),
        },
        {
          type: 'bar',
          name: this.translateService.instant(
            'indicators.sessions.indicators.cards.disapproval-treatments.chart.disapproval-treatments'
          ),
          stack: 'bar',
          data: data.map((x) => x.disapprovedTreatments),
        },
        {
          type: 'line',
          name: this.translateService.instant(
            'indicators.sessions.indicators.cards.disapproval-treatments.chart.disapproval-treatments-percent'
          ),
          yAxisId: 'percentual',
          data: data.map((x) => {
            if (!x.treatments) {
              return 0;
            }

            const value = (x.disapprovedTreatments / x.treatments) * 100;
            return value;
          }),
          tooltip: {
            valueFormatter: (v: any) => FormatterUtils.formatPercent(v),
          },
        },
      ],
    };
  }
}
