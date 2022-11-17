import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ACLGuard } from '@delon/acl';

import {
  AuthDashboardComponent,
  AuthAbilityComponent,
  AuthMenuComponent,
  AuthRoleComponent,
  AuthUserComponent,
  AuthTokenComponent
} from '.';

const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', canActivate: [ACLGuard], data: { guard: [100] }, component: AuthDashboardComponent },
  { path: 'ability', canActivate: [ACLGuard], data: { guard: [110] }, component: AuthAbilityComponent },
  { path: 'menu', canActivate: [ACLGuard], data: { guard: [120] }, component: AuthMenuComponent },
  { path: 'role', canActivate: [ACLGuard], data: { guard: [130] }, component: AuthRoleComponent },
  { path: 'user', canActivate: [ACLGuard], data: { guard: [140] }, component: AuthUserComponent },
  { path: 'token', canActivate: [ACLGuard], data: { guard: [150] }, component: AuthTokenComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule {}
