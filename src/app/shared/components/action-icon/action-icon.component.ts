import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { HoverClassDirective } from '../../directives/hover-class/hover-class.directive';
import { IconicModule } from '../iconic/iconic.module';

@Component({
  selector: 'app-action-icon',
  templateUrl: 'action-icon.component.html',
  styles: [
    `
      :host {
        display: inline-flex;

        &.disabled {
          pointer-events: none;
        }
      }
    `,
  ],
  host: {
    '[class.disabled]': '!!disabled',
  },
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    NgbTooltipModule,
    IconicModule,
    HoverClassDirective,
  ],
})
export class ActionIconComponent {
  @Input()
  icon: string;
  @Input()
  tooltip: string;
  @Input()
  disabled: boolean;
}
