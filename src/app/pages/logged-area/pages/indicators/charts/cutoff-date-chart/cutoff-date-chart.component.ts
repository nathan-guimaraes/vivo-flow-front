import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { LoadingIndicatorComponent } from 'src/app/shared/components/loading-indicator/loading-indicator.component';
import { ChartsModule } from 'src/app/shared/helpers/charts/charts.module';

import { EChartsOption } from 'echarts';

import moment from 'moment';
import { CutoffDateInfoLike } from 'src/app/shared/models/cutoff-date-info.model';
import { TranslateService } from '@ngx-translate/core';
import { FormatterUtils } from 'src/app/shared/utils/formatter.utils';

@Component({
  selector: 'app-cutoff-date-chart',
  templateUrl: 'cutoff-date-chart.component.html',
  styleUrls: ['cutoff-date-chart.component.scss'],
  standalone: true,
  imports: [CommonModule, ChartsModule, LoadingIndicatorComponent],
})
export class CutoffDateChartComponent implements OnChanges {
  @Input()
  data: CutoffDateInfoLike[];

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
          data: data.map((x) => `${x.month}/${x.year}`),
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
            'indicators.sessions.indicators.cards.cutoff-date.chart.created-month'
          ),
          stack: 'bar',
          data: data.map((x) => x.totalProtocolsUntilCutOff),
        },
        {
          type: 'bar',
          name: this.translateService.instant(
            'indicators.sessions.indicators.cards.cutoff-date.chart.backlog'
          ),
          stack: 'bar',
          data: data.map((x) => x.backLog),
        },
        {
          type: 'line',
          name: this.translateService.instant(
            'indicators.sessions.indicators.cards.cutoff-date.chart.done-percentual'
          ),
          yAxisId: 'percentual',
          data: data.map((x) => {
            return (
              (x.completedProtocolsUntilCutOff / x.totalProtocolsUntilCutOff) *
              100
            );
          }),
          tooltip: {
            valueFormatter: formatPercent,
          },
        },
        {
          type: 'line',
          name: this.translateService.instant(
            'indicators.sessions.indicators.cards.cutoff-date.chart.outof-cutof-date'
          ),
          yAxisId: 'percentual',
          data: data.map((x) => {
            return (
              100 - (x.totalProtocolsUntilCutOff / x.totalMonthProtocols) * 100
            );
          }),
          tooltip: {
            valueFormatter: formatPercent,
          },
        },
      ],
    };
  }
}

function formatPercent(value) {
  return FormatterUtils.formatPercent(value);
}
