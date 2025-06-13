import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconicComponent } from './iconic.component';
import { AngularSvgIconModule, SvgLoader } from 'angular-svg-icon';
import { CustomSvgLoader, SvgBrowserLoader } from './svg-loader';
import { IconicRegister } from './iconic-register';

@NgModule({
  imports: [
    AngularSvgIconModule.forRoot({
      loader: {
        provide: SvgLoader,
        useExisting: CustomSvgLoader,
      },
    }),
  ],
  providers: [
    {
      provide: CustomSvgLoader,
      useClass: SvgBrowserLoader,
    },
  ],
  exports: [AngularSvgIconModule],
})
export class SvgIconModule {}

@NgModule({
  imports: [CommonModule, SvgIconModule],
  declarations: [IconicComponent],
  exports: [IconicComponent],
})
export class IconicModule {}
