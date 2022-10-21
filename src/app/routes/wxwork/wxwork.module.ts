import { NgModule, Type } from '@angular/core';
import { SharedModule } from '@shared';

import {
  WxworkSettingService,
  WxworkUserService,
  WxworkSettingComponent,
  WxworkUserAddComponent,
  WxworkUserEditComponent,
  WxworkUserComponent,
  WxworkRoutingModule
} from '.';

const COMPONENTS: Array<Type<void>> = [WxworkSettingComponent, WxworkUserComponent, WxworkUserAddComponent, WxworkUserEditComponent];

@NgModule({
  imports: [SharedModule, WxworkRoutingModule],
  declarations: COMPONENTS,
  providers: [WxworkSettingService, WxworkUserService]
})
export class WxworkModule {}
