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
  { path: 'dashboard', canActivate: [ACLGuard], data: { guard: [200] }, component: AuthDashboardComponent },
  { path: 'ability', canActivate: [ACLGuard], data: { guard: [210] }, component: AuthAbilityComponent },
  { path: 'menu', canActivate: [ACLGuard], data: { guard: [210] }, component: AuthMenuComponent },
  { path: 'role', canActivate: [ACLGuard], data: { guard: [210] }, component: AuthRoleComponent },
  { path: 'user', canActivate: [ACLGuard], data: { guard: [210] }, component: AuthUserComponent },
  { path: 'token', canActivate: [ACLGuard], data: { guard: [210] }, component: AuthTokenComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule {}
