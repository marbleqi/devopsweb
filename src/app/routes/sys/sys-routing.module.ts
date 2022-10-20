import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { SysQueueComponent } from './queue/queue.component';
import { SysReqComponent } from './req/req.component';
import { SysSettingComponent } from './setting/setting.component';

const routes: Routes = [
  { path: '', redirectTo: 'setting', pathMatch: 'full' },
  { path: 'setting', component: SysSettingComponent },
  { path: 'queue', component: SysQueueComponent },
  { path: 'req', component: SysReqComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SysRoutingModule {}
