import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { SysSettingComponent } from './setting/setting.component';

const routes: Routes = [
  { path: '', redirectTo: 'setting', pathMatch: 'full' },
  { path: 'setting', component: SysSettingComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SysRoutingModule {}
