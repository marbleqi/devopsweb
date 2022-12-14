import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ACLGuard } from '@delon/acl';

import { SysSettingComponent, SysReqComponent, SysQueueComponent } from '.';

const routes: Routes = [
  { path: '', redirectTo: 'setting', pathMatch: 'full' },
  { path: 'setting', canActivate: [ACLGuard], data: { guard: [210] }, component: SysSettingComponent },
  { path: 'req', canActivate: [ACLGuard], data: { guard: [220] }, component: SysReqComponent },
  { path: 'queue', canActivate: [ACLGuard], data: { guard: [230] }, component: SysQueueComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SysRoutingModule {}
