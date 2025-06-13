import { Directive, HostBinding, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[appHoverClass]',
  standalone: true,
})
export class HoverClassDirective {
  @Input('appHoverClass')
  hoverClass: string;
  @Input('appNotHoverClass')
  notHoverClass: string;

  @Input('appHoverClassDisabled')
  disabled = false;

  hovered = false;

  @HostBinding('class')
  get _hostClass() {
    if (this.disabled) {
      return '';
    }

    return (this.hovered ? this.hoverClass : this.notHoverClass) ?? '';
  }

  @HostListener('mouseover')
  _onHostHover() {
    this.hovered = true;
  }

  @HostListener('mouseleave')
  _onHostLeave() {
    this.hovered = false;
  }
}
