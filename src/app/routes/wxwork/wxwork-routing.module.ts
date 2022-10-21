import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ACLGuard } from '@delon/acl';

import { WxworkSettingComponent, WxworkUserComponent } from '.';

const routes: Routes = [
  { path: 'setting', canActivate: [ACLGuard], data: { guard: [310] }, component: WxworkSettingComponent },
  { path: 'user', canActivate: [ACLGuard], data: { guard: [330] }, component: WxworkUserComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WxworkRoutingModule {}
