import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import {
  TABLE_SORT_DEFAULT_OPTIONS,
  TableSortDefaultOptions,
  TableSortDirective,
} from './table-sort.directive';
import { TableSortHeaderComponent } from './table-sort-header.component';
import { IconicModule } from '../iconic/iconic.module';

@NgModule({
  imports: [CommonModule, IconicModule],
  declarations: [TableSortDirective, TableSortHeaderComponent],
  providers: [
    {
      provide: TABLE_SORT_DEFAULT_OPTIONS,
      useValue: {
        disableClear: false,
        arrowPosition: 'after',
      } as TableSortDefaultOptions,
    },
  ],
  exports: [TableSortDirective, TableSortHeaderComponent],
})
export class TableSortModule {}
