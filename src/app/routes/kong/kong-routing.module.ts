import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { KongHostComponent, KongProjectComponent, KongServiceComponent, KongNewComponent } from '.';

const routes: Routes = [
  { path: 'host', component: KongHostComponent },
  { path: 'project', component: KongProjectComponent },
  { path: 'new', component: KongNewComponent },
  { path: 'service', component: KongServiceComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class KongRoutingModule {}
