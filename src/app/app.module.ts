import { APP_INITIALIZER, LOCALE_ID, NgModule } from '@angular/core';
import { BrowserModule, Title } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { GLOBAL_LOADING } from './shared/constants/loading-controller.constant';
import { LoadingController } from './shared/helpers/loading.controller';
import { AppConfigService } from './shared/services/app-config.service';
import { environment } from 'src/environments/environment';
import {
  HTTP_INTERCEPTORS,
  HttpClient,
  HttpClientModule,
} from '@angular/common/http';
import { ApiInterceptor } from './shared/interceptors/api.interceptor';
import { AuthService } from './shared/services/auth.service';
import { ToastService } from './shared/services/toast.service';
import {
  TranslateLoader,
  TranslateModule,
  TranslateService,
} from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { AUTH_STORAGE } from './shared/constants/auth.constant';
import { RxLocalStorage } from '@rxjs-storage/core';
import { LoadingIndicatorComponent } from './shared/components/loading-indicator/loading-indicator.component';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { UsersService } from './shared/services/users.service';
import { TowersService } from './shared/services/towers.service';
import { IslandsService } from './shared/services/islands.service';
import { SubislandsService } from './shared/services/subislands.service';
import { SubjectsService } from './shared/services/subjects.service';
import { SuppliersService } from './shared/services/suppliers.service';
import { SegmentsService } from './shared/services/segments.service';
import { GlobalBootstrapConfigModule } from './shared/helpers/bootstrap/global-config.module';
import { IconicModule } from './shared/components/iconic/iconic.module';
import { NegotiationTypesService } from './shared/services/negotiation-types.service';
import { ProductsService } from './shared/services/products.service';
import { CustomersService } from './shared/services/customers.service';
import { ProtocolsService } from './shared/services/protocols.service';
import { CacheFactoryService } from './shared/services/cache-factory.service';
import { APP_STORAGE } from './shared/constants/app.constant';
import { WorkscalesService } from './shared/services/workscale.service';
import { WorkloadsService } from './shared/services/workloads.service';
import { DashboardService } from './shared/services/dashboard.service';
import { LegaciesService } from './shared/services/legacies.service';
import { SlaService } from './shared/services/sla.service';
import { ProductivityService } from './shared/services/productivity.service';
import { CutoffDateService } from './shared/services/cutoff-date.service';
import { FlowService } from './shared/services/flow.service';
import { RxEventBus } from '@rxjs-toolkit/eventbus';
import { DealingReasonsService } from './shared/services/dealing-reasons.service';
import { DealingSubreasonsService } from './shared/services/dealing-subreasons.service';
import { DealingSubreason2Service } from './shared/services/dealing-subreason2.service';
import { ProtocolActionsService } from './shared/services/protocol-actions.service';
import { TreatmentService } from './shared/services/treatment.service';
import { FinishWorkReasonService } from './shared/services/finish-work-reason.service';
import { firstValueFrom } from 'rxjs';

registerLocaleData(localePt, 'pt-BR');

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    AppRoutingModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (http: HttpClient) => {
          return new TranslateHttpLoader(http, 'assets/i18n/');
        },
        deps: [HttpClient],
      },
    }),
    NgScrollbarModule.withConfig({
      visibility: 'native',
      appearance: 'compact',
    }),
    LoadingIndicatorComponent,
    IconicModule,
    GlobalBootstrapConfigModule,
  ],
  providers: [
    {
      provide: AppConfigService,
      useFactory: () => {
        return new AppConfigService(environment);
      },
    },
    {
      provide: AUTH_STORAGE,
      useFactory: () => {
        return new RxLocalStorage('vivoflow.auth');
      },
    },
    {
      provide: APP_STORAGE,
      useFactory: () => {
        return new RxLocalStorage('vivoflow.app');
      },
    },
    {
      provide: RxEventBus,
      useFactory: () => {
        return new RxEventBus();
      },
    },
    AuthService,
    UsersService,
    ProtocolsService,
    FlowService,
    TowersService,
    IslandsService,
    SubislandsService,
    SubjectsService,
    LegaciesService,
    NegotiationTypesService,
    ProductsService,
    SegmentsService,
    CustomersService,
    SuppliersService,
    WorkscalesService,
    WorkloadsService,
    ProtocolActionsService,
    DealingReasonsService,
    DealingSubreasonsService,
    DealingSubreason2Service,
    SlaService,
    ProductivityService,
    CutoffDateService,
    DashboardService,
    TreatmentService,
    FinishWorkReasonService,
    ToastService,
    CacheFactoryService,
    {
      provide: GLOBAL_LOADING,
      useFactory: () => new LoadingController(),
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ApiInterceptor,
      multi: true,
    },
    {
      provide: APP_INITIALIZER,
      useFactory: (title: Title, appConfig: AppConfigService) => {
        return () => {
          title.setTitle(appConfig.appName);
        };
      },
      multi: true,
      deps: [Title, AppConfigService],
    },
    {
      provide: APP_INITIALIZER,
      useFactory: (translateService: TranslateService) => {
        return async () => {
          translateService.setDefaultLang('pt');
          await firstValueFrom(translateService.use('pt'));
        };
      },
      multi: true,
      deps: [TranslateService],
    },
    {
      provide: LOCALE_ID,
      useValue: 'pt-BR',
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
