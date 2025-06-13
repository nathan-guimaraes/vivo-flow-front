import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { LoadingIndicatorComponent } from 'src/app/shared/components/loading-indicator/loading-indicator.component';
import { ChartsModule } from 'src/app/shared/helpers/charts/charts.module';

import { EChartsOption } from 'echarts';

import moment from 'moment';
import { ProtocolVolumeInfoLike } from 'src/app/shared/models/protocol-volume-info.model';
import { ProductivityInfoLike } from 'src/app/shared/models/productivity-info.model';
import { TranslateService } from '@ngx-translate/core';
import { FormatterUtils } from 'src/app/shared/utils/formatter.utils';

@Component({
  selector: 'app-productivity-chart',
  templateUrl: 'productivity-chart.component.html',
  styleUrls: ['productivity-chart.component.scss'],
  standalone: true,
  imports: [CommonModule, ChartsModule, LoadingIndicatorComponent],
})
export class ProductivityChartComponent implements OnChanges {
  @Input()
  data: ProductivityInfoLike[];

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
            'indicators.sessions.indicators.cards.productivity.chart.average-productivity'
          ),
          stack: 'bar',
          data: data.map((x) => x.totalProtocols),
        },
        {
          type: 'bar',
          name: this.translateService.instant(
            'indicators.sessions.indicators.cards.productivity.chart.average-productivity-ref'
          ),
          stack: 'bar',
          data: data.map((x) => x.totalProtocolsRef),
        },
        {
          type: 'line',
          name: this.translateService.instant(
            'indicators.sessions.indicators.cards.productivity.chart.productivity-percentual'
          ),
          yAxisId: 'percentual',
          data: data.map((x) => {
            if (!x.totalProtocols || !x.totalProtocolsRef) {
              return 0;
            }

            const res = (x.totalProtocols / x.totalProtocolsRef) * 100;
            return res;
          }),
          tooltip: {
            valueFormatter: (v) => FormatterUtils.formatPercent(v as any),
          },
        },
      ],
    };
  }
}
