import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subscription, finalize } from 'rxjs';
import { GLOBAL_LOADING } from 'src/app/shared/constants/loading-controller.constant';
import { LoadingController } from 'src/app/shared/helpers/loading.controller';
import { AuthService } from 'src/app/shared/services/auth.service';
import { ToastService } from 'src/app/shared/services/toast.service';
import { UsersService } from 'src/app/shared/services/users.service';

interface LoginFormLike {
  login: FormControl<string>;
}

@Component({
  selector: 'app-login-page',
  templateUrl: 'login.page.html',
  styleUrls: ['login.page.scss'],
})
export class LoginPageComponent implements OnInit, OnDestroy {
  loginForm: FormGroup<LoginFormLike>;

  submitted = false;

  get f() {
    return this.loginForm.controls;
  }

  get continueUrl() {
    return this.route.snapshot.queryParams?.['continueUrl'];
  }

  userDataSource = this.usersService.getAllFakeUsersFromVivo();

  private loginSubscription: Subscription;

  constructor(
    public route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private usersService: UsersService,
    @Inject(GLOBAL_LOADING) private globalLoadingController: LoadingController,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.loginForm = this.formBuilder.group<LoginFormLike>({
      login: this.formBuilder.control<string>(null, [Validators.required]),
    });
  }

  ngOnDestroy(): void {
    this.loginSubscription?.unsubscribe();
  }

  onSubmit() {
    if (this.globalLoadingController.isShown()) {
      return;
    }

    this.submitted = true;
    if (this.loginForm.invalid) {
      return;
    }

    const { login } = this.loginForm.getRawValue();

    this.globalLoadingController.show();
    this.loginSubscription = this.authService
      .signInByLogin(login)
      .pipe(
        finalize(() => {
          this.globalLoadingController.hide();
        })
      )
      .subscribe({
        error: (response) => {
          if (!response) {
            return;
          }

          this.toastService.error('Não foi possível realizar o login!');
        },
      });
  }
}
