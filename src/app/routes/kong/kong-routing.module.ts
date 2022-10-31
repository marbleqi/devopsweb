import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { KongHostComponent } from '.';

const routes: Routes = [{ path: 'host', component: KongHostComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class KongRoutingModule {}
