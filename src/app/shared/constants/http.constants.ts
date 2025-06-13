import { HttpContextToken } from '@angular/common/http';

export const HTTP_SHOW_LOADING = new HttpContextToken<boolean>(() => false);
export const HTTP_SHOW_ERROR = new HttpContextToken<boolean>(() => true);
