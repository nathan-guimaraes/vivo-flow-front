import {
  ChangeDetectorRef,
  Directive,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';
import { asapScheduler, Subscription } from 'rxjs';

@Directive({
  selector: '[appDeferRendering]',
  standalone: true,
})
export class DeferRenderingDirective implements OnDestroy {
  @Output()
  onRendered = new EventEmitter<any>();
  @Output()
  onDestroyed = new EventEmitter<any>();

  private rendered = false;

  @Input()
  set appDeferRendering(value: any) {
    if (value && !this.rendered) {
      this.rendered = true;
      this.render();
    }
  }

  private _renderedSubscription: Subscription;

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainerRef: ViewContainerRef,
    private changeDetector: ChangeDetectorRef
  ) {}

  ngOnDestroy(): void {
    this._renderedSubscription?.unsubscribe();
    this.onDestroyed.emit();
  }

  private render() {
    this.viewContainerRef.createEmbeddedView(this.templateRef);
    this.changeDetector.detectChanges();

    this.onRendered.emit();
  }
}
