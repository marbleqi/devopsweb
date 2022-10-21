import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ACLGuard } from '@delon/acl';

import { DingtalkSettingComponent, DingtalkUserComponent } from '.';

const routes: Routes = [
  { path: 'setting', canActivate: [ACLGuard], data: { guard: [410] }, component: DingtalkSettingComponent },
  { path: 'user', canActivate: [ACLGuard], data: { guard: [430] }, component: DingtalkUserComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DingtalkRoutingModule {}
