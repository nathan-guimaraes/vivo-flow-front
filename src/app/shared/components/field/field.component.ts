import {
  Component,
  ContentChild,
  ContentChildren,
  Input,
  QueryList,
  TemplateRef,
} from '@angular/core';

@Component({
  selector: 'app-field-error-item',
  template: `<ng-content></ng-content>`,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
})
export class FieldErrorItemComponent {}

@Component({
  selector: 'app-field-error-container',
  template: `
    <ng-container *ngIf="!!fieldErrorList?.length">
      <ng-content select="app-field-error-item"></ng-content>
    </ng-container>
  `,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
  host: {
    '[class.invalid-feedback]': 'true',
  },
})
export class FieldErrorContainerComponent {
  @ContentChildren(FieldErrorItemComponent)
  fieldErrorList: QueryList<FieldErrorItemComponent>;
}

@Component({
  selector: 'app-field',
  templateUrl: 'field.component.html',
  styleUrls: ['field.component.scss'],
})
export class FieldComponent {
  @ContentChild(FieldErrorContainerComponent, { static: false })
  fieldErrorContainerTpl: FieldErrorContainerComponent;

  @Input()
  label: string;
}
