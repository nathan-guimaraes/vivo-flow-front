import { Component, Input, ViewChild } from '@angular/core';
import { NgbDropdown } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-dropdown-button',
  templateUrl: 'dropdown-button.component.html',
  styleUrls: ['dropdown-button.component.scss'],
  host: {
    '[class.state-opened]': '!!dropdown?.isOpen()',
  },
})
export class DropdownButtonComponent {
  @ViewChild(NgbDropdown, { static: true })
  dropdown: NgbDropdown;

  @Input()
  label: string;
}
