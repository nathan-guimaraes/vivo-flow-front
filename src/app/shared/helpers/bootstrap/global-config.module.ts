import { Injectable, NgModule } from '@angular/core';
import {
  NgbTooltipConfig,
  NgbModalConfig,
  NgbOffcanvasConfig,
} from '@ng-bootstrap/ng-bootstrap';

@Injectable()
class GlobalTooltipConfig extends NgbTooltipConfig {
  override openDelay = 200;
  override container = 'body';
}

@Injectable()
class GlobalModalConfig extends NgbModalConfig {
  override container = 'body';
  override centered = true;
  override size = 'md';
  override keyboard = false;
}

@Injectable()
class GlobalOffcanvasConfig extends NgbOffcanvasConfig {
  override position: 'start' | 'end' | 'top' | 'bottom' = 'end';
}

@NgModule({
  providers: [
    {
      provide: NgbTooltipConfig,
      useClass: GlobalTooltipConfig,
    },
    {
      provide: NgbModalConfig,
      useClass: GlobalModalConfig,
    },
    {
      provide: NgbOffcanvasConfig,
      useClass: GlobalOffcanvasConfig,
    },
  ],
})
export class GlobalBootstrapConfigModule {}
