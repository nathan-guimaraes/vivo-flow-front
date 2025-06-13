import {
  ApplicationRef,
  ChangeDetectorRef,
  Directive,
  EventEmitter,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';
import { RxIntersectionObserver } from '@rxjs-toolkit/intersection-observer';
import { asapScheduler, Subscription } from 'rxjs';

@Directive({
  selector: '[appLazyRendering]',
  standalone: true,
})
export class LazyRenderingDirective implements OnChanges, OnDestroy {
  @Input({ alias: 'appLazyRendering', required: true })
  target: Element;

  @Input()
  threshold: number;

  @Output()
  onRendered = new EventEmitter<any>();

  private rendered = false;

  private _intersectSubscription: Subscription;
  private _renderedSubscription: Subscription;

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainerRef: ViewContainerRef,
    private changeDetector: ChangeDetectorRef,
    private zone: NgZone
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.target || changes.threshold) {
      this.setupIntersectObserver();
    }
  }

  ngOnDestroy(): void {
    this._renderedSubscription?.unsubscribe();
  }

  private setupIntersectObserver() {
    this._intersectSubscription?.unsubscribe();
    if (!this.target || this.rendered) {
      return;
    }

    this.zone.runOutsideAngular(() => {
      this._intersectSubscription = RxIntersectionObserver.observe(
        this.target,
        {
          threshold: this.threshold ?? 0,
        }
      ).subscribe((entries) => {
        const aBool = entries.some((x) => x.isIntersecting);
        if (!aBool) {
          return;
        }

        this._intersectSubscription?.unsubscribe();

        this.zone.runGuarded(() => {
          this.render();
        });
      });
    });
  }

  private render() {
    this.rendered = true;
    this.viewContainerRef.createEmbeddedView(this.templateRef);
    this.changeDetector.detectChanges();

    this.onRendered.emit();
  }
}
