import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginPageComponent } from './login.page';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { FieldModule } from 'src/app/shared/components/field/field.module';
import { SelectBoxModule } from 'src/app/shared/components/select-box/select-box.module';

const routes: Routes = [
  {
    path: '',
    component: LoginPageComponent,
  },
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    ReactiveFormsModule,
    FormsModule,
    TranslateModule,
    FieldModule,
    SelectBoxModule,
  ],
  declarations: [LoginPageComponent],
  exports: [RouterModule],
})
export class LoginPageModule {}
