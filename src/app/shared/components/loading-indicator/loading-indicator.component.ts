import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-loading-indicator',
  templateUrl: 'loading-indicator.component.html',
  styleUrls: ['loading-indicator.component.scss'],
  host: {
    '[class.lock-screen-mode]': '!!lockScreen',
  },
  standalone: true,
  imports: [CommonModule],
})
export class LoadingIndicatorComponent {
  @Input()
  visible: boolean;

  @Input()
  showBackdrop: boolean = true;

  @Input()
  lockScreen: boolean = true;

  @Input()
  size: 'large' | 'small' = 'small';
}
