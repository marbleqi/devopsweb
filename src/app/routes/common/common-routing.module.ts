import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { CommonHomeComponent } from '.';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: CommonHomeComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CommonRoutingModule {}
