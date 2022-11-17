import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ACLGuard } from '@delon/acl';

import {
  KongHostComponent,
  KongCertificateComponent,
  KongTargetComponent,
  KongUpstreamComponent,
  KongServiceComponent,
  KongRouteComponent,
  KongConsumerComponent,
  KongPluginComponent,
  KongNewComponent
} from '.';

const routes: Routes = [
  { path: '', redirectTo: 'service', pathMatch: 'full' },
  { path: 'host', canActivate: [ACLGuard], data: { guard: [510] }, component: KongHostComponent },
  { path: 'new', canActivate: [ACLGuard], data: { guard: [530] }, component: KongNewComponent },
  { path: 'service', canActivate: [ACLGuard], data: { guard: [100] }, component: KongServiceComponent },
  { path: 'route', canActivate: [ACLGuard], data: { guard: [520] }, component: KongRouteComponent },
  { path: 'consumer', component: KongConsumerComponent },
  { path: 'certificate', component: KongCertificateComponent },
  { path: 'upstream', component: KongUpstreamComponent },
  { path: 'target', component: KongTargetComponent },
  { path: 'plugin', component: KongPluginComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class KongRoutingModule {}
