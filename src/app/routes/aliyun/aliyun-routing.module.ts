import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import {
  AliyunAccesskeyComponent,
  AliyunCasComponent,
  AliyunCmsComponent,
  AliyunDnsComponent,
  AliyunDomainComponent,
  AliyunEcsComponent,
  AliyunDashboardComponent
} from '.';

const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: AliyunDashboardComponent },
  { path: 'accesskey', component: AliyunAccesskeyComponent },
  { path: 'cas', component: AliyunCasComponent },
  { path: 'cms', component: AliyunCmsComponent },
  { path: 'domain', component: AliyunDomainComponent },
  { path: 'dns', component: AliyunDnsComponent },
  { path: 'ecs', component: AliyunEcsComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AliyunRoutingModule {}
