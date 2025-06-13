import { CommonModule } from '@angular/common';
import { Component, Input, TemplateRef } from '@angular/core';
import { IconicModule } from '../iconic/iconic.module';
import { ItemExprUtils } from '../../utils/item-expr.utils';
import { TranslateModule } from '@ngx-translate/core';

export interface StepItemLike {
  key: any;
  text: string;
  icon: string;
  iconColor?: string;
  disabled?: boolean;
  data?: any;
  textTemplate?: TemplateRef<any>;
}

@Component({
  selector: 'app-stepper',
  templateUrl: 'stepper.component.html',
  styleUrls: ['stepper.component.scss'],
  standalone: true,
  imports: [CommonModule, TranslateModule, IconicModule],
})
export class StepperComponent {
  @Input()
  steps: StepItemLike[];

  trackBy = ItemExprUtils.trackByFunction<StepItemLike>((x) => x.key);
}
