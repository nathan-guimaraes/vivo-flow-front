import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { AppConfigService } from '../../services/app-config.service';

@Component({
  selector: 'app-footer',
  templateUrl: 'footer.component.html',
  styleUrls: ['footer.component.scss'],
  standalone: true,
  imports: [CommonModule, TranslateModule],
})
export class FooterComponent {
  year = new Date().getFullYear();

  appConfig = inject(AppConfigService);
}
