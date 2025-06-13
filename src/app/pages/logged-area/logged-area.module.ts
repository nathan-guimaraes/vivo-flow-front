import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { LoggedAreaComponent } from './logged-area.component';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'src/app/shared/guards/auth.guard';
import { HeaderComponent } from 'src/app/shared/components/header/header.component';
import { FooterComponent } from 'src/app/shared/components/footer/footer.component';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { Roles } from 'src/app/shared/constants/auth.constant';

const routes: Routes = [
  {
    path: '',
    component: LoggedAreaComponent,
    children: [
      {
        path: 'home',
        loadChildren: () =>
          import('./pages/home/home.module').then((x) => x.HomePageModule),
        canActivate: [AuthGuard],
      },
      {
        path: 'indicators',
        loadChildren: () =>
          import('./pages/indicators/indicators.module').then(
            (x) => x.IndicatorsPageModule
          ),
        canActivate: [AuthGuard],
        data: {
          role: Roles.Indicators,
        },
      },
      {
        path: 'protocols',
        loadChildren: () =>
          import('./pages/protocols-admin/protocols-admin.module').then(
            (x) => x.ProtocolsAdminPageModule
          ),
        canActivate: [AuthGuard],
        data: {
          role: Roles.ProtocolsAdmin,
        },
      },
      {
        path: 'users-admin',
        loadChildren: () =>
          import('./pages/users-admin/users-admin.module').then(
            (x) => x.UsersAdminPageModule
          ),
        canActivate: [AuthGuard],
        data: {
          role: Roles.UserAdmin,
        },
      },
      {
        path: 'system-admin',
        children: [
          {
            path: '',
            loadChildren: () =>
              import('./pages/system-admin/system-admin.module').then(
                (x) => x.SystemAdminPageModule
              ),
            canActivate: [AuthGuard],
          },
          {
            path: 'parameters',
            loadChildren: () =>
              import('./pages/parameters-admin/parameters-admin.module').then(
                (x) => x.ParametersAdminPageModule
              ),
            canActivate: [AuthGuard],
            data: {
              btnGobackEnabled: true,
              role: Roles.SystemAdmin.Parameters,
            },
          },
          {
            path: 'sla',
            loadChildren: () =>
              import('./pages/sla-admin/sla-admin.module').then(
                (x) => x.SlaAdminPageModule
              ),
            canActivate: [AuthGuard],
            data: {
              btnGobackEnabled: true,
              role: Roles.SystemAdmin.SLA,
            },
          },
          {
            path: 'productivity',
            loadChildren: () =>
              import(
                './pages/productivity-admin/productivity-admin.module'
              ).then((x) => x.ProductivityAdminPageModule),
            canActivate: [AuthGuard],
            data: {
              btnGobackEnabled: true,
              role: Roles.SystemAdmin.Productivity,
            },
          },
          {
            path: '**',
            redirectTo: '',
          },
        ],
        canActivate: [AuthGuard],
        data: {
          role: Roles.SystemAdmin,
        },
      },
      {
        path: 'protocol-dealings',
        loadChildren: () =>
          import('./pages/protocol-dealings/protocol-dealings.module').then(
            (x) => x.ProtocolDealingsPageModule
          ),
        canActivate: [AuthGuard],
        data: {
          role: Roles.DealingProtocols,
        },
      },
      {
        path: '**',
        redirectTo: 'home',
      },
    ],
  },
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    NgScrollbarModule,
    HeaderComponent,
    FooterComponent,
  ],
  declarations: [LoggedAreaComponent],
  exports: [RouterModule],
})
export class LoggedAreaPageModule {}
