import { NgModule, Type } from '@angular/core';
import { SharedModule } from '@shared';

import {
  DingtalkSettingService,
  DingtalkUserService,
  DingtalkSettingComponent,
  DingtalkUserAddComponent,
  DingtalkUserEditComponent,
  DingtalkUserComponent,
  DingtalkRoutingModule
} from '.';

const COMPONENTS: Array<Type<void>> = [
  DingtalkSettingComponent,
  DingtalkUserComponent,
  DingtalkUserEditComponent,
  DingtalkUserAddComponent
];

@NgModule({
  imports: [SharedModule, DingtalkRoutingModule],
  declarations: COMPONENTS,
  providers: [DingtalkSettingService, DingtalkUserService]
})
export class DingtalkModule {}
