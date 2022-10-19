import { NgModule, Type } from '@angular/core';
import { SharedModule } from '@shared';

import { SysSettingService, SysSettingComponent, SysRoutingModule } from '.';

const COMPONENTS: Array<Type<void>> = [SysSettingComponent];

@NgModule({
  imports: [SharedModule, SysRoutingModule],
  declarations: COMPONENTS,
  providers: [SysSettingService]
})
export class SysModule {}
