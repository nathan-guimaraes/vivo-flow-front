import { CommonModule } from '@angular/common';
import { Component, Input, inject } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { IconicModule } from '../iconic/iconic.module';
import { NgbActiveOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { NgScrollbarModule } from 'ngx-scrollbar';

@Component({
  selector: 'app-offcanvas-template',
  templateUrl: 'offcanvas-template.component.html',
  styleUrls: ['offcanvas-template.component.scss'],
  standalone: true,
  imports: [CommonModule, TranslateModule, NgScrollbarModule, IconicModule],
})
export class OffcanvasTemplateComponent {
  @Input()
  public offcanvas = inject(NgbActiveOffcanvas, { optional: true });

  @Input()
  offcanvasTitle: string;
}
