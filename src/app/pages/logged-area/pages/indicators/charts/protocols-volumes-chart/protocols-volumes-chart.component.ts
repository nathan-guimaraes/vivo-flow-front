import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { LoadingIndicatorComponent } from 'src/app/shared/components/loading-indicator/loading-indicator.component';
import { ChartsModule } from 'src/app/shared/helpers/charts/charts.module';

import { EChartsOption } from 'echarts';

import moment from 'moment';
import { ProtocolVolumeInfoLike } from 'src/app/shared/models/protocol-volume-info.model';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-protocols-volumes-chart',
  templateUrl: 'protocols-volumes-chart.component.html',
  styleUrls: ['protocols-volumes-chart.component.scss'],
  standalone: true,
  imports: [CommonModule, ChartsModule, LoadingIndicatorComponent],
})
export class ProtocolsVolumesChartComponent implements OnChanges {
  @Input()
  data: ProtocolVolumeInfoLike[];

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
      ],
      series: [
        {
          type: 'bar',
          name: this.translateService.instant(
            'indicators.sessions.indicators.cards.protocol-volumetry.chart.pending'
          ),
          stack: 'bar',
          data: data.map((x) => x.pendingCount),
        },
        {
          type: 'bar',
          name: this.translateService.instant(
            'indicators.sessions.indicators.cards.protocol-volumetry.chart.stand-by'
          ),
          stack: 'bar',
          data: data.map((x) => x.standByCount),
        },
        {
          type: 'bar',
          name: this.translateService.instant(
            'indicators.sessions.indicators.cards.protocol-volumetry.chart.in-treatment'
          ),
          stack: 'bar',
          data: data.map((x) => x.inTreatmentCount),
        },
        {
          type: 'bar',
          name: this.translateService.instant(
            'indicators.sessions.indicators.cards.protocol-volumetry.chart.paused'
          ),
          stack: 'bar',
          data: data.map((x) => x.pausedCount),
        },
        {
          type: 'bar',
          name: this.translateService.instant(
            'indicators.sessions.indicators.cards.protocol-volumetry.chart.canceled'
          ),
          stack: 'bar',
          data: data.map((x) => x.canceledCount),
        },
        {
          type: 'bar',
          name: this.translateService.instant(
            'indicators.sessions.indicators.cards.protocol-volumetry.chart.done'
          ),
          stack: 'bar',
          data: data.map((x) => x.concludeCount),
        },
        {
          type: 'bar',
          name: this.translateService.instant(
            'indicators.sessions.indicators.cards.protocol-volumetry.chart.in-transfer'
          ),
          stack: 'bar',
          data: data.map((x) => x.inTransferCount),
        },
        {
          type: 'bar',
          name: this.translateService.instant(
            'indicators.sessions.indicators.cards.protocol-volumetry.chart.transfer-error'
          ),
          stack: 'bar',
          data: data.map((x) => x.transferErrorCount),
        },
      ],
    };
  }
}
