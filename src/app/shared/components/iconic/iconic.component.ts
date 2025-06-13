import { Component, OnChanges, SimpleChanges, Input } from '@angular/core';
import { IconType, IconicRegister } from './iconic-register';

export type IconAs = 'svg' | 'image' | 'css';

@Component({
  selector: 'app-iconic',
  templateUrl: 'iconic.component.html',
  styleUrls: ['iconic.component.scss'],
})
export class IconicComponent implements OnChanges {
  @Input()
  icon: string;

  iconValue: string;

  iconTypes = IconType;
  iconType: IconType;

  constructor(private iconicRegister: IconicRegister) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes.icon) {
      if (!this.icon) {
        this.iconValue = null;
        this.iconType = null;
        return;
      }

      const icon = this.iconicRegister.resolve(this.icon);
      this.iconValue = icon.src;
      this.iconType = icon.type;
    }
  }
}
