import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { environment } from 'src/environments/environment';

const routes: Routes = [
  {
    path: '',
    loadChildren: () =>
      import('./pages/logged-area/logged-area.module').then(
        (x) => x.LoggedAreaPageModule
      ),
    data: {
      onlyLogged: true,
    },
  },
  {
    path: '**',
    redirectTo: '',
  },
];

if (!environment.production) {
  routes.unshift({
    path: 'auth',
    loadChildren: () =>
      import('./pages/auth/auth.module').then((x) => x.AuthModule),
    data: {
      onlyNotLogged: true,
    },
  });
}

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
