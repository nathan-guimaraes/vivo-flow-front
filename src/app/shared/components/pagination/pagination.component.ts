import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-pagination',
  templateUrl: 'pagination.component.html',
  styleUrls: ['pagination.component.scss'],
  standalone: true,
  imports: [NgbPaginationModule],
})
export class PaginationComponent {
  @Input()
  page: number;
  @Output()
  readonly pageChange = new EventEmitter<number>();

  @Input()
  collectionSize: number;
  @Input()
  pageSize: number;
}
