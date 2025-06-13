import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import {
  Data,
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  Router,
  RouterModule,
} from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { IconicModule } from '../iconic/iconic.module';
import { AuthService } from '../../services/auth.service';
import { filter, map, of, startWith, zip } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Roles } from '../../constants/auth.constant';

interface NavItemLike {
  text: string;
  path?: string;
  role?: any;
}

@Component({
  selector: 'app-header',
  templateUrl: 'header.component.html',
  styleUrls: ['header.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, IconicModule],
})
export class HeaderComponent implements OnInit {
  private destroyRef = inject(DestroyRef);

  navItems: NavItemLike[];

  btnGobackEnabled = false;

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit(): void {
    const navItems: NavItemLike[] = [
      {
        text: 'header.items.home',
        path: 'home',
      },
      {
        text: 'header.items.indicators',
        path: 'indicators',
        role: Roles.Indicators,
      },
      {
        text: 'header.items.protocols',
        path: 'protocols',
        role: Roles.ProtocolsAdmin,
      },
      {
        text: 'header.items.users-admin',
        path: 'users-admin',
        role: Roles.UserAdmin,
      },
      {
        text: 'header.items.system-admin',
        path: 'system-admin',
        role: Roles.SystemAdmin,
      },
      {
        text: 'header.items.protocol-dealings',
        path: 'protocol-dealings',
        role: Roles.DealingProtocols,
      },
    ];

    const observables = navItems.map((item) => {
      if (!item.role) {
        return of(item);
      }

      return this.authService.hasPermission(item.role).pipe(
        map((aBool) => {
          if (!aBool) {
            return null;
          }

          return item;
        })
      );
    });
    zip(...observables)
      .pipe(
        map((list) => {
          this.navItems = list.filter((x) => !!x);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe();

    this.router.events
      .pipe(
        filter(
          (event) =>
            event instanceof NavigationEnd ||
            event instanceof NavigationCancel ||
            event instanceof NavigationError
        ),
        startWith(null),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        this.checkBtnGobackEnabled();
      });
  }

  onBtnSignOutClick() {
    this.authService.signOut();
  }

  onBtnGobackClick() {
    let route = this.router.routerState.root;
    if (route) {
      while (route.firstChild) {
        route = route.firstChild;
      }
    }

    this.router.navigate(['../'], {
      relativeTo: route,
    });
  }

  private checkBtnGobackEnabled() {
    let route = this.router.routerState.root.snapshot;

    let data: Data = Object.assign({}, route?.data ?? {});

    if (route) {
      while (route.firstChild) {
        route = route.firstChild;

        Object.assign(data, route.data ?? {});
      }
    }

    this.btnGobackEnabled = !!data.btnGobackEnabled;
  }
}
