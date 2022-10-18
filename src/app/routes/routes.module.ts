import { NgModule, Type } from '@angular/core';
import { SharedModule } from '@shared';

import { CallbackComponent, UserLoginComponent, RouteRoutingModule } from '.';

const COMPONENTS: Array<Type<void>> = [
  // passport pages
  UserLoginComponent,
  // single pages
  CallbackComponent
];

@NgModule({
  imports: [SharedModule, RouteRoutingModule],
  declarations: COMPONENTS
})
export class RoutesModule {}
