import { Component } from '@angular/core';

@Component({
  selector: 'app-auth-page',
  templateUrl: 'auth.page.html',
  styleUrls: ['auth.page.scss'],
})
export class AuthPageComponent {
  year: number = new Date().getFullYear();
}
