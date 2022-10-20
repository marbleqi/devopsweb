import { NgModule, Type } from '@angular/core';
import { SharedModule } from '@shared';

import {
  SysSettingService,
  SysReqService,
  SysQueueService,
  SysSettingComponent,
  SysQueueViewComponent,
  SysQueueComponent,
  SysReqViewComponent,
  SysReqComponent,
  SysRoutingModule
} from '.';

const COMPONENTS: Array<Type<void>> = [SysSettingComponent, SysQueueComponent, SysQueueViewComponent, SysReqComponent, SysReqViewComponent];

@NgModule({
  imports: [SharedModule, SysRoutingModule],
  declarations: COMPONENTS,
  providers: [SysSettingService, SysQueueService, SysReqService]
})
export class SysModule {}
