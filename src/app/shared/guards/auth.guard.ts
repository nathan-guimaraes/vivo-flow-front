import { inject } from '@angular/core';
import { CanActivateFn, Data, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { firstValueFrom, map, timer } from 'rxjs';
import { ToastService } from '../services/toast.service';
import { environment } from 'src/environments/environment';
import { AppConfigService } from '../services/app-config.service';

export const AuthGuard: CanActivateFn = async (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const toastService = inject(ToastService);

  if (!(await checkAuthenticationCode())) {
    return false;
  }

  const authInfo = await firstValueFrom(authService.getAuthInfo());
  const authenticated = authInfo?.isAuthenticated() ?? false;

  let routeAux = route;
  let data: Data = Object.assign({}, routeAux?.data ?? {});
  while (routeAux.firstChild) {
    routeAux = routeAux.firstChild;
    Object.assign(data, routeAux?.data ?? {});
  }

  routeAux = route.parent;
  if (routeAux) {
    data = Object.assign({}, routeAux?.data ?? {}, data);
    while (routeAux.parent) {
      routeAux = routeAux.parent;
      data = Object.assign({}, routeAux?.data ?? {}, data);
    }
  }

  const onlyNotLogged = !!data?.['onlyNotLogged'];
  const onlyLogged = !!data?.['onlyLogged'];
  const role = data?.['role'];

  const defaultRedirectTo = 'home';

  let cannotAccessRoute = false;

  let redirectTo!: string;
  if (authenticated && onlyNotLogged) {
    cannotAccessRoute = true;
    redirectTo = defaultRedirectTo;
  } else if (onlyLogged && !authenticated) {
    cannotAccessRoute = true;

    if (!environment.production) {
      redirectTo = 'auth';
    }
  }

  if (!redirectTo && role) {
    const hasPermission = authService.hasPermissionByProfile(
      authInfo.profileId,
      role
    );
    if (!hasPermission) {
      redirectTo = defaultRedirectTo;
      toastService.error('defaults.errors.forbidden');
    }
  }

  if (redirectTo) {
    router.navigate([redirectTo]);
  }

  return !cannotAccessRoute;
};

async function checkAuthenticationCode() {
  const authService = inject(AuthService);
  const toastService = inject(ToastService);
  const appConfig = inject(AppConfigService);

  let shouldRedirectToLogin = false;
  let msgError: string;

  const searchTokenParam = 'code';
  const url = new URL(location.href);
  const code = url.searchParams.get(searchTokenParam);

  if (environment.production) {
    if (!code) {
      const authenticated = await firstValueFrom(authService.isAuthenticated());
      shouldRedirectToLogin = !authenticated;
    } else {
      try {
        await firstValueFrom(authService.signInByCode(code));
      } catch (response: any) {
        shouldRedirectToLogin = true;
        msgError = response?.error?.messages?.join('\n');
      }
    }
  }

  if (!shouldRedirectToLogin && url.searchParams.has(searchTokenParam)) {
    url.searchParams.delete(searchTokenParam);
    const href = url.toString();
    location.href = href;
    return false;
  }

  if (shouldRedirectToLogin) {
    toastService.error(msgError || 'defaults.errors.notAuthenticated');

    if (appConfig.loginUrl) {
      await firstValueFrom(timer(3000));
      location.href = appConfig.loginUrl;
    }

    return false;
  }

  return true;
}
