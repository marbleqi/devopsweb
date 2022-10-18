import { NgModule, Type } from '@angular/core';
import { SharedModule } from '@shared';

import { SysSettingComponent } from './setting/setting.component';
import { SysSettingService } from './setting/setting.service';
import { SysRoutingModule } from './sys-routing.module';

const COMPONENTS: Array<Type<void>> = [SysSettingComponent];

@NgModule({
  imports: [SharedModule, SysRoutingModule],
  declarations: COMPONENTS,
  providers: [SysSettingService]
})
export class SysModule {}
