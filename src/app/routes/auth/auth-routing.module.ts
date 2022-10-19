import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import {
  AuthAbilityComponent,
  AuthMenuComponent,
  AuthRoleComponent,
  AuthUserComponent,
  AuthTokenComponent,
  AuthDashboardComponent
} from '.';

const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'ability', component: AuthAbilityComponent },
  { path: 'menu', component: AuthMenuComponent },
  { path: 'role', component: AuthRoleComponent },
  { path: 'user', component: AuthUserComponent },
  { path: 'token', component: AuthTokenComponent },
  { path: 'dashboard', component: AuthDashboardComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule {}
