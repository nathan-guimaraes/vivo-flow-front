import { InjectionToken } from '@angular/core';
import { IRxStorage } from '@rxjs-storage/core/dist/types/internal/interfaces';

export const APP_STORAGE = new InjectionToken<IRxStorage>('APP_STORAGE');
