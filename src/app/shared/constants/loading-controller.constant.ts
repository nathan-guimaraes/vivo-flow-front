import { InjectionToken } from '@angular/core';
import { LoadingController } from '../helpers/loading.controller';

export const GLOBAL_LOADING = new InjectionToken<LoadingController>(
  'GLOBAL_LOADING'
);
